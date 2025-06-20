"use client";

import { useChatStore } from "@/stores/chatStore";
import { useInitializeChatWebSocket } from "@/stores/useChatWebSocket";
import { ChatMessage } from "@/types/chat";
import { useCallback, useEffect, useRef, useState } from "react";
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
    cursor,
    prependMessages,
    setConversationId,
    setHasMore,
    setCursor,
  } = useChatStore();

  const { sendMessage, stopStreaming, isStreaming, showLoading, connect } =
    useInitializeChatWebSocket();

  const [fetching, setFetching] = useState(false);

  // Track which conversations have been loaded and prevent duplicates
  const loadingRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);

  const messages: ChatMessage[] =
    conversationId && messagesByConvo[conversationId]
      ? messagesByConvo[conversationId]
      : [];

  // Stable loadMoreMessages function with better guards
  const loadMoreMessages = useCallback(
    async (targetConversationId?: string) => {
      const convoId = targetConversationId || conversationId;

      if (!convoId || convoId === "new" || fetching) {
        return;
      }

      // Check if we're already loading this conversation
      if (loadingRef.current.has(convoId)) {
        return;
      }

      // Check if we have more messages to load
      if (!hasMore && messagesByConvo[convoId]?.length > 0) {
        return;
      }

      loadingRef.current.add(convoId);
      setFetching(true);

      try {
        const res = await fetch(
          `/api/chat/${convoId}/messages?cursor=${cursor ?? ""}`
        );
        const data = (await res.json()) as {
          messages: ChatMessage[];
          nextCursor: string | null;
        };

        prependMessages(convoId, data.messages);
        setHasMore(!!data.nextCursor);
        setCursor(data.nextCursor);
      } catch (e) {
        console.error("Failed to load more messages", e);
      } finally {
        setFetching(false);
        setTimeout(() => {
          loadingRef.current.delete(convoId);
        }, 1000);
      }
    },
    [
      conversationId,
      fetching,
      hasMore,
      cursor,
      messagesByConvo,
      prependMessages,
      setHasMore,
      setCursor,
    ]
  );

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
  }, [conversationId, initialConversationId, setConversationId]); // Removed conversationId to prevent loops

  // Effect 3: Load messages when conversation changes
  useEffect(() => {
    if (
      conversationId &&
      conversationId !== "new" &&
      !loadingRef.current.has(conversationId)
    ) {
      // Only load if we don't have messages for this conversation yet
      const existingMessages = messagesByConvo[conversationId];
      if (!existingMessages || existingMessages.length === 0) {
        loadMoreMessages(conversationId);
      }
    }
  }, [conversationId, loadMoreMessages, messagesByConvo]); // Removed loadMoreMessages dependency

  // Effect 4: Reconnect WebSocket when conversation changes (debounced)
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
        fetching={fetching}
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
