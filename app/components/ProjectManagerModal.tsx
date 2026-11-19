"use client";

import React, { useState } from "react";
import type { StudioProject } from "../../src/types/project";

interface ProjectManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: StudioProject[];
  activeProjectId: string;
  onOpenProject: (id: string) => void;
  onCreateProject: (name?: string) => void;
  onRenameProject: (id: string, newName: string) => void;
  onDuplicateProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onExportProject: (project: StudioProject) => void;
  onImportProject: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProjectManagerModal: React.FC<ProjectManagerModalProps> = ({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  onOpenProject,
  onCreateProject,
  onRenameProject,
  onDuplicateProject,
  onDeleteProject,
  onExportProject,
  onImportProject,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleStartRename = (project: StudioProject) => {
    setEditingId(project.id);
    setEditName(project.name);
  };

  const handleSaveRename = (id: string) => {
    if (editName.trim()) {
      onRenameProject(id, editName.trim());
    }
    setEditingId(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      onCreateProject(newProjectName.trim());
      setNewProjectName("");
      setIsCreating(false);
    }
  };

  const formatTimestamp = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-4 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 font-extrabold text-white text-sm shadow-md shadow-blue-500/20">
              S
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Project Library</h2>
              <p className="text-xs text-slate-400">
                {projects.length} saved {projects.length === 1 ? "project" : "projects"} • Local storage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={onImportProject}
              accept=".json,application/json"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              📥 Import JSON
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition-colors shadow-md shadow-blue-600/30 cursor-pointer"
            >
              + New Project
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Quick Create Bar */}
        {isCreating && (
          <form
            onSubmit={handleCreateSubmit}
            className="flex items-center gap-2 border-b border-slate-800 bg-blue-950/20 px-6 py-3 animate-fadeIn"
          >
            <input
              type="text"
              autoFocus
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="e.g. AWS Lambda Deep Dive Ep. 2"
              className="flex-1 rounded-xl border border-blue-500/50 bg-slate-900 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500 transition-colors"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="rounded-xl border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
          </form>
        )}

        {/* Project List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {projects.map((project) => {
            const isActive = project.id === activeProjectId;
            const isEditing = editingId === project.id;

            return (
              <div
                key={project.id}
                className={`group rounded-2xl border p-4 transition-all ${
                  isActive
                    ? "border-blue-500/50 bg-blue-950/20 shadow-lg shadow-blue-950/40"
                    : "border-slate-800/80 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveRename(project.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          autoFocus
                          className="rounded-lg border border-blue-500 bg-slate-950 px-2 py-1 text-xs text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRename(project.id)}
                          className="text-xs font-bold text-blue-400 hover:text-blue-300"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="text-xs text-slate-400 hover:text-slate-200"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h3
                          onClick={() => onOpenProject(project.id)}
                          className="font-bold text-sm text-white hover:text-blue-400 transition-colors cursor-pointer truncate"
                          title="Click to open this project"
                        >
                          {project.name}
                        </h3>
                        {isActive && (
                          <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-400 border border-blue-500/30">
                            Active
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                      <span>
                        {project.config.compositionId === "VideoOverlay"
                          ? "📹 Video Overlay"
                          : "📊 Explainer"}
                      </span>
                      <span>•</span>
                      <span>{project.config.durationMinutes}m runtime</span>
                      <span>•</span>
                      <span>Updated {formatTimestamp(project.updatedAt)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                    {!isActive && (
                      <button
                        type="button"
                        onClick={() => onOpenProject(project.id)}
                        className="rounded-xl bg-blue-600/90 px-2.5 py-1 text-xs font-bold text-white hover:bg-blue-500 transition-colors"
                      >
                        Open
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleStartRename(project)}
                      title="Rename project"
                      className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs"
                    >
                      ✏️
                    </button>

                    <button
                      type="button"
                      onClick={() => onDuplicateProject(project.id)}
                      title="Duplicate project"
                      className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs"
                    >
                      📋
                    </button>

                    <button
                      type="button"
                      onClick={() => onExportProject(project)}
                      title="Export project JSON"
                      className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs"
                    >
                      📤
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteProject(project.id)}
                      title="Delete project"
                      disabled={projects.length <= 1}
                      className="rounded-lg p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
