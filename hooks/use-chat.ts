"use client";

import { Message } from "@/types/chat";
import { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export function useChat(initialConversationId: string | null = null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState(initialConversationId);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const userIdRef = useRef<string | null>(null);

  const sendMessage = (messageText: string) => {
    eventSourceRef.current?.close();
    userIdRef.current = null;

    const userMsg: Message = {
      id: uuidv4(),
      content: messageText,
      role: "user",
      timestamp: Date.now(),
    };
    userIdRef.current = userMsg.id;
    setMessages((m) => [...m, userMsg]);

    setIsStreaming(true);
    setShowLoading(true);

    const params = new URLSearchParams({
      message: messageText,
      ...(conversationId ? { conversation_id: conversationId } : {}),
    });
    const es = new EventSource(`/api/chat/stream?${params}`);
    eventSourceRef.current = es;

    es.addEventListener("init", (e) => {
      const data = JSON.parse(e.data);

      const id = userIdRef.current;
      if (!id) return;
      setMessages((m) =>
        m.map((msg) =>
          msg.id === id
            ? {
                ...msg,
                id: data.id,
                timestamp: data.timestamp,
              }
            : msg
        )
      );
      userIdRef.current = data.id;

      if (!conversationId && data.conversation_id) {
        setConversationId(data.conversation_id);

        const url = new URL(window.location.href);
        url.pathname = `/${data.conversation_id}`;
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
      setMessages((m) => [...m, sysMsg]);
    });

    es.addEventListener("thinking", (e) => {
      const data = JSON.parse(e.data);
      setMessages((m) =>
        m.map((msg) =>
          msg.id === data.id
            ? {
                ...msg,
                content: data.content,
                timestamp: data.timestamp,
                isProcessing: true,
              }
            : msg
        )
      );
    });

    es.addEventListener("end_thinking", (e) => {
      setShowLoading(true);
      const data = JSON.parse(e.data);
      setMessages((m) =>
        m.map((msg) =>
          msg.id === data.id
            ? {
                ...msg,
                content: data.content,
                timestamp: data.timestamp,
                isProcessing: false,
              }
            : msg
        )
      );
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
      setMessages((m) => [...m, botMsg]);
    });

    es.addEventListener("messaging", (e) => {
      const data = JSON.parse(e.data);
      setMessages((m) =>
        m.map((msg) =>
          msg.id === data.id
            ? {
                ...msg,
                content: data.content,
                timestamp: data.timestamp,
                isProcessing: true,
              }
            : msg
        )
      );
    });

    es.addEventListener("end_messaging", (e) => {
      setShowLoading(true);
      const data = JSON.parse(e.data);
      setMessages((m) =>
        m.map((msg) =>
          msg.id === data.id
            ? {
                ...msg,
                content: data.content,
                timestamp: data.timestamp,
                isProcessing: false,
              }
            : msg
        )
      );
    });

    const cleanup = () => {
      setIsStreaming(false);
      setShowLoading(false);
      userIdRef.current = null;
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
      setMessages((m) => [...m, errorMsg]);
    };
  };

  const stopStreaming = () => {
    setIsStreaming(false);
    setShowLoading(false);
    userIdRef.current = null;
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
  };

  return {
    messages,
    isStreaming,
    showLoading,
    sendMessage,
    stopStreaming,
  };
}
