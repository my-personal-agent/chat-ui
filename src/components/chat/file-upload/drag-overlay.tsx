"use client";

import { Upload } from "lucide-react";

interface DragOverlayProps {
  isDragging: boolean;
  fileCount: number;
}

export function DragOverlay({ isDragging, fileCount }: DragOverlayProps) {
  if (!isDragging) return null;

  return (
    <div className="absolute inset-0 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center">
          <Upload className="w-6 h-6" />
        </div>
        <p className="font-medium">Drop files here</p>
        <p className="text-sm">
          {fileCount > 0
            ? `Add to ${fileCount} selected file${fileCount > 1 ? "s" : ""}`
            : "Upload files to attach to your message"}
        </p>
      </div>
    </div>
  );
}
