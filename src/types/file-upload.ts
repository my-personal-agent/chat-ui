export interface FileUpload {
  file: File;
  id: string;
  uploading: boolean;
  uploaded: boolean;
  progress: number;
  error?: string;
  deleting?: boolean;
  uploadedFileId?: string;
  previewUrl?: string;
}

export type FileCategory = "image" | "video" | "audio" | "document" | "other";
