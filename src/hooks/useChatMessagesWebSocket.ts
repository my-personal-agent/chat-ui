"use client";

import { useChatMessagesStore } from "@/stores/chatMessagesStore";
import { useChatStore } from "@/stores/chatsStore";
import { SendConfrimation, StreamChatMessage, WSOutgoing } from "@/types/chat";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { create } from "zustand";

interface WebSocketState {
  ws: WebSocket | null;
  isStreaming: boolean;
  showLoading: boolean;
  showingConfirmation: boolean;
  router: ReturnType<typeof useRouter> | null;
  connect: () => void;
  sendMessage: (text: string) => void;
  sendConfirmation: (msgId: string, confirmation: SendConfrimation) => void;
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

    const chatMessagesStore = useChatMessagesStore.getState();
    const chatsStore = useChatStore.getState();

    ws.onopen = () => {
      reconnectAttempts = 0;
      const chatId = chatMessagesStore.chatId;
      if (chatId) {
        ws.send(
          JSON.stringify({
            type: "resume",
            chat_id: chatId,
          } as WSOutgoing)
        );
      }
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data) as StreamChatMessage;
      const { router } = get();

      switch (data.type) {
        case "create_chat":
          chatMessagesStore.setHasMore(false);
          chatMessagesStore.setCursor(null);
          chatsStore.addChats([
            {
              id: data.chat_id,
              title: data.content as string,
              timestamp: data.timestamp,
              url: `/chat/${data.chat_id}`,
            },
          ]);
          router?.push(`/chat/${data.chat_id}`);
          set({ showLoading: false, showingConfirmation: false });
          return;

        case "update_chat":
          chatsStore.updateChat({
            id: data.chat_id,
            timestamp: data.timestamp,
          });
          set({ showLoading: false, showingConfirmation: false });
          return;

        case "init":
          chatMessagesStore.addMessages(data.chat_id, [data]);
          set({ showLoading: true, showingConfirmation: false });
          return;

        case "start_thinking":
        case "start_messaging":
          chatMessagesStore.addMessages(data.chat_id, [
            { ...data, isProcessing: true },
          ]);
          set({ showLoading: false, showingConfirmation: false });
          return;

        case "thinking":
        case "messaging":
          chatMessagesStore.updateMessage(data.chat_id, {
            id: data.id,
            content: data.content,
            timestamp: data.timestamp,
            isProcessing: true,
          });
          set({ showLoading: false, showingConfirmation: false });
          return;

        case "end_thinking":
        case "end_messaging":
          chatMessagesStore.updateMessage(data.chat_id, {
            id: data.id,
            content: data.content,
            timestamp: data.timestamp,
            isProcessing: false,
          });
          set({ showLoading: true, showingConfirmation: false });
          return;

        case "checking_title":
          chatsStore.updateChat({
            id: data.chat_id,
            isProcessing: true,
          });
          set({ showLoading: false, showingConfirmation: false });
          return;

        case "generated_title":
          chatsStore.updateChat({
            id: data.chat_id,
            title: data.content as string,
            timestamp: data.timestamp,
            isProcessing: false,
          });
          set({ showLoading: false, showingConfirmation: false });
          return;

        case "confirmation":
          chatMessagesStore.addMessages(data.chat_id, [data]);
          set({
            showLoading: false,
            isStreaming: false,
            showingConfirmation: true,
          });
          return;

        case "end_confirmation":
          console.log(data);
          chatMessagesStore.updateMessage(data.chat_id, {
            id: data.id,
            content: data.content,
            timestamp: data.timestamp,
          });
          set({
            showingConfirmation: false,
          });
          return;

        case "complete":
          set({
            isStreaming: false,
            showLoading: false,
            showingConfirmation: false,
          });
          return;

        case "error":
          chatMessagesStore.addMessages(data.chat_id, [data]);
          set({
            isStreaming: false,
            showLoading: false,
            showingConfirmation: false,
          });
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
    const chatId = useChatMessagesStore.getState().chatId;

    if (ws?.readyState === WebSocket.OPEN) {
      set({
        isStreaming: true,
        showLoading: true,
      });
      ws.send(
        JSON.stringify({
          type: "user_message",
          message: text,
          ...(chatId ? { chat_id: chatId } : {}),
        } as WSOutgoing)
      );
    }
  };

  const sendConfirmation = (msgId: string, confirmation: SendConfrimation) => {
    const { ws } = get();
    const chatId = useChatMessagesStore.getState().chatId;

    if (ws?.readyState === WebSocket.OPEN && chatId) {
      set({
        showingConfirmation: false,
        isStreaming: true,
        showLoading: true,
      });

      ws.send(
        JSON.stringify({
          type: "user_message",
          message: confirmation,
          chat_id: chatId,
          msg_id: msgId,
        } as WSOutgoing)
      );
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
    showingConfirmation: false,
    router: null,
    initUserMsg: null,
    connect,
    sendMessage,
    sendConfirmation,
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
    showingConfirmation: useChatMessagesWebSocket(
      (state) => state.showingConfirmation
    ),
    connect: useChatMessagesWebSocket((state) => state.connect),
    sendMessage: useChatMessagesWebSocket((state) => state.sendMessage),
    sendConfirmation: useChatMessagesWebSocket(
      (state) => state.sendConfirmation
    ),
    stopStreaming: useChatMessagesWebSocket((state) => state.stopStreaming),
  };
};
