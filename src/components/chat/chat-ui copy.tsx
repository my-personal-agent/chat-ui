"use client";

import { useChatStore } from "@/stores/chatStore";
import { useChatWebSocket } from "@/stores/useChatWebSocket";
import { ChatMessage } from "@/types/chat";
import { useCallback, useEffect, useRef, useState } from "react";
import { MessageForm } from "./message-form";
import { MessageList } from "./message-list";

interface ChatUIProps {
  initialConversationId: string | null;
}

export function ChatUI({ initialConversationId }: ChatUIProps) {
  const {
    conversationId,
    setConversationId,
    setMessages,
    messagesByConvo,
    prependMessages,
  } = useChatStore();

  console.log("start");
  console.log(conversationId);
  console.log("-");
  console.log(initialConversationId);
  console.log("end");

  const { connect, sendMessage, stopStreaming, isStreaming, showLoading } =
    useChatWebSocket();

  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [fetching, setFetching] = useState(false);

  const isNew = !initialConversationId;

  const didInitialLoadRef = useRef<string | null>(null); // 🧠 Track already-loaded conversation ID

  const messages: ChatMessage[] =
    conversationId && messagesByConvo[conversationId]
      ? messagesByConvo[conversationId]
      : [];

  const loadMoreMessages = useCallback(
    async (cid: string = conversationId!) => {
      if (!cid || fetching || !hasMore) return;

      setFetching(true);
      try {
        const res = await fetch(`/api/chat/${cid}?cursor=${cursor ?? ""}`);
        const data = (await res.json()) as {
          messages: ChatMessage[];
          nextCursor: string | null;
        };
        prependMessages(cid, data.messages);

        setHasMore(!!data.nextCursor);
        setCursor(data.nextCursor);
      } catch (e) {
        console.error("❌ Failed to load messages", e);
      } finally {
        setFetching(false);
      }
    },
    [conversationId, cursor, fetching, hasMore, prependMessages]
  );

  useEffect(() => {
    const cid = initialConversationId;

    // ✅ Only load once per conversation
    if (cid && cid !== didInitialLoadRef.current) {
      setConversationId(cid);
      setMessages(cid, []);
      didInitialLoadRef.current = cid;

      // Slight delay to wait for Zustand update
      setTimeout(() => {
        loadMoreMessages(cid);
      }, 0);
    }

    if (!cid && conversationId !== null) {
      setConversationId(null);
    }
  }, [
    initialConversationId,
    conversationId,
    setConversationId,
    setMessages,
    loadMoreMessages,
  ]);

  useEffect(() => {
    connect();
  }, [connect]);

  useEffect(() => {
    if (conversationId) {
      setCursor(null);
      setHasMore(true);
      setFetching(false);
    }
  }, [conversationId]);

  return (
    <div className="flex flex-col h-full">
      <MessageList
        isNew={isNew}
        messages={messages}
        showLoading={showLoading}
        loadMore={loadMoreMessages}
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
