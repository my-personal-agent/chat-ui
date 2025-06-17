export interface Message {
  id: string;
  role: "user" | "bot" | "system" | "error";
  content: string;
  isProcessing?: boolean;
  timestamp?: number;
}
