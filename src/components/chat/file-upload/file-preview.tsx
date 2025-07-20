"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { formatFileSize, getFileIcon } from "@/lib/file-utils";
import { FileCategory, FileUpload } from "@/types/file-upload";
import { ImageIcon, Loader2, Play, Trash2, XIcon } from "lucide-react";
import Image from "next/image";

interface FilePreviewProps {
  fileUpload: FileUpload;
  previewMode: boolean;
  onRemove: (id: string) => void;
}

// Helper function to get file type category
const getFileCategory = (file: File): FileCategory => {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  if (
    file.type.includes("pdf") ||
    file.type.includes("document") ||
    file.type.includes("text")
  )
    return "document";
  return "other";
};

export function FilePreview({
  fileUpload,
  previewMode,
  onRemove,
}: FilePreviewProps) {
  const category = getFileCategory(fileUpload.file);

  const renderListView = () => (
    <div className="flex items-center space-x-3">
      <div className="flex-shrink-0">
        {fileUpload.uploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : fileUpload.deleting ? (
          <Trash2 className="w-4 h-4 text-red-500 animate-pulse" />
        ) : (
          getFileIcon(fileUpload.file.name)
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate max-w-[180px]">
          {fileUpload.file.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(fileUpload.file.size)}
        </p>
      </div>
    </div>
  );

  const renderImagePreview = () => (
    <div className="space-y-2">
      {fileUpload.previewUrl ? (
        <div className="w-full h-32 bg-muted rounded-md overflow-hidden relative">
          <Image
            src={fileUpload.previewUrl}
            alt={fileUpload.file.name}
            fill={true}
            className="object-cover"
            sizes="200px"
            unoptimized
          />
        </div>
      ) : (
        <div className="w-full h-32 bg-muted rounded-md flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-muted-foreground" />
        </div>
      )}
      <div>
        <p className="text-sm font-medium truncate">{fileUpload.file.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(fileUpload.file.size)}
        </p>
      </div>
    </div>
  );

  const renderVideoPreview = () => (
    <div className="space-y-2">
      {fileUpload.previewUrl ? (
        <div className="w-full h-32 bg-muted rounded-md overflow-hidden relative">
          <video
            src={fileUpload.previewUrl}
            className="w-full h-full object-cover"
            preload="metadata"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Play className="w-6 h-6 text-white" />
          </div>
        </div>
      ) : (
        <div className="w-full h-32 bg-muted rounded-md flex items-center justify-center">
          <Play className="w-8 h-8 text-muted-foreground" />
        </div>
      )}
      <div>
        <p className="text-sm font-medium truncate">{fileUpload.file.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(fileUpload.file.size)}
        </p>
      </div>
    </div>
  );

  const renderGenericPreview = (height = "h-20") => (
    <div className="space-y-2">
      {fileUpload.uploading ? (
        <Skeleton className={`w-full ${height} bg-muted rounded-md`} />
      ) : (
        <div
          className={`w-full ${height} bg-muted rounded-md flex items-center justify-center`}
        >
          {getFileIcon(fileUpload.file.name, "w-8 h-8")}
        </div>
      )}

      <div>
        <p className="text-sm font-medium truncate">{fileUpload.file.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(fileUpload.file.size)}
        </p>
      </div>
    </div>
  );

  const renderPreviewContent = () => {
    if (!previewMode) return renderListView();

    switch (category) {
      case "image":
        return renderImagePreview();
      case "video":
        return renderVideoPreview();
      default:
        return renderGenericPreview();
    }
  };

  return (
    <div
      className={`relative rounded-lg border flex-shrink-0 ${
        previewMode ? "p-3 min-w-[200px]" : "p-2 min-w-[240px]"
      }`}
    >
      {renderPreviewContent()}

      {/* Progress bar for uploading */}
      {fileUpload.uploading && (
        <div className="mt-2">
          <Progress value={fileUpload.progress} className="h-1" />
        </div>
      )}

      {/* Delete button */}
      {fileUpload.uploaded && !fileUpload.deleting && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute top-1 right-1 h-6 w-6 p-0 bg-background/80 hover:bg-background"
          onClick={() => onRemove(fileUpload.id)}
        >
          <XIcon className="w-3 h-3" />
        </Button>
      )}
    </div>
  );
}
