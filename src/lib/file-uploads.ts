export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: "uploading" | "completed" | "error";
  error?: string;
}

export interface ChunkUploadResponse {
  file_id: string;
  chunk_index: number;
  total_chunks: number;
  is_complete: boolean;
  message: string;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}

export class FileUploadManager {
  private static readonly CHUNK_SIZE = 1024 * 1024; // 1MB chunks
  private static readonly MAX_RETRIES = 1;

  static async uploadFile(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    const totalChunks = Math.ceil(file.size / this.CHUNK_SIZE);
    let fileId: string | null = null;

    try {
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * this.CHUNK_SIZE;
        const end = Math.min(start + this.CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        const subProgress = ((chunkIndex + 0.5) / totalChunks) * 100;
        onProgress?.({
          fileId: fileId!,
          fileName: file.name,
          progress: subProgress,
          status: subProgress === 100 ? "completed" : "uploading",
        });

        const response = await this.uploadChunk(
          chunk,
          fileId, // Will be null for first chunk
          file.name,
          chunkIndex,
          totalChunks
        );

        // Get file_id from backend response on first chunk
        if (chunkIndex === 0) {
          fileId = response.file_id;
        }

        const progress = ((chunkIndex + 1) / totalChunks) * 100;
        onProgress?.({
          fileId: fileId!,
          fileName: file.name,
          progress,
          status: progress === 100 ? "completed" : "uploading",
        });
      }

      return fileId!;
    } catch (error) {
      onProgress?.({
        fileId: fileId || "unknown",
        fileName: file.name,
        progress: 0,
        status: "error",
        error: error instanceof Error ? error.message : "Upload failed",
      });
      throw error;
    }
  }

  static async deleteFile(fileId: string): Promise<DeleteResponse> {
    try {
      const response = await fetch(`/api/chats/upload/${fileId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to delete file: ${response.status}`
        );
      }

      const result = await response
        .json()
        .catch(() => ({ success: true, message: "File deleted successfully" }));
      return result;
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  }

  private static async uploadChunk(
    chunk: Blob,
    fileId: string | null,
    fileName: string,
    chunkIndex: number,
    totalChunks: number,
    retryCount = 0
  ): Promise<ChunkUploadResponse> {
    try {
      const formData = new FormData();
      formData.append("chunk", chunk);
      formData.append("filename", fileName);
      formData.append("chunk_index", chunkIndex.toString());
      formData.append("total_chunks", totalChunks.toString());
      if (fileId) {
        formData.append("file_id", fileId);
      }
      // Send the FormData directly in the body — no headers!
      const response = await fetch(`/api/chats/upload/chunks`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Upload failed (${response.status}): ${text}`);
      }

      return await response.json();
    } catch (error) {
      if (retryCount < this.MAX_RETRIES) {
        await new Promise((res) => setTimeout(res, 1000 * (retryCount + 1)));
        return this.uploadChunk(
          chunk,
          fileId,
          fileName,
          chunkIndex,
          totalChunks,
          retryCount + 1
        );
      }
      throw error;
    }
  }
}
