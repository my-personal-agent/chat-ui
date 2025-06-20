export type ChatRole = "user" | "system" | "bot" | "error";

export interface ChatMessage {
  type:
    | "create"
    | "init"
    | "start_thinking"
    | "thinking"
    | "end_thinking"
    | "start_messaging"
    | "messaging"
    | "end_messaging"
    | "error"
    | "complete"
    | "pong";
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
  conversation_id: string;
  isProcessing?: boolean;
}

export interface WSOutgoing {
  type: "ping" | "resume" | "user_message" | "stop";
  message?: string;
  conversation_id?: string;
}
