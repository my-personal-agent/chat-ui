"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Archive,
  CodeIcon,
  FileIcon,
  FilePlus2Icon,
  FileSpreadsheetIcon,
  FileTextIcon,
  FileTypeIcon,
  ImageIcon,
  LayoutGridIcon,
  Mic,
  MusicIcon,
  Plus,
  Send,
  Square,
  Upload,
  VideoIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const messageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").trim(),
});

type MessageFormData = z.infer<typeof messageSchema>;

interface FileUpload {
  file: File;
  id: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
}

interface MessageFormProps {
  onSubmit: (message: string, files?: File[]) => void;
  isStreaming: boolean;
  showingConfirmation: boolean;
  onStop: () => void;
  onFileUpload?: (file: File) => Promise<void>;
}

export function MessageForm({
  onSubmit,
  isStreaming,
  showingConfirmation,
  onStop,
  onFileUpload,
}: MessageFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isComposing, setIsComposing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileUpload[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [, setDragCounter] = useState(0);

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

    // Listen for drag end events on the document
    document.addEventListener("dragend", handleDragEnd);
    document.addEventListener("keydown", handleEscKey);

    // Also listen for mouse events that might indicate drag cancellation
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

  // Auto-upload files to backend
  const uploadFile = async (fileUpload: FileUpload) => {
    if (!onFileUpload) return;

    try {
      setSelectedFiles((prev) =>
        prev.map((f) =>
          f.id === fileUpload.id
            ? { ...f, uploading: true, error: undefined }
            : f
        )
      );

      await onFileUpload(fileUpload.file);

      setSelectedFiles((prev) =>
        prev.map((f) =>
          f.id === fileUpload.id
            ? { ...f, uploading: false, uploaded: true }
            : f
        )
      );
    } catch {
      // Show toast notification
      toast.error(`Failed to upload ${fileUpload.file.name}`);

      // Remove the file from selectedFiles
      setSelectedFiles((prev) => prev.filter((f) => f.id !== fileUpload.id));
    }
  };

  const handleFileSelect = (files: File[]) => {
    const newFileUploads: FileUpload[] = files.map((file) => ({
      file,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      uploading: false,
      uploaded: false,
    }));

    setSelectedFiles((prev) => [...prev, ...newFileUploads]);

    // Auto-upload each file if handler is provided
    if (onFileUpload) {
      newFileUploads.forEach((fileUpload) => {
        uploadFile(fileUpload);
      });
    }

    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFileSelect(files);
  };

  const removeFile = (id: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = (data: MessageFormData) => {
    if (isStreaming || showingConfirmation) return;

    const files = selectedFiles.map((f) => f.file);
    onSubmit(data.message, files.length > 0 ? files : undefined);
    form.reset();
    setSelectedFiles([]);
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (file: File) => {
    const type = file.type.toLowerCase();
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (type.startsWith("image/")) {
      return <ImageIcon className="w-4 h-4 text-blue-500" />;
    }
    if (type.startsWith("video/")) {
      return <VideoIcon className="w-4 h-4 text-red-500" />;
    }
    if (type.startsWith("audio/")) {
      return <MusicIcon className="w-4 h-4 text-green-500" />;
    }
    if (type.includes("pdf")) {
      return <FileTextIcon className="w-4 h-4 text-red-600" />;
    }
    if (
      type.includes("sheet") ||
      type.includes("excel") ||
      extension === "xlsx" ||
      extension === "xls" ||
      extension === "csv"
    ) {
      return <FileSpreadsheetIcon className="w-4 h-4 text-green-600" />;
    }
    if (
      type.includes("document") ||
      type.includes("word") ||
      extension === "doc" ||
      extension === "docx"
    ) {
      return <FileTypeIcon className="w-4 h-4 text-blue-600" />;
    }
    if (type.includes("zip") || type.includes("rar") || type.includes("7z")) {
      return <Archive className="w-4 h-4 text-orange-500" />;
    }
    if (
      extension === "js" ||
      extension === "ts" ||
      extension === "jsx" ||
      extension === "tsx" ||
      extension === "py" ||
      extension === "java" ||
      extension === "cpp" ||
      extension === "c" ||
      extension === "html" ||
      extension === "css" ||
      extension === "json" ||
      extension === "jsonl" ||
      extension === "xml"
    ) {
      return <CodeIcon className="w-4 h-4 text-purple-500" />;
    }

    return <FileIcon className="w-4 h-4 text-gray-500" />;
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Increment counter for each dragenter event
    setDragCounter((prev) => prev + 1);

    // Check if dragged items contain files
    if (e.dataTransfer.types.includes("Files")) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Decrement counter for each dragleave event
    setDragCounter((prev) => {
      const newCounter = prev - 1;
      // Only hide drag state when counter reaches 0
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
    // Keep drag effect as 'copy' for better UX
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
        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <p className="font-medium">Drop files here</p>
              <p className="text-sm">
                {selectedFiles.length > 0
                  ? `Add to ${selectedFiles.length} selected file${
                      selectedFiles.length > 1 ? "s" : ""
                    }`
                  : "Upload files to attach to your message"}
              </p>
            </div>
          </div>
        )}

        {/* Selected Files Display - No padding */}
        {selectedFiles.length > 0 && (
          <div className="overflow-x-auto no-scrollbar p-2">
            <div className="flex gap-2 min-w-max">
              {selectedFiles.map((fileUpload) => (
                <div
                  key={fileUpload.id}
                  className="relative flex items-center rounded-lg p-3 min-w-[200px] border flex-shrink-0"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="flex-shrink-0">
                      {getFileIcon(fileUpload.file)}
                    </div>
                    <div className="min-w-0 flex-1 ">
                      <p className="text-sm font-medium truncate max-w-[300px] pr-4">
                        {fileUpload.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(fileUpload.file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                    onClick={() => removeFile(fileUpload.id)}
                  >
                    <XIcon className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    type="button"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <LayoutGridIcon className="w-4 h-4 mr-2" />
                      Add from apps
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem>Email</DropdownMenuItem>
                        <DropdownMenuItem>Message</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>More...</DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuItem
                    onClick={() => {
                      fileInputRef.current?.click();
                    }}
                  >
                    <FilePlus2Icon className="w-4 h-4 text-accent-foreground" />
                    Add files
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

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
                ) : showingConfirmation ? (
                  <Button
                    type="button"
                    disabled={true}
                    size="icon"
                    className="h-8 w-8 rounded-full"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                ) : null
              ) : (
                <Button
                  type="submit"
                  disabled={
                    !watchedMessage?.trim() && selectedFiles.length === 0
                  }
                  size="icon"
                  className="h-8 w-8 rounded-full"
                >
                  <Send className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          {/* Hidden file input - accepts all file types */}
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
