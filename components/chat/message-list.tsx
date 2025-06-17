"use client";

import { MessageBubble } from "@/components/chat/message-bubble";
import { WelcomeScreen } from "@/components/chat/welcome-screen";
import { Skeleton } from "@/components/ui/skeleton";
import { Message } from "@/types/chat";
import { useEffect, useRef } from "react";

interface MessageListProps {
  messages: Message[];
  showLoading: boolean;
}

export function MessageList({ messages, showLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, [messages]);

  const sortedMessages = [...messages].sort((a, b) => {
    if (!a.timestamp) return 1;
    if (!b.timestamp) return -1;
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {sortedMessages.length === 0 && <WelcomeScreen />}

        {sortedMessages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {showLoading && (
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
