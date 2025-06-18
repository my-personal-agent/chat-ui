// stores/useConversationStore.ts
import { Message } from "@/types/chat";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ConversationData {
  messages: Message[];
  cursor: string | null;
  hasMore: boolean;
}

interface PartialMessageUpdate {
  id: string; // original message ID
  newId?: string; // optional replacement ID (e.g., after /init)
  content?: string;
  timestamp?: number;
  isProcessing?: boolean;
}

interface Store {
  conversations: Record<string, ConversationData>;
  setConversationMessages: (id: string, messages: Message[]) => void;
  appendMessages: (id: string, messages: Message[]) => void;
  updateMessage: (id: string, update: PartialMessageUpdate) => void;
  setCursor: (id: string, cursor: string | null) => void;
  setHasMore: (id: string, hasMore: boolean) => void;
  resetConversation: (id: string) => void;
}

export const useConversationStore = create<Store>()(
  persist(
    (set) => ({
      conversations: {},
      setConversationMessages: (id, messages) =>
        set((state) => ({
          conversations: {
            ...state.conversations,
            [id]: {
              ...(state.conversations[id] ?? {
                messages: [],
                cursor: null,
                hasMore: true,
              }),
              messages,
            },
          },
        })),
      appendMessages: (id, newMessages) =>
        set((state) => {
          const existing = state.conversations[id]?.messages || [];
          return {
            conversations: {
              ...state.conversations,
              [id]: {
                ...(state.conversations[id] ?? {
                  cursor: null,
                  hasMore: true,
                }),
                messages: [...newMessages, ...existing],
              },
            },
          };
        }),
      updateMessage: (id, update) =>
        set((state) => {
          const conv = state.conversations[id];
          if (!conv) return {};

          const updatedMessages = conv.messages.map((msg) =>
            msg.id === update.id
              ? {
                  ...msg,
                  ...(update.newId ? { id: update.newId } : {}),
                  ...(update.content !== undefined
                    ? { content: update.content }
                    : {}),
                  ...(update.timestamp !== undefined
                    ? { timestamp: update.timestamp }
                    : {}),
                  ...(update.isProcessing !== undefined
                    ? { isProcessing: update.isProcessing }
                    : {}),
                }
              : msg
          );

          return {
            conversations: {
              ...state.conversations,
              [id]: {
                ...conv,
                messages: updatedMessages,
              },
            },
          };
        }),
      setCursor: (id, cursor) =>
        set((state) => ({
          conversations: {
            ...state.conversations,
            [id]: {
              ...(state.conversations[id] ?? {
                messages: [],
                hasMore: true,
              }),
              cursor,
            },
          },
        })),
      setHasMore: (id, hasMore) =>
        set((state) => ({
          conversations: {
            ...state.conversations,
            [id]: {
              ...(state.conversations[id] ?? {
                messages: [],
                cursor: null,
              }),
              hasMore,
            },
          },
        })),
      resetConversation: (id) =>
        set((state) => {
          const newConversations = { ...state.conversations };
          delete newConversations[id];
          return { conversations: newConversations };
        }),
    }),
    {
      name: "conversation-store", // 👈 key in localStorage
      partialize: (state) => ({ conversations: state.conversations }),
    }
  )
);
