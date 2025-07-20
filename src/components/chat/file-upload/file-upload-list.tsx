"use client";

import { Button } from "@/components/ui/button";
import { FileUpload } from "@/types/file-upload";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useRef } from "react";
import { FilePreview } from "./file-preview";

interface FileUploadListProps {
  files: FileUpload[];
  previewMode: boolean;
  onTogglePreviewMode: () => void;
  onRemoveFile: (id: string) => void;
}

export function FileUploadList({
  files,
  previewMode,
  onTogglePreviewMode,
  onRemoveFile,
}: FileUploadListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const previousLengthRef = useRef(files.length);

  useEffect(() => {
    const container = scrollContainerRef.current;
    const previousLength = previousLengthRef.current;

    if (container && files.length > previousLength) {
      container.scrollTo({
        left: container.scrollWidth,
        behavior: "smooth",
      });
    }

    // Update previous length after check
    previousLengthRef.current = files.length;
  }, [files.length]);

  if (files.length === 0) return null;

  return (
    <div className="p-2 border-b">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">
          {files.length} file{files.length > 1 ? "s" : ""} attached
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onTogglePreviewMode}
          className="h-6 px-2"
        >
          {previewMode ? (
            <EyeOff className="w-3 h-3" />
          ) : (
            <Eye className="w-3 h-3" />
          )}
          <span className="ml-1 text-xs">
            {previewMode ? "List" : "Preview"}
          </span>
        </Button>
      </div>

      <div
        className="overflow-x-auto no-scrollbar scroll-smooth"
        ref={scrollContainerRef}
      >
        <div className={`flex gap-2 min-w-max ${previewMode ? "pb-1" : ""}`}>
          {files.map((fileUpload) => (
            <FilePreview
              key={fileUpload.id}
              fileUpload={fileUpload}
              previewMode={previewMode}
              onRemove={onRemoveFile}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
