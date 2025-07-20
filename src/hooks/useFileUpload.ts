"use client";

import { FileUploadManager, UploadProgress } from "@/lib/file-uploads";
import { FileUpload } from "@/types/file-upload";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function useFileUpload() {
  const [selectedFiles, setSelectedFiles] = useState<FileUpload[]>([]);

  const createPreviewUrl = useCallback((file: File): string | undefined => {
    if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
      return URL.createObjectURL(file);
    }
    return undefined;
  }, []);

  const uploadFile = useCallback(async (fileUpload: FileUpload) => {
    try {
      setSelectedFiles((prev) =>
        prev.map((f) =>
          f.id === fileUpload.id
            ? { ...f, uploading: true, error: undefined }
            : f
        )
      );

      const fileId = await FileUploadManager.uploadFile(
        fileUpload.file,
        (progress: UploadProgress) => {
          setSelectedFiles((prev) =>
            prev.map((f) =>
              f.id === fileUpload.id
                ? {
                    ...f,
                    progress: progress.progress,
                    uploading: progress.status === "uploading",
                    uploaded: progress.status === "completed",
                    error: progress.error,
                    uploadedFileId: progress.fileId || f.uploadedFileId,
                  }
                : f
            )
          );
        }
      );

      setSelectedFiles((prev) =>
        prev.map((f) =>
          f.id === fileUpload.id ? { ...f, uploadedFileId: fileId } : f
        )
      );
    } catch (exception) {
      console.error(exception);
      toast.error(`Failed to upload ${fileUpload.file.name}`);
      setSelectedFiles((prev) => prev.filter((f) => f.id !== fileUpload.id));
    }
  }, []);

  const deleteFile = useCallback(async (fileUpload: FileUpload) => {
    try {
      setSelectedFiles((prev) =>
        prev.map((f) =>
          f.id === fileUpload.id
            ? { ...f, deleting: true, error: undefined }
            : f
        )
      );

      if (fileUpload.uploaded && fileUpload.uploadedFileId) {
        await FileUploadManager.deleteFile(fileUpload.uploadedFileId);
      }

      if (fileUpload.previewUrl) {
        URL.revokeObjectURL(fileUpload.previewUrl);
      }

      setSelectedFiles((prev) => prev.filter((f) => f.id !== fileUpload.id));
    } catch {
      toast.error(`Failed to delete ${fileUpload.file.name}`);
      setSelectedFiles((prev) =>
        prev.map((f) =>
          f.id === fileUpload.id
            ? { ...f, deleting: false, error: "Failed to delete" }
            : f
        )
      );
    }
  }, []);

  const addFiles = useCallback(
    (files: File[]) => {
      const newFileUploads: FileUpload[] = files.map((file) => ({
        file,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        uploading: false,
        uploaded: false,
        progress: 0,
        previewUrl: createPreviewUrl(file),
      }));

      setSelectedFiles((prev) => [...prev, ...newFileUploads]);

      newFileUploads.forEach((fileUpload) => {
        uploadFile(fileUpload);
      });
    },
    [createPreviewUrl, uploadFile]
  );

  const removeFile = useCallback(
    (id: string) => {
      const fileUpload = selectedFiles.find((f) => f.id === id);
      if (fileUpload) {
        if (fileUpload.uploaded) {
          deleteFile(fileUpload);
        } else {
          if (fileUpload.previewUrl) {
            URL.revokeObjectURL(fileUpload.previewUrl);
          }
          setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
        }
      }
    },
    [selectedFiles, deleteFile]
  );

  const clearFiles = useCallback(() => {
    selectedFiles.forEach((file) => {
      if (file.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
      }
    });
    setSelectedFiles([]);
  }, [selectedFiles]);

  const getUploadedFiles = useCallback(() => {
    return selectedFiles
      .filter((f) => f.uploaded)
      .map((f) => ({
        id: f.uploadedFileId ?? f.id,
        filename: f.file.name,
      }));
  }, [selectedFiles]);

  const hasUploadingFiles = selectedFiles.some((f) => f.uploading);
  const hasDeletingFiles = selectedFiles.some((f) => f.deleting);

  return {
    selectedFiles,
    addFiles,
    removeFile,
    clearFiles,
    getUploadedFiles,
    hasUploadingFiles,
    hasDeletingFiles,
  };
}
