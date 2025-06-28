import { ChatMessage } from "@/types/chat";
import { create } from "zustand";

interface ChatState {
  chatId: string | null;
  messagesByChat: Record<string, ChatMessage[]>;
  hasMore: boolean;
  cursor: string | null;
  loadingRef: Set<string>;
  setMessages: (chatId: string, msgs: ChatMessage[]) => void;
  addMessages: (chatId: string, msgs: ChatMessage[]) => void;
  updateMessage: (
    chatId: string,
    msg: Partial<ChatMessage> & { id: string }
  ) => void;
  prependMessages: (id: string, messages: ChatMessage[]) => void;
  setChatId: (id: string | null) => void;
  setHasMore: (hasMore: boolean) => void;
  setCursor: (cursor: string | null) => void;
  loadMoreMessages: (chatId?: string) => Promise<void>;
}

export const useChatMessagesStore = create<ChatState>((set, get) => ({
  chatId: null,
  messagesByChat: {},
  hasMore: true,
  cursor: null,
  loadingRef: new Set(),

  setMessages: (chatId, msgs) =>
    set((s) => ({
      messagesByChat: {
        ...s.messagesByChat,
        [chatId]: msgs,
      },
    })),

  addMessages: (chatId, msgs) =>
    set((s) => {
      const existing = s.messagesByChat[chatId] ?? [];
      return {
        messagesByChat: {
          ...s.messagesByChat,
          [chatId]: [...existing, ...msgs],
        },
      };
    }),

  updateMessage: (chatId: string, msg: Partial<ChatMessage> & { id: string }) =>
    set((s) => {
      const existing = s.messagesByChat[chatId] ?? [];
      const updated = existing.map((m) =>
        m.id === msg.id ? { ...m, ...msg } : m
      );
      return {
        messagesByChat: {
          ...s.messagesByChat,
          [chatId]: updated,
        },
      };
    }),

  prependMessages: (id, messages) =>
    set((state) => ({
      messagesByChat: {
        ...state.messagesByChat,
        [id]: [...messages, ...(state.messagesByChat[id] || [])],
      },
    })),

  setChatId: (id) => set({ chatId: id }),
  setHasMore: (hasMore) => set({ hasMore }),
  setCursor: (cursor) => set({ cursor }),

  loadMoreMessages: async (targetChatId) => {
    const chatId = targetChatId || get().chatId;
    const {
      messagesByChat,
      hasMore,
      cursor,
      prependMessages,
      setHasMore,
      setCursor,
      loadingRef,
    } = get();

    if (!chatId || chatId === "new") return;
    if (loadingRef.has(chatId)) return;
    if (!hasMore && messagesByChat[chatId]?.length > 0) return;

    loadingRef.add(chatId);

    try {
      const res = await fetch(
        `/api/chats/${chatId}/messages?cursor=${cursor ?? ""}`
      );
      const data = (await res.json()) as {
        messages: ChatMessage[];
        next_cursor: string | null;
      };

      prependMessages(chatId, data.messages);
      setHasMore(!!data.next_cursor);
      setCursor(data.next_cursor);
    } catch (e) {
      console.error("Failed to load more messages", e);
    } finally {
      setTimeout(() => {
        loadingRef.delete(chatId);
      }, 1000);
    }
  },
}));
