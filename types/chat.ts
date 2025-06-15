export interface Message {
  id: string;
  sender: "user" | "bot" | "system" | "error";
  text: string;
  isProcessing?: boolean;
  timestamp?: number;
}
