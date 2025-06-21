import { ChatItem } from "@/types/chat";
import { create } from "zustand";

interface ChatState {
  chats: ChatItem[];
  cursor: string | null;
  hasMore: boolean;
  fetching: boolean;

  loadChats: () => Promise<void>;
  addChats: (newChats: ChatItem[]) => void;
  prependChats: (oldChats: ChatItem[]) => void;
  updateChat: (updatedChat: Partial<ChatItem> & { id: string }) => void;
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
      const mappedChats: ChatItem[] = (data.chats as ApiChat[]).map(
        (chat: ApiChat): ChatItem => ({
          id: chat.id,
          title: chat.title,
          url: `/chat/${chat.id}`, // generate URL here
          timestamp: chat.timestamp,
        })
      );

      prependChats(mappedChats);
      setHasMore(!!data.nextCursor);
      setCursor(data.nextCursor);
    } catch (err) {
      console.error("Failed to load chats:", err);
    } finally {
      set({ fetching: false });
    }
  },

  addChats: (newChats) =>
    set((state) => ({
      chats: [...state.chats, ...newChats],
    })),

  prependChats: (oldChats) =>
    set((state) => ({
      chats: [...oldChats, ...state.chats],
    })),

  updateChat: (updatedChat: Partial<ChatItem> & { id: string }) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === updatedChat.id ? { ...chat, ...updatedChat } : chat
      ),
    })),

  setHasMore: (hasMore) => set({ hasMore }),
  setCursor: (cursor) => set({ cursor }),
}));
