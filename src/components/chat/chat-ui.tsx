"use client";

import { useChatMessagesStore } from "@/stores/chatMessagesStore";
import { useInitializeChatMessagesWebSocket } from "@/stores/useChatMessagesWebSocket";
import { ChatMessage } from "@/types/chat";
import { useEffect, useRef } from "react";
import { MessageForm } from "./message-form";
import { MessageList } from "./message-list";

interface ChatUIProps {
  initialConversationId: string;
}

export function ChatUI({ initialConversationId }: ChatUIProps) {
  const {
    conversationId,
    messagesByConvo,
    hasMore,
    loadMoreMessages,
    setConversationId,
  } = useChatMessagesStore();

  const { sendMessage, stopStreaming, isStreaming, showLoading, connect } =
    useInitializeChatMessagesWebSocket();

  const initializedRef = useRef(false);

  const messages: ChatMessage[] =
    conversationId && messagesByConvo[conversationId]
      ? messagesByConvo[conversationId]
      : [];

  // Effect 1: Initialize WebSocket connection (only once)
  useEffect(() => {
    if (!initializedRef.current) {
      connect();
      initializedRef.current = true;
    }
  }, [connect]);

  // Effect 2: Handle route changes and sync with chatStore
  useEffect(() => {
    const routeConversationId =
      initialConversationId === "new" ? null : initialConversationId;

    if (routeConversationId !== conversationId) {
      setConversationId(routeConversationId);
    }
  }, [conversationId, initialConversationId, setConversationId]);

  // Effect 3: Load messages when conversation changes
  useEffect(() => {
    if (
      conversationId &&
      conversationId !== "new" &&
      (!messagesByConvo[conversationId] ||
        messagesByConvo[conversationId].length === 0)
    ) {
      loadMoreMessages(conversationId);
    }
  }, [conversationId, loadMoreMessages, messagesByConvo]);

  // Effect 4: Reconnect WebSocket when conversation changes
  useEffect(() => {
    if (conversationId && conversationId !== "new") {
      connect();
    }
  }, [conversationId, connect]);

  return (
    <div className="flex flex-col h-full">
      <MessageList
        isNew={initialConversationId === "new"}
        messages={messages}
        showLoading={showLoading}
        loadMore={() => loadMoreMessages()}
        hasMore={hasMore}
        fetching={false} // removed local fetching state
      />
      <div className="shrink-0 px-4 pb-6">
        <div className="w-full max-w-3xl mx-auto">
          <MessageForm
            onSubmit={sendMessage}
            onStop={stopStreaming}
            isStreaming={isStreaming}
          />
        </div>
      </div>
    </div>
  );
}
