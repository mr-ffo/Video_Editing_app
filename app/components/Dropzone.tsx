"use client";

import React, { useRef, useState } from "react";

interface DropzoneProps {
  currentFileName?: string;
  onVideoSelected: (url: string, fileName: string) => void;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  currentFileName,
  onVideoSelected,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("video/")) {
      alert("Please upload a valid MP4 or WebM video file.");
      return;
    }
    const url = URL.createObjectURL(file);
    onVideoSelected(url, file.name);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
        isDragging
          ? "border-blue-500 bg-blue-500/10 shadow-[0_0_25px_rgba(37,99,235,0.25)]"
          : "border-slate-700/80 bg-slate-900/60 hover:border-slate-500 hover:bg-slate-900/90"
      }`}
      style={{
        backdropFilter: "blur(12px)",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={handleChange}
      />

      <div className="flex flex-col items-center justify-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-2xl shadow-lg shadow-blue-500/20">
          📹
        </div>
        <div>
          <p className="text-sm font-semibold text-white">
            {currentFileName ? (
              <span className="text-emerald-400">Active: {currentFileName}</span>
            ) : (
              "Drag & drop camera video or click to browse"
            )}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Supports MP4, WebM (up to 4K 60fps) • Updates live in preview
          </p>
        </div>
      </div>
    </div>
  );
};
