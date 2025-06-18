"use client";

import { MessageForm } from "@/components/chat/message-form";
import { MessageList } from "@/components/chat/message-list";
import { useChat } from "@/hooks/use-chat";
import { useConversationMessages } from "@/hooks/useConversationMessages";
import { useState } from "react";

interface ChatUIProps {
  initialConversationId: string | null;
}

export function ChatUI({ initialConversationId }: ChatUIProps) {
  const isNew = !initialConversationId;
  const [conversationId, setConversationId] = useState(initialConversationId);

  const { isStreaming, showLoading, sendMessage, stopStreaming } = useChat({
    conversationId,
    setConversationId,
  });

  const { messages, loadMore, hasMore, fetching } = useConversationMessages(
    isNew,
    conversationId
  );

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <MessageList
        isNew={isNew}
        messages={messages}
        showLoading={showLoading}
        loadMore={loadMore}
        hasMore={hasMore}
        fetching={fetching}
      />

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
