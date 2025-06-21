export type ChatRole = "user" | "system" | "assistant" | "error";

export interface ChatMessage {
  type:
    | "create_chat"
    | "update_chat"
    | "init"
    | "start_thinking"
    | "thinking"
    | "end_thinking"
    | "start_messaging"
    | "messaging"
    | "end_messaging"
    | "checking_title"
    | "generated_title"
    | "error"
    | "complete"
    | "pong";
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
  chat_id: string;
  isProcessing?: boolean;
}

export interface WSOutgoing {
  type: "ping" | "resume" | "user_message" | "stop";
  message?: string;
  chat_id?: string;
}

export interface ChatItem {
  id: string;
  title: string;
  url: string;
  timestamp: float;
  isProcessing?: boolean;
}
