"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useFileUpload } from "@/hooks/useFileUpload";
import { StreamChatMessageUploadedFile } from "@/types/chat";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mic, Send, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { DragOverlay } from "./file-upload/drag-overlay";
import { FileUploadActions } from "./file-upload/file-upload-actions";
import { FileUploadList } from "./file-upload/file-upload-list";

const messageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").trim(),
});

type MessageFormData = z.infer<typeof messageSchema>;

interface MessageFormProps {
  onSubmit: (
    message: string,
    uploadFiles?: StreamChatMessageUploadedFile[]
  ) => void;
  isStreaming: boolean;
  showingConfirmation: boolean;
  onStop: () => void;
}

export function MessageForm({
  onSubmit,
  isStreaming,
  showingConfirmation,
  onStop,
}: MessageFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isComposing, setIsComposing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [, setDragCounter] = useState(0);
  const [previewMode, setPreviewMode] = useState(true);

  // Use the custom hook for file upload logic
  const {
    selectedFiles,
    addFiles,
    removeFile,
    clearFiles,
    getUploadedFiles,
    hasUploadingFiles,
    hasDeletingFiles,
  } = useFileUpload();

  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: "",
    },
  });

  // Reset drag state when drag is cancelled
  useEffect(() => {
    const handleDragEnd = () => {
      setIsDragging(false);
      setDragCounter(0);
    };

    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDragging(false);
        setDragCounter(0);
      }
    };

    document.addEventListener("dragend", handleDragEnd);
    document.addEventListener("keydown", handleEscKey);
    document.addEventListener("mouseup", handleDragEnd);

    return () => {
      document.removeEventListener("dragend", handleDragEnd);
      document.removeEventListener("keydown", handleEscKey);
      document.removeEventListener("mouseup", handleDragEnd);
    };
  }, []);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 120);
      textarea.style.height = newHeight + "px";
      textarea.style.overflowY =
        textarea.scrollHeight > 120 ? "auto" : "hidden";
    }
  };

  const handleInputChange = (value: string) => {
    form.setValue("message", value);
    adjustTextareaHeight();
  };

  const watchedMessage = form.watch("message");

  useEffect(() => {
    adjustTextareaHeight();
  }, [watchedMessage]);

  const handleFileSelect = (files: File[]) => {
    addFiles(files);

    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFileSelect(files);
  };

  const handleSubmit = (data: MessageFormData) => {
    if (isStreaming || showingConfirmation) return;

    const uploadedFiles = getUploadedFiles();

    onSubmit(
      data.message,
      uploadedFiles.length > 0 ? uploadedFiles : undefined
    );

    form.reset();
    clearFiles();

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isComposing) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.handleSubmit(handleSubmit)();
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev + 1);
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => {
      const newCounter = prev - 1;
      if (newCounter <= 0) {
        setIsDragging(false);
        return 0;
      }
      return newCounter;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragCounter(0);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  return (
    <Card
      className="bg-card border p-0 gap-0 transition-all duration-200 border-border"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Form {...form}>
        <DragOverlay isDragging={isDragging} fileCount={selectedFiles.length} />

        <FileUploadList
          files={selectedFiles}
          previewMode={previewMode}
          onTogglePreviewMode={() => setPreviewMode(!previewMode)}
          onRemoveFile={removeFile}
        />

        <form onSubmit={form.handleSubmit(handleSubmit)} className="p-4">
          <div className="mb-4">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      ref={textareaRef}
                      onChange={(e) => {
                        field.onChange(e);
                        handleInputChange(e.target.value);
                      }}
                      onKeyDown={handleKeyPress}
                      onCompositionStart={() => setIsComposing(true)}
                      onCompositionEnd={() => setIsComposing(false)}
                      placeholder="Ask anything"
                      disabled={isStreaming || showingConfirmation}
                      className="min-h-[28px] max-h-[120px] resize-none border-0 p-0 text-base !bg-transparent !shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-50"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileUploadActions
                onFileSelect={() => fileInputRef.current?.click()}
              />

              <Button variant="ghost" size="sm" className="h-8" type="button">
                <span className="text-sm">Tools</span>
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                type="button"
              >
                <Mic className="w-4 h-4" />
              </Button>

              {isStreaming || showingConfirmation ? (
                isStreaming ? (
                  <Button
                    type="button"
                    onClick={onStop}
                    size="icon"
                    className="h-8 w-8 rounded-full"
                  >
                    <Square className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={true}
                    size="icon"
                    className="h-8 w-8 rounded-full"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                )
              ) : (
                <Button
                  type="submit"
                  disabled={
                    (!watchedMessage?.trim() && selectedFiles.length === 0) ||
                    hasUploadingFiles ||
                    hasDeletingFiles
                  }
                  size="icon"
                  className="h-8 w-8 rounded-full"
                >
                  {hasUploadingFiles ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileInputChange}
            accept="*/*"
          />
        </form>
      </Form>
    </Card>
  );
}
