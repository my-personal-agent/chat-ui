import { Message } from "@/types/chat";
import { useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const botIdRef = useRef<string | null>(null);
  const sysIdRef = useRef<string | null>(null);

  const sendMessage = (messageText: string, conversationId = "default") => {
    eventSourceRef.current?.close();
    botIdRef.current = null;
    sysIdRef.current = null;

    const userMsg: Message = {
      id: uuidv4(),
      text: messageText,
      sender: "user",
      timestamp: Date.now(),
    };
    setMessages((m) => [...m, userMsg]);
    setIsStreaming(true);
    setShowLoading(true);

    const params = new URLSearchParams({
      message: messageText,
      conversation_id: conversationId,
    });
    const es = new EventSource(`/api/chat/stream?${params}`);
    eventSourceRef.current = es;

    es.addEventListener("start_thinking", () => {
      setShowLoading(false);
      const id = uuidv4();
      sysIdRef.current = id;
      const sysMsg: Message = {
        id,
        text: "",
        sender: "system",
        isProcessing: false,
        timestamp: Date.now(),
      };
      setMessages((m) => [...m, sysMsg]);
    });

    es.addEventListener("thinking", (e) => {
      const id = sysIdRef.current;
      if (!id) return;
      setMessages((m) =>
        m.map((msg) =>
          msg.id === id
            ? {
                ...msg,
                text: msg.text + e.data,
                timestamp: Date.now(),
                isProcessing: true,
              }
            : msg
        )
      );
    });

    es.addEventListener("end_thinking", () => {
      setShowLoading(true);
      const id = sysIdRef.current;
      if (id) {
        setMessages((m) =>
          m.map((msg) =>
            msg.id === id
              ? {
                  ...msg,
                  timestamp: Date.now(),
                  isProcessing: false,
                }
              : msg
          )
        );
      }
      sysIdRef.current = null;
    });

    es.addEventListener("messaging", (e) => {
      const data = e.data;
      if (!botIdRef.current) {
        if (data.trim() == "") {
          setShowLoading(true);
          return;
        }
        const id = uuidv4();
        botIdRef.current = id;
        const botMsg: Message = {
          id,
          text: data,
          sender: "bot",
          timestamp: Date.now(),
        };
        setMessages((m) => [...m, botMsg]);
        setShowLoading(false);
      } else {
        const id = botIdRef.current;
        setMessages((m) =>
          m.map((msg) =>
            msg.id === id
              ? { ...msg, text: msg.text + data, timestamp: Date.now() }
              : msg
          )
        );
      }
    });

    const cleanup = () => {
      setIsStreaming(false);
      setShowLoading(false);
      sysIdRef.current = null;
      botIdRef.current = null;
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };

    es.addEventListener("complete", cleanup);
    es.onerror = (err) => {
      console.error("SSE error:", err);
      cleanup();
      const errorMsg: Message = {
        id: uuidv4(),
        text: "❌ Error occurred while processing your request.",
        sender: "error",
        timestamp: Date.now(),
      };
      setMessages((m) => [...m, errorMsg]);
    };
  };

  const stopStreaming = () => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    setIsStreaming(false);
    setShowLoading(false);
    sysIdRef.current = null;
    botIdRef.current = null;
  };

  return {
    messages,
    isStreaming,
    showLoading,
    sendMessage,
    stopStreaming,
  };
}
