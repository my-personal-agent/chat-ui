"use client";

import { useConversationStore } from "@/stores/useConversationStore";
import { Message } from "@/types/chat";
import { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface UseChatOptions {
  conversationId: string | null;
  setConversationId: (id: string) => void;
}

export function useChat({ conversationId, setConversationId }: UseChatOptions) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const appendMessages = useConversationStore((s) => s.appendMessages);
  const updateMessage = useConversationStore((s) => s.updateMessage);

  const sendMessage = (messageText: string) => {
    eventSourceRef.current?.close();

    const userMsg: Message = {
      id: uuidv4(),
      role: "user",
      content: messageText,
      timestamp: Date.now(),
    };
    let currentConversationId = conversationId;
    if (!currentConversationId) {
      currentConversationId = "init-" + crypto.randomUUID();
      setConversationId(currentConversationId);
    }
    appendMessages(currentConversationId, [userMsg]);

    setIsStreaming(true);
    setShowLoading(true);

    const params = new URLSearchParams({
      message: messageText,
      ...(conversationId ? { conversation_id: conversationId } : {}),
    });
    const es = new EventSource(`/api/chat/stream?${params}`);
    eventSourceRef.current = es;

    es.addEventListener("init", (e) => {
      if (!conversationId || conversationId.startsWith("init-")) {
        const data = JSON.parse(e.data);
        setConversationId(data.conversation_id);

        const url = new URL(window.location.href);
        url.pathname = `/chat/${data.conversation_id}`;
        window.history.replaceState({}, "", url.toString());
      }
    });

    es.addEventListener("start_thinking", (e) => {
      setShowLoading(false);
      const data = JSON.parse(e.data);
      const sysMsg: Message = {
        id: data.id,
        role: data.role,
        timestamp: data.timestamp,
        content: data.content,
        isProcessing: false,
      };
      appendMessages(data.conversation_id, [sysMsg]);
    });

    es.addEventListener("thinking", (e) => {
      const data = JSON.parse(e.data);
      updateMessage(data.conversation_id, {
        id: data.id,
        content: data.content,
        timestamp: data.timestamp,
        isProcessing: true,
      });
    });

    es.addEventListener("end_thinking", (e) => {
      setShowLoading(true);
      const data = JSON.parse(e.data);
      updateMessage(data.conversation_id, {
        id: data.id,
        content: data.content,
        timestamp: data.timestamp,
        isProcessing: false,
      });
    });

    es.addEventListener("start_messaging", (e) => {
      setShowLoading(false);
      const data = JSON.parse(e.data);
      const botMsg: Message = {
        id: data.id,
        role: data.role,
        timestamp: data.timestamp,
        content: data.content,
        isProcessing: false,
      };
      appendMessages(data.conversation_id, [botMsg]);
    });

    es.addEventListener("messaging", (e) => {
      const data = JSON.parse(e.data);
      updateMessage(data.conversation_id, {
        id: data.id,
        content: data.content,
        timestamp: data.timestamp,
        isProcessing: true,
      });
    });

    es.addEventListener("end_messaging", (e) => {
      setShowLoading(true);
      const data = JSON.parse(e.data);
      updateMessage(data.conversation_id, {
        id: data.id,
        content: data.content,
        timestamp: data.timestamp,
        isProcessing: false,
      });
    });

    const cleanup = () => {
      setIsStreaming(false);
      setShowLoading(false);
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };

    es.addEventListener("complete", () => {
      cleanup();
    });

    es.onerror = (err) => {
      console.error("SSE error:", err);
      cleanup();
      const errorMsg: Message = {
        id: uuidv4(),
        content: "❌ Error occurred while processing your request.",
        role: "error",
        timestamp: Date.now(),
      };
      appendMessages(conversationId ?? "temp", [errorMsg]);
    };
  };

  const stopStreaming = () => {
    setIsStreaming(false);
    setShowLoading(false);
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
  };

  return {
    isStreaming,
    showLoading,
    sendMessage,
    stopStreaming,
  };
}
