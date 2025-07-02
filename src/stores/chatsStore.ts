import { ChatMessage } from "@/types/chat";
import { create } from "zustand";

interface ChatState {
  chats: ChatMessage[];
  cursor: string | null;
  hasMore: boolean;
  fetching: boolean;

  loadChats: () => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  addChats: (newChats: ChatMessage[]) => void;
  prependChats: (oldChats: ChatMessage[]) => void;
  updateChat: (updatedChat: Partial<ChatMessage> & { id: string }) => void;
  setHasMore: (hasMore: boolean) => void;
  setCursor: (cursor: string | null) => void;
}

interface ApiChat {
  id: string;
  title: string;
  timestamp: number;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  cursor: null,
  hasMore: true,
  fetching: false,

  loadChats: async () => {
    const { fetching, cursor, hasMore, prependChats, setHasMore, setCursor } =
      get();
    if (fetching || !hasMore) return;

    set({ fetching: true });

    try {
      const res = await fetch(`/api/chats?cursor=${cursor ?? ""}`);
      const data = await res.json();

      // transform chat object to include `url`
      const mappedChats: ChatMessage[] = (data.chats as ApiChat[]).map(
        (chat: ApiChat): ChatMessage => ({
          id: chat.id,
          title: chat.title,
          url: `/chat/${chat.id}`, // generate URL here
          timestamp: chat.timestamp,
        })
      );

      prependChats(mappedChats);
      setHasMore(!!data.next_cursor);
      setCursor(data.next_cursor);
    } catch (err) {
      console.error("Failed to load chats:", err);
    } finally {
      set({ fetching: false });
    }
  },

  deleteChat: async (chatId: string) => {
    await fetch(`/api/chats/${chatId}`, {
      method: "DELETE",
    });

    set((state) => ({
      chats: state.chats.filter((chat) => chat.id !== chatId),
    }));
  },

  addChats: (newChats) =>
    set((state) => ({
      chats: [...state.chats, ...newChats],
    })),

  prependChats: (oldChats) =>
    set((state) => ({
      chats: [...oldChats, ...state.chats],
    })),

  updateChat: (updatedChat: Partial<ChatMessage> & { id: string }) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === updatedChat.id ? { ...chat, ...updatedChat } : chat
      ),
    })),

  setHasMore: (hasMore) => set({ hasMore }),
  setCursor: (cursor) => set({ cursor }),
}));
