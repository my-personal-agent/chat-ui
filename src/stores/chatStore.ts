import { ChatMessage } from "@/types/chat";
import { create } from "zustand";

interface ChatStore {
  conversationId: string | null;
  messagesByConvo: Record<string, ChatMessage[]>;
  hasMore: boolean;
  cursor: string | null;
  setConversationId: (id: string | null) => void;
  setHasMore: (flag: boolean) => void;
  setCursor: (cursor: string | null) => void;
  setMessages: (convoId: string, msgs: ChatMessage[]) => void;
  addMessages: (convoId: string, msgs: ChatMessage[]) => void;
  updateMessage: (
    convoId: string,
    msg: Partial<ChatMessage> & { id: string }
  ) => void;
  prependMessages: (convoId: string, msgs: ChatMessage[]) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  conversationId: null,

  messagesByConvo: {},

  hasMore: true,

  cursor: null,

  setConversationId: (id) =>
    set(() => ({
      conversationId: id,
    })),

  setHasMore: (flag) =>
    set(() => ({
      hasMore: flag,
    })),

  setCursor: (cursor) =>
    set(() => ({
      cursor: cursor,
    })),

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

  prependMessages: (conversationId, msgs) =>
    set((s) => {
      const existing = s.messagesByConvo[conversationId] ?? [];
      return {
        messagesByConvo: {
          ...s.messagesByConvo,
          [conversationId]: [...msgs, ...existing],
        },
      };
    }),
}));
