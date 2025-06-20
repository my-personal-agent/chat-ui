import { ChatMessage } from "@/types/chat";
import { create } from "zustand";

interface ChatState {
  conversationId: string | null;
  messagesByConvo: Record<string, ChatMessage[]>;
  hasMore: boolean;
  cursor: string | null;
  loadingRef: Set<string>;
  setMessages: (convoId: string, msgs: ChatMessage[]) => void;
  addMessages: (convoId: string, msgs: ChatMessage[]) => void;
  updateMessage: (
    convoId: string,
    msg: Partial<ChatMessage> & { id: string }
  ) => void;
  prependMessages: (id: string, messages: ChatMessage[]) => void;
  setConversationId: (id: string | null) => void;
  setHasMore: (hasMore: boolean) => void;
  setCursor: (cursor: string | null) => void;
  loadMoreMessages: (conversationId?: string) => Promise<void>;
}

export const useChatMessagesStore = create<ChatState>((set, get) => ({
  conversationId: null,
  messagesByConvo: {},
  hasMore: true,
  cursor: null,
  loadingRef: new Set(),

  setMessages: (conversationId, msgs) =>
    set((s) => ({
      messagesByConvo: {
        ...s.messagesByConvo,
        [conversationId]: msgs,
      },
    })),

  addMessages: (conversationId, msgs) =>
    set((s) => {
      const existing = s.messagesByConvo[conversationId] ?? [];
      return {
        messagesByConvo: {
          ...s.messagesByConvo,
          [conversationId]: [...existing, ...msgs],
        },
      };
    }),

  updateMessage: (
    convoId: string,
    msg: Partial<ChatMessage> & { id: string }
  ) =>
    set((s) => {
      const existing = s.messagesByConvo[convoId] ?? [];
      const updated = existing.map((m) =>
        m.id === msg.id ? { ...m, ...msg } : m
      );
      return {
        messagesByConvo: {
          ...s.messagesByConvo,
          [convoId]: updated,
        },
      };
    }),

  prependMessages: (id, messages) =>
    set((state) => ({
      messagesByConvo: {
        ...state.messagesByConvo,
        [id]: [...messages, ...(state.messagesByConvo[id] || [])],
      },
    })),

  setConversationId: (id) => set({ conversationId: id }),
  setHasMore: (hasMore) => set({ hasMore }),
  setCursor: (cursor) => set({ cursor }),

  loadMoreMessages: async (targetConversationId) => {
    const convoId = targetConversationId || get().conversationId;
    const {
      messagesByConvo,
      hasMore,
      cursor,
      prependMessages,
      setHasMore,
      setCursor,
      loadingRef,
    } = get();

    if (!convoId || convoId === "new") return;
    if (loadingRef.has(convoId)) return;
    if (!hasMore && messagesByConvo[convoId]?.length > 0) return;

    loadingRef.add(convoId);

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
      setTimeout(() => {
        loadingRef.delete(convoId);
      }, 1000);
    }
  },
}));
