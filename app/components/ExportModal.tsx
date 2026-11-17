"use client";

import React, { useState } from "react";
import type { StudioConfig } from "./SidebarControls";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: StudioConfig;
}

type ExportState = "idle" | "uploading" | "rendering" | "completed" | "error";

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  config,
}) => {
  const [state, setState] = useState<ExportState>("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const startRender = async () => {
    try {
      setState("uploading");
      setStatusMessage("Preparing video assets and render payload...");
      setProgressPercent(5);
      setErrorMessage(null);

      let finalVideoUrl = config.videoUrl;

      // If user selected a local blob file, upload to S3 first
      if (config.videoUrl.startsWith("blob:")) {
        setStatusMessage("Uploading local video to Amazon S3...");
        setProgressPercent(15);

        // Fetch the blob
        const blob = await fetch(config.videoUrl).then((r) => r.blob());
        const ext = config.videoFileName.split(".").pop() || "mp4";

        // Request presigned S3 upload URL
        const uploadRes = await fetch("/api/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: config.videoFileName || `video-${Date.now()}.${ext}`,
            contentType: blob.type || "video/mp4",
          }),
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || "Failed to get S3 upload URL");
        }

        // Upload raw bytes directly to S3 (bypassing Vercel's 4.5MB limit)
        const s3UploadRes = await fetch(uploadData.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": blob.type || "video/mp4" },
          body: blob,
        });

        if (!s3UploadRes.ok) {
          throw new Error("Failed to upload video to S3 storage");
        }

        finalVideoUrl = uploadData.publicUrl;
        setProgressPercent(30);
      }

      // 2. Dispatch Render to AWS Lambda
      setState("rendering");
      setStatusMessage("Dispatching render job to AWS Lambda cluster...");
      setProgressPercent(35);

      const renderRes = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          compositionId: config.compositionId,
          durationMinutes: config.durationMinutes,
          inputProps: {
            durationMinutes: config.durationMinutes,
            videoSrc: finalVideoUrl,
            customKeywordCues: config.keywordCues,
            episodeTitle: config.episodeTitle,
            speakerName: config.speakerName,
            speakerTitle: config.speakerTitle,
            playbackRate: config.playbackRate,
          },
        }),
      });

      const renderData = await renderRes.json();
      if (!renderRes.ok) {
        throw new Error(renderData.error || "Failed to initiate Lambda render");
      }

      const { renderId, bucketName } = renderData;
      setStatusMessage("Parallel Lambdas rendering video frames...");

      // 3. Poll progress until complete (with transient error tolerance)
      let consecutiveErrors = 0;
      const pollInterval = setInterval(async () => {
        try {
          const progressRes = await fetch(
            `/api/progress?renderId=${encodeURIComponent(renderId)}&bucketName=${encodeURIComponent(bucketName)}`
          );
          const progressData = await progressRes.json();

          if (!progressRes.ok) {
            consecutiveErrors++;
            if (consecutiveErrors >= 5) {
              clearInterval(pollInterval);
              throw new Error(progressData.error || "Failed to poll render progress");
            }
            return; // Ignore transient poll error and retry next tick
          }

          consecutiveErrors = 0; // Reset on successful poll

          if (progressData.fatalErrorEncountered) {
            clearInterval(pollInterval);
            const errorMsg = Array.isArray(progressData.errors)
              ? progressData.errors.join("; ")
              : (progressData.errors || "Render error on Lambda");
            throw new Error(errorMsg);
          }

          // Map overallProgress [0..1] to [35..98%]
          const mapped = Math.round(35 + (progressData.overallProgress || 0) * 63);
          setProgressPercent(mapped);

          if (progressData.chunks) {
            setStatusMessage(`Rendering chunks in parallel (${Math.round((progressData.overallProgress || 0) * 100)}%)...`);
          }

          if (progressData.done) {
            clearInterval(pollInterval);
            setProgressPercent(100);
            setOutputUrl(progressData.outputFile);
            setState("completed");
            setStatusMessage("Render complete! 1080p MP4 ready for download.");
          }
        } catch (pollErr: unknown) {
          clearInterval(pollInterval);
          setState("error");
          setErrorMessage(pollErr instanceof Error ? pollErr.message : "Polling failed");
        }
      }, 2500);
    } catch (err: unknown) {
      setState("error");
      setErrorMessage(err instanceof Error ? err.message : "Render failed to start");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 text-lg">
              🚀
            </span>
            <div>
              <h3 className="text-base font-bold text-white">AWS Lambda Cloud Render</h3>
              <p className="text-xs text-slate-400">High-speed parallel video rendering</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors text-lg px-2"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="my-6 flex flex-col gap-4">
          {state === "idle" && (
            <div className="flex flex-col gap-3 text-xs text-slate-300">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="font-semibold text-white mb-1">Render Summary</p>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <span>Composition: <strong className="text-white">{config.compositionId}</strong></span>
                  <span>Duration: <strong className="text-amber-400">{config.durationMinutes} min</strong></span>
                  <span>Resolution: <strong className="text-white">1920 × 1080</strong></span>
                  <span>Frame Rate: <strong className="text-white">30 fps</strong></span>
                </div>
              </div>
              <p className="text-slate-400">
                Rendering runs across multiple AWS Lambdas in parallel (~30–45 seconds), keeping your local machine cool and fast.
              </p>
            </div>
          )}

          {(state === "uploading" || state === "rendering") && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">{statusMessage}</span>
                <span className="font-bold text-blue-400">{progressPercent}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 italic">
                Please keep this tab open while rendering.
              </p>
            </div>
          )}

          {state === "completed" && outputUrl && (
            <div className="flex flex-col items-center justify-center gap-3 py-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-3xl shadow-lg shadow-emerald-500/20">
                🎉
              </div>
              <h4 className="text-base font-bold text-white">Your Video is Ready!</h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Successfully rendered 1080p MP4 via AWS Lambda cluster.
              </p>
              <a
                href={outputUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all"
              >
                ⬇️ Download MP4 Video
              </a>
            </div>
          )}

          {state === "error" && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-200">
              <p className="font-bold text-red-400 mb-1">Render Failed</p>
              <p className="text-[11px] leading-relaxed text-red-300">{errorMessage}</p>
              <div className="mt-3 rounded-lg border border-red-500/20 bg-slate-950/70 p-2 text-[10px] text-slate-400">
                Ensure <code className="text-amber-400">REMOTION_AWS_ACCESS_KEY_ID</code>, <code className="text-amber-400">REMOTION_AWS_SECRET_ACCESS_KEY</code>, <code className="text-amber-400">REMOTION_FUNCTION_NAME</code>, and <code className="text-amber-400">REMOTION_SERVE_URL</code> are defined in your <code className="text-blue-400">.env</code> file.
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-700/80 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
          >
            {state === "completed" ? "Done" : "Cancel"}
          </button>
          {state === "idle" && (
            <button
              type="button"
              onClick={startRender}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:from-blue-500 hover:to-indigo-500 transition-all"
            >
              Start Cloud Render
            </button>
          )}
          {state === "error" && (
            <button
              type="button"
              onClick={startRender}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
