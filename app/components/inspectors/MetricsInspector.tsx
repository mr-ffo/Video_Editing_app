"use client";

import React from "react";
import type { MetricsSceneItem, SceneItem } from "../../../src/types/scene";
import type { MetricItem } from "../../../src/scenes/MetricsScene";
import { InspectorHeader } from "./InspectorCommon";

interface MetricsInspectorProps {
  scene: MetricsSceneItem;
  onChange: (updated: Partial<SceneItem>) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

export const MetricsInspector: React.FC<MetricsInspectorProps> = ({
  scene,
  onChange,
  onDelete,
  onDuplicate,
}) => {
  const handleAddMetric = () => {
    const newMetric: MetricItem = {
      label: "Cache Hit Ratio",
      to: 98.4,
      suffix: "%",
      decimals: 1,
      trend: "up",
      trendLabel: "+4.2%",
      variant: "success",
      icon: "⚡",
    };

    onChange({
      metrics: [...scene.metrics, newMetric],
    });
  };

  const handleUpdateMetric = (index: number, updated: Partial<MetricItem>) => {
    const updatedMetrics = [...scene.metrics];
    updatedMetrics[index] = { ...updatedMetrics[index], ...updated };
    onChange({ metrics: updatedMetrics });
  };

  const handleDeleteMetric = (index: number) => {
    onChange({
      metrics: scene.metrics.filter((_, idx) => idx !== index),
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

      <div>
        <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
          Subtitle / Scope
        </label>
        <input
          type="text"
          value={scene.subtitle || ""}
          onChange={(e) => onChange({ subtitle: e.target.value })}
          placeholder="e.g. Production AWS Environment Metrics"
          className="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            KPI Cards ({scene.metrics.length})
          </span>
          <button
            type="button"
            onClick={handleAddMetric}
            className="rounded-lg bg-blue-600 px-2 py-1 text-xs font-bold text-white hover:bg-blue-500 cursor-pointer"
          >
            + Add Metric Card
          </button>
        </div>

        {scene.metrics.map((metric, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 space-y-2 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">
                Card #{idx + 1}
              </span>
              <button
                type="button"
                onClick={() => handleDeleteMetric(idx)}
                className="text-slate-500 hover:text-rose-400 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400">Card Label</label>
                <input
                  type="text"
                  value={metric.label}
                  onChange={(e) =>
                    handleUpdateMetric(idx, { label: e.target.value })
                  }
                  className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400">Target Value</label>
                <input
                  type="number"
                  step="any"
                  value={metric.to}
                  onChange={(e) =>
                    handleUpdateMetric(idx, {
                      to: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-400">Suffix</label>
                <input
                  type="text"
                  value={metric.suffix || ""}
                  onChange={(e) =>
                    handleUpdateMetric(idx, { suffix: e.target.value })
                  }
                  placeholder="%, ms, req/s"
                  className="w-full rounded border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400">Trend</label>
                <select
                  value={metric.trend || "neutral"}
                  onChange={(e) =>
                    handleUpdateMetric(idx, {
                      trend: e.target.value as "up" | "down" | "neutral",
                    })
                  }
                  className="w-full rounded border border-slate-700 bg-slate-950 px-1.5 py-1 text-xs text-white"
                >
                  <option value="up">Up ↗️</option>
                  <option value="down">Down ↘️</option>
                  <option value="neutral">Neutral ➡️</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400">Variant</label>
                <select
                  value={metric.variant || "primary"}
                  onChange={(e) =>
                    handleUpdateMetric(idx, {
                      variant: e.target.value as
                        | "primary"
                        | "accent"
                        | "success"
                        | "warning",
                    })
                  }
                  className="w-full rounded border border-slate-700 bg-slate-950 px-1.5 py-1 text-xs text-white"
                >
                  <option value="success">Success (Green)</option>
                  <option value="primary">Primary (Blue)</option>
                  <option value="accent">Accent (Purple)</option>
                  <option value="warning">Warning (Gold)</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
