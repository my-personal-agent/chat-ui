"use client";

import { CollapsibleAside } from "@/components/collapsible-aside";
import { Markdown } from "@/components/markdown";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getFileIcon } from "@/lib/file-utils";
import { StreamChatMessage } from "@/types/chat";
import { AlertCircle, Bot, User } from "lucide-react";

interface MessageProps {
  message: StreamChatMessage;
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";
  const isError = message.role === "error";

  const baseBubbleClass = isUser
    ? "bg-primary text-primary-foreground shadow-sm py-3 rounded-lg px-4"
    : isError
    ? "bg-destructive/10 border border-destructive/20 text-destructive py-3 rounded-lg px-4"
    : "px-1";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex items-start space-x-3 max-w-4xl ${
          isUser ? "flex-row-reverse space-x-reverse" : ""
        }`}
      >
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className="bg-muted text-muted-foreground">
            {isUser ? (
              <User className="w-4 h-4" />
            ) : isSystem || isError ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <Bot className="w-4 h-4" />
            )}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0 space-y-3">
          {/* Display uploaded files if they exist - vertical alignment */}
          {message.upload_files && message.upload_files.length > 0 && (
            <div
              className={`flex flex-col gap-2 ${
                isUser ? "items-end" : "items-start"
              }`}
            >
              {message.upload_files.map((uploadFile, index) => (
                <div
                  key={uploadFile.id || index}
                  className="flex items-center space-x-2 rounded-lg p-3 border w-fit"
                >
                  <div className="flex-shrink-0">
                    {getFileIcon(uploadFile.filename)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium whitespace-nowrap">
                      {uploadFile.filename}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Message content - constrained width with proper alignment */}
          <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div className={`${baseBubbleClass} text-sm text-justify`}>
              <div className="prose prose-neutral dark:prose-invert max-w-none space-y-2">
                {isSystem ? (
                  <CollapsibleAside streaming={message.isProcessing ?? false}>
                    {message.content as string}
                  </CollapsibleAside>
                ) : (
                  <Markdown content={message.content as string} />
                )}
              </div>

              {message.content === "" && (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
