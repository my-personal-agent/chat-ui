import { ChatItem } from "@/types/chat";
import { create } from "zustand";

interface ChatState {
  chats: ChatItem[];
  page: number;
  pageSize: number;
  hasMore: boolean;

  loadChats: () => Promise<void>;
  loadMore: () => void;
  addChat: (chat: ChatItem) => void;
  updateChatTitle: (chatId: string, newTitle: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  page: 1,
  pageSize: 10,
  hasMore: true,

  loadChats: async () => {
    const { page, pageSize } = get();
    const res = await fetch(`/api/chats?page=${page}&limit=${pageSize}`);
    const data: ChatItem[] = await res.json();
    set((state) => ({
      chats: [...state.chats, ...data],
      hasMore: data.length === state.pageSize,
    }));
  },

  loadMore: () => {
    set((state) => ({ page: state.page + 1 }), false);
    get().loadChats();
  },

  addChat: (chat) =>
    set((state) => ({
      chats: [chat, ...state.chats],
    })),

  updateChatTitle: (chatId, newTitle) =>
    set((state) => ({
      chats: state.chats.map((c) =>
        c.id === chatId ? { ...c, name: newTitle } : c
      ),
    })),
}));
