import { ChatUI } from "@/components/chat/chat-ui";
import { Message } from "@/types/chat";

export default async function Page({
  params,
}: {
  params: Promise<{ conversation_id: string }>;
}) {
  const { conversation_id } = await params;
  let initialMessages: Message[] = [];

  try {
    const apiUrl = `${process.env.API_BASE_URL}/chat/conversations/${conversation_id}/messages`;

    const res = await fetch(apiUrl, {
      cache: "no-store", // or 'force-cache' if you want to cache
    });

    if (!res.ok) {
      throw new Error("Failed to fetch conversation messages");
    }

    initialMessages = await res.json();
  } catch (error) {
    console.error("Error loading messages:", error);
  }

  return (
    <ChatUI
      initialConversationId={conversation_id}
      initialMessages={initialMessages}
    />
  );
}
