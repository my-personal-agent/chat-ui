"use client";

import { CollapsibleAside } from "@/components/collapsible-aside";
import { Markdown } from "@/components/markdown";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ChatMessage } from "@/types/chat";
import { AlertCircle, Bot, User } from "lucide-react";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";
  // const isBot = message.sender === "bot";
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

        <div className="flex-1 min-w-0">
          <div className={`${baseBubbleClass} text-sm text-justify`}>
            <div className="prose prose-neutral dark:prose-invert max-w-none space-y-2">
              {isSystem ? (
                <CollapsibleAside streaming={message.isProcessing ?? false}>
                  {message.content}
                </CollapsibleAside>
              ) : (
                <Markdown content={message.content} />
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
  );
}
