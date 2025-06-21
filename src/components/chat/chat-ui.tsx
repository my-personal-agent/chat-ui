"use client";

import { useInitializeChatMessagesWebSocket } from "@/hooks/useChatMessagesWebSocket";
import { useChatMessagesStore } from "@/stores/chatMessagesStore";
import { ChatMessage } from "@/types/chat";
import { useEffect, useRef } from "react";
import { MessageForm } from "./message-form";
import { MessageList } from "./message-list";

interface ChatUIProps {
  initialChatId: string;
}

export function ChatUI({ initialChatId }: ChatUIProps) {
  const { chatId, messagesByChat, hasMore, loadMoreMessages, setChatId } =
    useChatMessagesStore();

  const { sendMessage, stopStreaming, isStreaming, showLoading, connect } =
    useInitializeChatMessagesWebSocket();

  const initializedRef = useRef(false);

  const messages: ChatMessage[] =
    chatId && messagesByChat[chatId] ? messagesByChat[chatId] : [];

  // Effect 1: Initialize WebSocket connection (only once)
  useEffect(() => {
    if (!initializedRef.current) {
      connect();
      initializedRef.current = true;
    }
  }, [connect]);

  // Effect 2: Handle route changes and sync with chatStore
  useEffect(() => {
    const routeChatId = initialChatId === "new" ? null : initialChatId;

    if (routeChatId !== chatId) {
      setChatId(routeChatId);
    }
  }, [chatId, initialChatId, setChatId]);

  // Effect 3: Load messages when chat changes
  useEffect(() => {
    if (
      chatId &&
      chatId !== "new" &&
      (!messagesByChat[chatId] || messagesByChat[chatId].length === 0)
    ) {
      loadMoreMessages(chatId);
    }
  }, [chatId, loadMoreMessages, messagesByChat]);

  // Effect 4: Reconnect WebSocket when chat changes
  useEffect(() => {
    if (chatId && chatId !== "new") {
      connect();
    }
  }, [chatId, connect]);

  return (
    <div className="flex flex-col h-full">
      <MessageList
        isNew={initialChatId === "new"}
        messages={messages}
        showLoading={showLoading}
        loadMore={() => loadMoreMessages()}
        hasMore={hasMore}
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
