export type ChatRole =
  | "user"
  | "system"
  | "assistant"
  | "confirmation"
  | "error";

export type ChatMessageApproveType =
  | "asking"
  | "accept"
  | "update"
  | "feedback"
  | "cancel";

export interface StreamChatMessageConfirmation {
  name: str;
  args: { [key: string]: string };
  approve: ChatMessageApproveType;
}

export interface StreamChatMessageUploadedFile {
  id: str;
  filename: str;
}

export interface StreamChatMessage {
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
    | "confirmation"
    | "end_confirmation"
    | "error"
    | "complete"
    | "pong";
  id: string;
  role: ChatRole;
  content: string | StreamChatMessageConfirmation;
  upload_files: StreamChatMessageUploadedFile[];
  timestamp: number;
  chat_id: string;
  isProcessing?: boolean;
}

export interface SendConfrimation {
  approve: "accept" | "update" | "cancel" | "feedback";
  data?: unknown;
}

export interface WSOutgoing {
  type: "ping" | "resume" | "user_message" | "stop";
  message?: string | SendConfrimation;
  chat_id?: string;
  msg_id?: string;
  upload_files?: StreamChatMessageUploadedFile[];
}

export interface Chat {
  id: string;
  title: string;
  url: string;
  timestamp: float;
  isProcessing?: boolean;
}
