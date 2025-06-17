"use client";

import { MessageForm } from "@/components/chat/message-form";
import { MessageList } from "@/components/chat/message-list";
import { useChat } from "@/hooks/use-chat";
import { Message } from "@/types/chat";

interface ChatUIProps {
  initialConversationId: string | null;
  initialMessages: Message[];
}

export function ChatUI({
  initialConversationId,
  initialMessages,
}: ChatUIProps) {
  const { messages, isStreaming, showLoading, sendMessage, stopStreaming } =
    useChat({ initialConversationId, initialMessages });

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <MessageList messages={messages} showLoading={showLoading} />

      <div className="shrink-0 px-4 pb-6">
        <div className="w-full max-w-3xl mx-auto">
          <MessageForm
            onSubmit={sendMessage}
            isStreaming={isStreaming}
            onStop={stopStreaming}
          />

          <p className="text-xs text-muted-foreground mt-3 text-center">
            My Personal AI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
}
