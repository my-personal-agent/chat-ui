"use client";

import { useChatMessagesStore } from "@/stores/chatMessagesStore";
import { ChatMessage, WSOutgoing } from "@/types/chat";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { create } from "zustand";

interface WebSocketState {
  ws: WebSocket | null;
  isStreaming: boolean;
  showLoading: boolean;
  router: ReturnType<typeof useRouter> | null;
  connect: () => void;
  sendMessage: (text: string) => void;
  stopStreaming: () => void;
  setRouter: (router: ReturnType<typeof useRouter>) => void;
}

export const useChatMessagesWebSocket = create<WebSocketState>((set, get) => {
  let reconnectAttempts = 0;

  const connect = () => {
    const currentWs = get().ws;
    if (currentWs && currentWs.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/ws/chat`);
    set({ ws });

    const chatStore = useChatMessagesStore.getState();

    ws.onopen = () => {
      reconnectAttempts = 0;
      const convoId = chatStore.conversationId;
      if (convoId) {
        ws.send(
          JSON.stringify({
            type: "resume",
            conversation_id: convoId,
          } as WSOutgoing)
        );
      }
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data) as ChatMessage;
      const { router } = get();

      switch (data.type) {
        case "create":
          chatStore.setHasMore(false);
          chatStore.setCursor(null);
          router?.push(`/chat/${data.conversation_id}`);
          return;

        case "init":
          chatStore.addMessages(data.conversation_id, [data]);
          set({ showLoading: true });
          return;

        case "start_thinking":
        case "start_messaging":
          chatStore.addMessages(data.conversation_id, [data]);
          set({ showLoading: false });
          return;

        case "thinking":
        case "messaging":
          chatStore.updateMessage(data.conversation_id, {
            id: data.id,
            content: data.content,
            timestamp: data.timestamp,
            isProcessing: true,
          });
          set({ showLoading: false });
          return;

        case "end_thinking":
        case "end_messaging":
          chatStore.updateMessage(data.conversation_id, {
            id: data.id,
            content: data.content,
            timestamp: data.timestamp,
            isProcessing: false,
          });
          set({ showLoading: true });
          return;

        case "complete":
          set({ isStreaming: false, showLoading: false });
          return;

        case "error":
          chatStore.addMessages(data.conversation_id, [data]);
          set({ isStreaming: false, showLoading: false });
          return;

        case "pong":
          return;
      }
    };

    ws.onerror = () => console.error("WebSocket error");

    ws.onclose = () => {
      set({ ws: null, isStreaming: false });

      const delay = Math.min(1000 * 2 ** reconnectAttempts, 30000);
      reconnectAttempts++;
      setTimeout(connect, delay);
    };

    // Ping every 30s
    const pingInterval = setInterval(() => {
      const current = get().ws;
      if (current?.readyState === WebSocket.OPEN) {
        current.send(JSON.stringify({ type: "ping" } as WSOutgoing));
      }
    }, 30000);

    // Clear ping on manual reconnect or cleanup
    return () => clearInterval(pingInterval);
  };

  const sendMessage = (text: string) => {
    const { ws } = get();
    const convoId = useChatMessagesStore.getState().conversationId;

    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "user_message",
          message: text,
          ...(convoId ? { conversation_id: convoId } : {}),
        } as WSOutgoing)
      );
      set({
        isStreaming: true,
        showLoading: true,
      });
    }
  };

  const stopStreaming = () => {
    const { ws } = get();
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "stop" } as WSOutgoing));
    }
    set({ isStreaming: false, showLoading: false });
  };

  const setRouter = (router: ReturnType<typeof useRouter>) => {
    set({ router });
  };

  return {
    ws: null,
    isStreaming: false,
    showLoading: false,
    router: null,
    initUserMsg: null,
    connect,
    sendMessage,
    stopStreaming,
    setRouter,
  };
});

export const useInitializeChatMessagesWebSocket = () => {
  const router = useRouter();
  const setRouter = useChatMessagesWebSocket((state) => state.setRouter);

  useEffect(() => {
    setRouter(router);
  }, [router, setRouter]);

  // Return the selectors, not the store itself
  return {
    ws: useChatMessagesWebSocket((state) => state.ws),
    isStreaming: useChatMessagesWebSocket((state) => state.isStreaming),
    showLoading: useChatMessagesWebSocket((state) => state.showLoading),
    connect: useChatMessagesWebSocket((state) => state.connect),
    sendMessage: useChatMessagesWebSocket((state) => state.sendMessage),
    stopStreaming: useChatMessagesWebSocket((state) => state.stopStreaming),
  };
};
