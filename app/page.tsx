"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { PlayerRef } from "@remotion/player";
import { Dropzone } from "./components/Dropzone";
import { PlayerPreview } from "./components/PlayerPreview";
import { SidebarControls, type StudioConfig } from "./components/SidebarControls";
import { ExportModal } from "./components/ExportModal";
import { ProjectManagerModal } from "./components/ProjectManagerModal";
import { EditorToolbar } from "./components/editor/EditorToolbar";
import { SceneNavigator } from "./components/editor/SceneNavigator";
import { LayerNavigator } from "./components/editor/LayerNavigator";
import { TemplateNavigator } from "./components/editor/TemplateNavigator";
import { SceneTimeline } from "./components/editor/SceneTimeline";
import { SceneInspector } from "./components/inspectors/SceneInspector";
import {
  loadProjectsFromStorage,
  saveProjectsToStorage,
  createNewProject,
  duplicateProject,
  exportProjectToJson,
  importProjectFromJson,
  defaultInitialConfig,
} from "../src/lib/projectStorage";
import type { StudioProject } from "../src/types/project";
import type { AspectRatio, SceneItem, SceneTransition } from "../src/types/scene";
import { TEMPLATE_PROJECTS, type ProjectTemplate } from "../src/data/sceneTemplates";

export default function StudioDashboard() {
  const router = useRouter();

  // Project Management State
  const [projects, setProjects] = useState<StudioProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>("");
  const [isProjectManagerOpen, setIsProjectManagerOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Editor View Mode
  const [editorMode, setEditorMode] = useState<"scenes" | "overlays">("scenes");

  // Left Panel Sub-tab
  const [leftPanelTab, setLeftPanelTab] = useState<"scenes" | "layers" | "templates">("scenes");

  // Canvas Viewport & Guide States
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [showSafeArea, setShowSafeArea] = useState<boolean>(false);
  const [canvasEditMode, setCanvasEditMode] = useState<boolean>(true);

  // Player & Timeline State
  const playerRef = useRef<PlayerRef>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Undo / Redo History Stack for Scenes
  const [history, setHistory] = useState<SceneItem[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // File upload input ref for importing projects
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Initial Load: Read projects and active project from LocalStorage
  useEffect(() => {
    try {
      const { projects: loadedProjects, activeProjectId: loadedActiveId } =
        loadProjectsFromStorage();

      setProjects(loadedProjects);
      setActiveProjectId(loadedActiveId);
      setSaveStatus("Loaded");
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (e) {
      console.warn("Failed to load projects from storage:", e);
    } finally {
      setHasHydrated(true);
    }
  }, []);

  // Active Project Reference
  const activeProject: StudioProject =
    projects.find((p) => p.id === activeProjectId) ||
    projects[0] ||
    createNewProject("Default Project");

  // Active Scenes & Aspect Ratio
  const currentScenes: SceneItem[] =
    activeProject.scenes && activeProject.scenes.length > 0
      ? activeProject.scenes
      : TEMPLATE_PROJECTS[0].scenes;

  const currentAspectRatio: AspectRatio = activeProject.aspectRatio || "16:9";

  // Select first scene by default if none selected
  useEffect(() => {
    if (!selectedSceneId && currentScenes.length > 0) {
      setSelectedSceneId(currentScenes[0].id);
    }
  }, [selectedSceneId, currentScenes]);

  // Push to history when scenes change
  const pushHistory = useCallback((scenes: SceneItem[]) => {
    setHistory((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      return [...sliced, JSON.parse(JSON.stringify(scenes))];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  // Current config driving the player and sidebar
  const config: StudioConfig = {
    ...defaultInitialConfig,
    ...(activeProject.config || {}),
    compositionId:
      editorMode === "scenes"
        ? "DynamicProject"
        : activeProject.config?.compositionId || "VideoOverlay",
  };

  // 2. Debounced Autosave: Persist updated project configuration to LocalStorage
  useEffect(() => {
    if (!hasHydrated || projects.length === 0) return;

    const timer = setTimeout(() => {
      saveProjectsToStorage(projects, activeProjectId);
      setSaveStatus("Saved");
      setTimeout(() => setSaveStatus(null), 1500);
    }, 400);

    return () => clearTimeout(timer);
  }, [projects, activeProjectId, hasHydrated]);

  // Update scenes on active project
  const handleUpdateScenes = useCallback(
    (newScenes: SceneItem[], recordHistory: boolean = true) => {
      if (recordHistory) {
        pushHistory(newScenes);
      }
      setProjects((prev) =>
        prev.map((p) =>
          p.id === activeProjectId
            ? {
                ...p,
                updatedAt: new Date().toISOString(),
                scenes: newScenes,
              }
            : p
        )
      );
    },
    [activeProjectId, pushHistory]
  );

  // Undo / Redo Handlers
  const handleUndo = () => {
    if (historyIndex > 0) {
      const targetScenes = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      handleUpdateScenes(targetScenes, false);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const targetScenes = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      handleUpdateScenes(targetScenes, false);
    }
  };

  // Update aspect ratio on active project
  const handleAspectRatioChange = (newRatio: AspectRatio) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProjectId
          ? {
              ...p,
              updatedAt: new Date().toISOString(),
              aspectRatio: newRatio,
            }
          : p
      )
    );
  };

  // Update overlay configuration on active project
  const handleUpdateConfig = (updated: Partial<StudioConfig>) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProjectId
          ? {
              ...p,
              updatedAt: new Date().toISOString(),
              config: {
                ...(p.config || defaultInitialConfig),
                ...updated,
              } as StudioConfig,
            }
          : p
      )
    );
  };

  // Video File Selection handler
  const handleVideoSelected = (fileUrl: string, fileName: string) => {
    const updatedConfig: StudioConfig = {
      ...config,
      videoUrl: fileUrl,
      videoFileName: fileName,
    };
    handleUpdateConfig(updatedConfig);
  };

  // Scene Operations
  const handleAddScene = (newScene: SceneItem) => {
    const updated = [...currentScenes, newScene];
    handleUpdateScenes(updated);
    setSelectedSceneId(newScene.id);
    setSelectedElementId(null);
  };

  const handleDuplicateScene = (id: string) => {
    const targetIdx = currentScenes.findIndex((s) => s.id === id);
    if (targetIdx === -1) return;
    const target = currentScenes[targetIdx];
    const cloned: SceneItem = {
      ...JSON.parse(JSON.stringify(target)),
      id: `scene-${target.type}-${Date.now()}`,
      title: `${target.title} (Copy)`,
    };
    const updated = [...currentScenes];
    updated.splice(targetIdx + 1, 0, cloned);
    handleUpdateScenes(updated);
    setSelectedSceneId(cloned.id);
    setSelectedElementId(null);
  };

  const handleDeleteScene = (id: string) => {
    if (currentScenes.length <= 1) {
      alert("Projects must have at least one scene.");
      return;
    }
    const updated = currentScenes.filter((s) => s.id !== id);
    handleUpdateScenes(updated);
    if (selectedSceneId === id) {
      setSelectedSceneId(updated[0]?.id || null);
    }
    setSelectedElementId(null);
  };

  const handleToggleVisibility = (id: string) => {
    const updated = currentScenes.map((s) =>
      s.id === id ? { ...s, hidden: !s.hidden } : s
    );
    handleUpdateScenes(updated);
  };

  const handleUpdateSelectedScene = (updatedFields: Partial<SceneItem>) => {
    if (!selectedSceneId) return;
    const updated = currentScenes.map((s) =>
      s.id === selectedSceneId ? ({ ...s, ...updatedFields } as SceneItem) : s
    );
    handleUpdateScenes(updated);
  };

  const handleUpdateSceneDuration = (sceneId: string, newDurationFrames: number) => {
    const clamped = Math.max(15, Math.min(1800, newDurationFrames));
    const updated = currentScenes.map((s) =>
      s.id === sceneId ? { ...s, durationFrames: clamped } : s
    );
    handleUpdateScenes(updated);
  };

  const handleUpdateSceneTransition = (sceneId: string, transition: SceneTransition) => {
    const updated = currentScenes.map((s) =>
      s.id === sceneId ? { ...s, transition } : s
    );
    handleUpdateScenes(updated);
  };

  const handleInsertSceneFromTemplate = (scene: SceneItem) => {
    const updated = [...currentScenes, scene];
    handleUpdateScenes(updated);
    setSelectedSceneId(scene.id);
    setSelectedElementId(null);
  };

  const handleApplyProjectTemplate = (tpl: ProjectTemplate) => {
    if (
      window.confirm(
        `Load project template "${tpl.name}"? This will replace the current scenes.`
      )
    ) {
      handleUpdateScenes(tpl.scenes);
      handleAspectRatioChange(tpl.aspectRatio);
      setSelectedSceneId(tpl.scenes[0]?.id || null);
      setSelectedElementId(null);
    }
  };

  const handleApplyTemplate = (templateId: string) => {
    const found = TEMPLATE_PROJECTS.find((t) => t.id === templateId);
    if (found) {
      handleApplyProjectTemplate(found);
    }
  };

  // Player Controls
  const handleTogglePlay = () => {
    const player = playerRef.current;
    if (!player) return;
    if (player.isPlaying()) {
      player.pause();
    } else {
      player.play();
    }
  };

  const handleSeek = (frame: number) => {
    const player = playerRef.current;
    if (!player) return;
    player.seekTo(frame);
    setCurrentFrame(frame);
  };

  const handleStepFrames = (delta: number) => {
    const player = playerRef.current;
    if (!player) return;
    const target = Math.max(0, currentFrame + delta);
    player.seekTo(target);
    setCurrentFrame(target);
  };

  // Keyboard Navigation & Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in form inputs
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        handleStepFrames(e.shiftKey ? -10 : -1);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        handleStepFrames(e.shiftKey ? 10 : 1);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Switch active project
  const handleOpenProject = (id: string) => {
    setActiveProjectId(id);
    setIsProjectManagerOpen(false);
    setSelectedElementId(null);
    setSaveStatus("Project Loaded");
    setTimeout(() => setSaveStatus(null), 2000);
  };

  // Create new project
  const handleCreateProject = (name?: string) => {
    const newProj = createNewProject(name || "New Project");
    setProjects((prev) => [newProj, ...prev]);
    setActiveProjectId(newProj.id);
    setSelectedSceneId(newProj.scenes?.[0]?.id || null);
    setSelectedElementId(null);
    setSaveStatus("Created");
    setTimeout(() => setSaveStatus(null), 2000);
  };

  // Rename a project
  const handleRenameProject = (id: string, newName: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, name: newName, updatedAt: new Date().toISOString() }
          : p
      )
    );
    setSaveStatus("Renamed");
    setTimeout(() => setSaveStatus(null), 2000);
  };

  // Duplicate project
  const handleDuplicateProject = (id: string) => {
    const source = projects.find((p) => p.id === id);
    if (!source) return;

    const cloned = duplicateProject(source);
    setProjects((prev) => [cloned, ...prev]);
    setActiveProjectId(cloned.id);
    setSelectedSceneId(cloned.scenes?.[0]?.id || null);
    setSelectedElementId(null);
    setSaveStatus("Duplicated");
    setTimeout(() => setSaveStatus(null), 2000);
  };

  // Delete project
  const handleDeleteProject = (id: string) => {
    if (projects.length <= 1) {
      alert("Cannot delete the only remaining project.");
      return;
    }

    const toDelete = projects.find((p) => p.id === id);
    if (
      !window.confirm(
        `Are you sure you want to permanently delete "${toDelete?.name || "this project"}"?`
      )
    ) {
      return;
    }

    const remaining = projects.filter((p) => p.id !== id);
    setProjects(remaining);

    if (activeProjectId === id) {
      setActiveProjectId(remaining[0].id);
      setSelectedSceneId(remaining[0].scenes?.[0]?.id || null);
      setSelectedElementId(null);
    }

    setSaveStatus("Deleted");
    setTimeout(() => setSaveStatus(null), 2000);
  };

  // Export project JSON
  const handleExportProject = (project: StudioProject) => {
    const jsonStr = exportProjectToJson(project);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${project.name.toLowerCase().replace(/[^a-z0-9_-]/g, "_")}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setSaveStatus("Exported");
    setTimeout(() => setSaveStatus(null), 2000);
  };

  // Import project JSON
  const handleImportProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = importProjectFromJson(text);

        setProjects((prev) => [imported, ...prev]);
        setActiveProjectId(imported.id);
        setSelectedSceneId(imported.scenes?.[0]?.id || null);
        setSelectedElementId(null);
        setSaveStatus("Imported");
        setTimeout(() => setSaveStatus(null), 2500);
      } catch (err) {
        alert(
          err instanceof Error
            ? err.message
            : "Failed to parse project JSON file."
        );
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Handle Logout
  const handleLogout = async () => {
    if (window.confirm("Sign out of Syntax Ops Studio?")) {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } finally {
        router.push("/login");
        router.refresh();
      }
    }
  };

  // Currently selected scene
  const selectedScene =
    currentScenes.find((s) => s.id === selectedSceneId) || currentScenes[0] || null;

  return (
    <div className="flex min-h-screen flex-col bg-[#080d1a] text-slate-100">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-6 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 font-extrabold text-white shadow-lg shadow-blue-500/20">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white">SyntaxOps</span>
              <span className="rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/20">
                Studio
              </span>
              {saveStatus && (
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-blue-300 border border-slate-700 animate-fadeIn">
                  ✓ {saveStatus}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400">Technical Video Production Studio</p>
          </div>
        </div>

        {/* Project Switcher Bar */}
        <div className="hidden sm:flex items-center gap-2 rounded-2xl border border-slate-800/80 bg-slate-900/60 px-3 py-1.5">
          <button
            type="button"
            onClick={() => setIsProjectManagerOpen(true)}
            className="flex items-center gap-2 text-xs font-bold text-white hover:text-blue-400 transition-colors cursor-pointer"
            title="Open project manager"
          >
            <span>📁</span>
            <span className="max-w-[180px] truncate">{activeProject.name}</span>
            <span className="text-[10px] text-slate-500">▼</span>
          </button>
          <span className="text-slate-700">|</span>
          <button
            type="button"
            onClick={() => handleCreateProject()}
            title="Create new project"
            className="text-xs text-slate-400 hover:text-blue-400 transition-colors cursor-pointer"
          >
            + New
          </button>
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportProject}
            accept=".json,application/json"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => setIsProjectManagerOpen(true)}
            title="Manage saved projects"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
          >
            📁 Projects ({projects.length})
          </button>

          <button
            type="button"
            onClick={() => handleExportProject(activeProject)}
            title="Export active project as JSON"
            className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
          >
            📤 Export JSON
          </button>

          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition-all cursor-pointer"
          >
            🚀 Export on Lambda
          </button>

          <button
            type="button"
            onClick={handleLogout}
            title="Sign out of Syntax Ops Studio"
            className="rounded-xl border border-slate-800 bg-slate-900/40 p-2 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-all cursor-pointer"
          >
            🚪
          </button>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <main className="flex-1 flex flex-col gap-4 p-4 lg:p-6">
        {/* Editor Toolbar (Aspect Ratio, Mode Switch, Undo/Redo, Canvas Toggles, Zoom) */}
        <EditorToolbar
          aspectRatio={currentAspectRatio}
          onAspectRatioChange={handleAspectRatioChange}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onUndo={handleUndo}
          onRedo={handleRedo}
          editorMode={editorMode}
          onEditorModeChange={setEditorMode}
          zoomLevel={zoomLevel}
          onZoomChange={setZoomLevel}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(!showGrid)}
          showSafeArea={showSafeArea}
          onToggleSafeArea={() => setShowSafeArea(!showSafeArea)}
          canvasEditMode={canvasEditMode}
          onToggleCanvasEditMode={() => setCanvasEditMode(!canvasEditMode)}
        />

        {editorMode === "scenes" ? (
          /* PROFESSIONAL 4-PANEL SCENE EDITOR WORKSPACE */
          <div className="flex flex-col gap-4 flex-1">
            {/* Top Workspace Section: 3-Column Panels (Left Navigator, Center Preview, Right Inspector) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 flex-1 min-h-[580px]">
              {/* Left Panel: Tabbed Navigator (Scenes, Layers, Templates) - 3 Cols */}
              <div className="xl:col-span-3 flex flex-col rounded-2xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-xl p-4 shadow-2xl">
                {/* Left Panel Tabs Header */}
                <div className="flex items-center gap-1 border-b border-slate-800/80 pb-3 mb-3">
                  <button
                    type="button"
                    onClick={() => setLeftPanelTab("scenes")}
                    className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      leftPanelTab === "scenes"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Scenes ({currentScenes.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeftPanelTab("layers")}
                    className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      leftPanelTab === "layers"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Layers
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeftPanelTab("templates")}
                    className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      leftPanelTab === "templates"
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Presets
                  </button>
                </div>

                {/* Left Panel Tab Content */}
                <div className="flex-1 overflow-y-auto">
                  {leftPanelTab === "scenes" && (
                    <SceneNavigator
                      scenes={currentScenes}
                      selectedSceneId={selectedSceneId}
                      onSelectScene={(id) => {
                        setSelectedSceneId(id);
                        setSelectedElementId(null);
                      }}
                      onAddScene={handleAddScene}
                      onReorderScenes={handleUpdateScenes}
                      onDuplicateScene={handleDuplicateScene}
                      onDeleteScene={handleDeleteScene}
                      onToggleVisibility={handleToggleVisibility}
                      onApplyTemplate={handleApplyTemplate}
                    />
                  )}

                  {leftPanelTab === "layers" && (
                    selectedScene ? (
                      <LayerNavigator
                        scene={selectedScene}
                        selectedElementId={selectedElementId}
                        onSelectElement={setSelectedElementId}
                        onUpdateScene={handleUpdateSelectedScene}
                      />
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-500">
                        Select a scene to view its element layer hierarchy.
                      </div>
                    )
                  )}

                  {leftPanelTab === "templates" && (
                    <TemplateNavigator
                      onInsertScene={handleInsertSceneFromTemplate}
                      onApplyProjectTemplate={handleApplyProjectTemplate}
                    />
                  )}
                </div>
              </div>

              {/* Center Panel: Remotion Viewport & Direct Manipulation Canvas - 6 Cols */}
              <div className="xl:col-span-6 flex flex-col items-center justify-center rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 backdrop-blur-xl">
                <PlayerPreview
                  config={config}
                  scenes={currentScenes}
                  aspectRatio={currentAspectRatio}
                  selectedScene={selectedScene}
                  selectedElementId={selectedElementId}
                  onSelectElement={setSelectedElementId}
                  onUpdateScene={handleUpdateSelectedScene}
                  onRecordHistory={() => pushHistory(currentScenes)}
                  showGrid={showGrid}
                  showSafeArea={showSafeArea}
                  canvasEditMode={canvasEditMode}
                  zoomLevel={zoomLevel}
                  playerRef={playerRef}
                  onFrameUpdate={setCurrentFrame}
                  onPlayStateChange={setIsPlaying}
                />
              </div>

              {/* Right Panel: Contextual Properties, Transform, Typography & Motion - 3 Cols */}
              <div className="xl:col-span-3 flex flex-col rounded-2xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-xl p-4 shadow-2xl">
                <div className="border-b border-slate-800/80 pb-3 mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Inspector
                    </h3>
                    <p className="text-[10px] text-slate-400">Contextual properties & transform</p>
                  </div>
                  {selectedScene && (
                    <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 uppercase">
                      {selectedScene.type}
                    </span>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto">
                  <SceneInspector
                    scene={selectedScene}
                    onUpdateScene={handleUpdateSelectedScene}
                    onDeleteScene={() => selectedScene && handleDeleteScene(selectedScene.id)}
                    onDuplicateScene={() => selectedScene && handleDuplicateScene(selectedScene.id)}
                    aspectRatio={currentAspectRatio}
                    selectedElementId={selectedElementId}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Panel: Precision Scene Timeline spanning full width */}
            <div className="w-full">
              <SceneTimeline
                scenes={currentScenes}
                currentFrame={currentFrame}
                isPlaying={isPlaying}
                selectedSceneId={selectedSceneId}
                onSelectScene={(id) => {
                  setSelectedSceneId(id);
                  setSelectedElementId(null);
                }}
                onSeek={handleSeek}
                onTogglePlay={handleTogglePlay}
                onStepFrames={handleStepFrames}
                onUpdateSceneDuration={handleUpdateSceneDuration}
                onUpdateSceneTransition={handleUpdateSceneTransition}
              />
            </div>
          </div>
        ) : (
          /* BROADCAST OVERLAYS WORKSPACE (Preserves legacy workflow) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
            <div className="lg:col-span-8 flex flex-col gap-5">
              {config.compositionId === "VideoOverlay" && (
                <Dropzone
                  currentFileName={config.videoFileName}
                  onVideoSelected={handleVideoSelected}
                />
              )}

              <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 backdrop-blur-xl">
                <PlayerPreview
                  config={config}
                  playerRef={playerRef}
                  onFrameUpdate={setCurrentFrame}
                  onPlayStateChange={setIsPlaying}
                />
              </div>
            </div>

            <div className="lg:col-span-4 rounded-2xl border border-slate-800/80 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
              <div className="border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white">Broadcast Parameters</h2>
                  <p className="text-xs text-slate-400">Tune overlays, pacing, and keywords</p>
                </div>
                <span className="text-[11px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20 max-w-[120px] truncate">
                  {activeProject.name}
                </span>
              </div>
              <SidebarControls config={config} onChange={handleUpdateConfig} />
            </div>
          </div>
        )}
      </main>

      {/* Project Manager Modal */}
      <ProjectManagerModal
        isOpen={isProjectManagerOpen}
        onClose={() => setIsProjectManagerOpen(false)}
        projects={projects}
        activeProjectId={activeProjectId}
        onOpenProject={handleOpenProject}
        onCreateProject={handleCreateProject}
        onRenameProject={handleRenameProject}
        onDuplicateProject={handleDuplicateProject}
        onDeleteProject={handleDeleteProject}
        onExportProject={handleExportProject}
        onImportProject={handleImportProject}
      />

      {/* Cloud Render Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        config={config}
        scenes={currentScenes}
        aspectRatio={currentAspectRatio}
      />
    </div>
  );
}
