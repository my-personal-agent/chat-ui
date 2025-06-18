import { useConversationStore } from "@/stores/useConversationStore";
import { Message } from "@/types/chat";
import { useCallback, useEffect, useRef, useState } from "react";

interface PaginatedResponse {
  total: number;
  messages: Message[];
  nextCursor: string | null;
}

export function useConversationMessages(
  isNew: boolean,
  conversationId: string | null,
  limit = 20
) {
  const { conversations, appendMessages, setCursor, setHasMore } =
    useConversationStore();

  const [fetching, setFetching] = useState(false);
  const hasFetchedOnce = useRef<Record<string, boolean>>({});

  // ⛑️ Initialize empty conversation in Zustand if needed
  useEffect(() => {
    if (conversationId && !conversations[conversationId]) {
      useConversationStore.setState((state) => ({
        conversations: {
          ...state.conversations,
          [conversationId]: {
            messages: [],
            cursor: null,
            hasMore: true,
          },
        },
      }));
    }
  }, [conversationId, conversations]);

  const conversation = conversationId
    ? conversations[conversationId]
    : undefined;

  const loadMore = useCallback(async () => {
    if (!conversationId || !conversation?.hasMore || fetching) return;

    setFetching(true);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(conversation.cursor ? { cursor: conversation.cursor } : {}),
      });

      const res = await fetch(
        `/api/chat/conversations/${conversationId}/messages?${params}`
      );
      const result: PaginatedResponse = await res.json();

      appendMessages(conversationId, result.messages);
      setCursor(conversationId, result.nextCursor);
      setHasMore(conversationId, !!result.nextCursor);
    } catch (error) {
      console.error("❌ Failed to load messages:", error);
    } finally {
      setFetching(false);
    }
  }, [
    conversationId,
    conversation?.cursor,
    conversation?.hasMore,
    fetching,
    appendMessages,
    setCursor,
    setHasMore,
    limit,
  ]);

  useEffect(() => {
    if (
      conversationId &&
      !hasFetchedOnce.current[conversationId] &&
      conversation &&
      conversation.messages.length === 0 &&
      !fetching
    ) {
      hasFetchedOnce.current[conversationId] = true;
      if (!isNew) {
        loadMore();
      }
    }
  }, [
    conversationId,
    conversation?.messages.length,
    conversation,
    fetching,
    loadMore,
    isNew,
  ]);

  return {
    messages: conversation?.messages || [],
    loadMore,
    hasMore: conversation?.hasMore ?? true,
    fetching,
  };
}
