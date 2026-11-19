"use client";

import React, { useState } from "react";
import type { ArchitectureSceneItem, SceneItem } from "../../../src/types/scene";
import type { DiagramNode, DiagramConnection, DiagramNodeVariant, NodeStatusType } from "../../../src/types/diagram";
import { InspectorHeader } from "./InspectorCommon";

interface ArchitectureInspectorProps {
  scene: ArchitectureSceneItem;
  onChange: (updated: Partial<SceneItem>) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

const PRESET_CLOUD_SERVICES = [
  { label: "AWS Lambda ⚡", subtitle: "Serverless Compute", variant: "accent" as const },
  { label: "Amazon S3 🪣", subtitle: "Object Storage", variant: "primary" as const },
  { label: "DynamoDB 🗄️", subtitle: "NoSQL Database", variant: "highlight" as const },
  { label: "API Gateway 🚪", subtitle: "REST API Endpoint", variant: "primary" as const },
  { label: "Amazon EC2 💻", subtitle: "Virtual Machine", variant: "neutral" as const },
  { label: "IAM Role 🛡️", subtitle: "Identity & Access", variant: "primary" as const },
  { label: "AWS KMS 🔑", subtitle: "Encryption Keys", variant: "accent" as const },
  { label: "SQS Queue 📬", subtitle: "Message Broker", variant: "neutral" as const },
  { label: "CloudFront 🌐", subtitle: "CDN & Edge Cache", variant: "primary" as const },
  { label: "Docker Container 🐳", subtitle: "Microservice", variant: "accent" as const },
  { label: "Kubernetes ☸️", subtitle: "Container Orchestration", variant: "primary" as const },
  { label: "PostgreSQL 🐘", subtitle: "Relational Database", variant: "highlight" as const },
  { label: "Redis 🔴", subtitle: "In-Memory Cache", variant: "accent" as const },
];

export const ArchitectureInspector: React.FC<ArchitectureInspectorProps> = ({
  scene,
  onChange,
  onDelete,
  onDuplicate,
}) => {
  const [activeTab, setActiveTab] = useState<"nodes" | "connections">("nodes");

  // Add node handler
  const handleAddNode = (presetIdx: number = 0) => {
    const preset = PRESET_CLOUD_SERVICES[presetIdx] || PRESET_CLOUD_SERVICES[0];
    const newId = `node_${Date.now()}`;
    const newNode: DiagramNode = {
      id: newId,
      label: preset.label,
      subtitle: preset.subtitle,
      variant: preset.variant,
      status: "healthy",
      delayFrames: (scene.nodes.length + 1) * 20,
    };

    onChange({
      nodes: [...scene.nodes, newNode],
    });
  };

  const handleUpdateNode = (id: string, updated: Partial<DiagramNode>) => {
    onChange({
      nodes: scene.nodes.map((n) => (n.id === id ? { ...n, ...updated } : n)),
    });
  };

  const handleDeleteNode = (id: string) => {
    onChange({
      nodes: scene.nodes.filter((n) => n.id !== id),
      // Clean up orphaned connections
      connections: scene.connections.filter(
        (c) => c.sourceId !== id && c.targetId !== id
      ),
    });
  };

  // Connection handlers
  const handleAddConnection = () => {
    if (scene.nodes.length < 2) return;
    const sourceId = scene.nodes[0].id;
    const targetId = scene.nodes[1].id;
    const newConn: DiagramConnection = {
      id: `conn_${Date.now()}`,
      sourceId,
      targetId,
      label: "Invokes",
      showArrow: true,
      animatedDataFlow: true,
      startDelayFrames: 30,
      drawDurationFrames: 20,
    };

    onChange({
      connections: [...scene.connections, newConn],
    });
  };

  const handleUpdateConnection = (id: string, updated: Partial<DiagramConnection>) => {
    onChange({
      connections: scene.connections.map((c) =>
        c.id === id ? { ...c, ...updated } : c
      ),
    });
  };

  const handleDeleteConnection = (id: string) => {
    onChange({
      connections: scene.connections.filter((c) => c.id !== id),
    });
  };

  return (
    <div className="space-y-4">
      <InspectorHeader
        scene={scene}
        onChange={onChange}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
      />

      {/* Orientation layout */}
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Layout Flow
        </label>
        <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-0.5">
          {(["horizontal", "vertical", "custom"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onChange({ layout: mode })}
              className={`rounded px-2.5 py-1 text-xs font-semibold capitalize transition-all cursor-pointer ${
                (scene.layout || "horizontal") === mode
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs: Nodes vs Connections */}
      <div className="flex border-b border-slate-800 text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab("nodes")}
          className={`flex-1 pb-2 border-b-2 text-center transition-colors cursor-pointer ${
            activeTab === "nodes"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Diagram Nodes ({scene.nodes.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("connections")}
          className={`flex-1 pb-2 border-b-2 text-center transition-colors cursor-pointer ${
            activeTab === "connections"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Data Connections ({scene.connections.length})
        </button>
      </div>

      {/* NODES TAB */}
      {activeTab === "nodes" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">
              Cloud Infrastructure Nodes
            </span>
            <div className="flex items-center gap-1.5">
              <select
                onChange={(e) => handleAddNode(parseInt(e.target.value, 10))}
                defaultValue=""
                className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-xs font-bold text-blue-400 cursor-pointer focus:outline-none"
              >
                <option value="" disabled>+ Add Cloud Service</option>
                {PRESET_CLOUD_SERVICES.map((s, idx) => (
                  <option key={idx} value={idx}>
                    + {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {scene.nodes.map((node, idx) => (
            <div
              key={node.id}
              className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">
                  Node #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteNode(node.id)}
                  className="text-slate-500 hover:text-rose-400 transition-colors"
                  title="Remove node"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">Label & Icon</label>
                  <input
                    type="text"
                    value={node.label}
                    onChange={(e) =>
                      handleUpdateNode(node.id, { label: e.target.value })
                    }
                    className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Subtitle</label>
                  <input
                    type="text"
                    value={node.subtitle || ""}
                    onChange={(e) =>
                      handleUpdateNode(node.id, { subtitle: e.target.value })
                    }
                    className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">Variant</label>
                  <select
                    value={node.variant || "primary"}
                    onChange={(e) =>
                      handleUpdateNode(node.id, {
                        variant: e.target.value as DiagramNodeVariant,
                      })
                    }
                    className="w-full rounded border border-slate-700 bg-slate-950 px-1.5 py-1 text-xs text-white"
                  >
                    <option value="primary">Primary (Blue)</option>
                    <option value="accent">Accent (Purple)</option>
                    <option value="highlight">Highlight (Gold)</option>
                    <option value="neutral">Neutral (Slate)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Status</label>
                  <select
                    value={node.status || "healthy"}
                    onChange={(e) =>
                      handleUpdateNode(node.id, {
                        status: e.target.value as NodeStatusType,
                      })
                    }
                    className="w-full rounded border border-slate-700 bg-slate-950 px-1.5 py-1 text-xs text-white"
                  >
                    <option value="healthy">Healthy 🟢</option>
                    <option value="active">Active ⚡</option>
                    <option value="warning">Warning 🟡</option>
                    <option value="error">Error 🔴</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Delay Frames</label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={node.delayFrames || 0}
                    onChange={(e) =>
                      handleUpdateNode(node.id, {
                        delayFrames: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CONNECTIONS TAB */}
      {activeTab === "connections" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">
              Data Flow Links
            </span>
            <button
              type="button"
              onClick={handleAddConnection}
              disabled={scene.nodes.length < 2}
              className="rounded-lg bg-blue-600 px-2 py-1 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-40 cursor-pointer"
            >
              + Add Connection
            </button>
          </div>

          {scene.connections.map((conn, idx) => (
            <div
              key={conn.id}
              className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">
                  Link #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleDeleteConnection(conn.id)}
                  className="text-slate-500 hover:text-rose-400 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">Source Node</label>
                  <select
                    value={conn.sourceId}
                    onChange={(e) =>
                      handleUpdateConnection(conn.id, { sourceId: e.target.value })
                    }
                    className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white"
                  >
                    {scene.nodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">Target Node</label>
                  <select
                    value={conn.targetId}
                    onChange={(e) =>
                      handleUpdateConnection(conn.id, { targetId: e.target.value })
                    }
                    className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white"
                  >
                    {scene.nodes.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400">Flow Action / Label</label>
                  <input
                    type="text"
                    value={conn.label || ""}
                    onChange={(e) =>
                      handleUpdateConnection(conn.id, { label: e.target.value })
                    }
                    placeholder="e.g. Invokes, Queries, Saves"
                    className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white"
                  />
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={conn.animatedDataFlow !== false}
                      onChange={(e) =>
                        handleUpdateConnection(conn.id, {
                          animatedDataFlow: e.target.checked,
                        })
                      }
                      className="rounded border-slate-700"
                    />
                    <span>Animated Flow</span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
