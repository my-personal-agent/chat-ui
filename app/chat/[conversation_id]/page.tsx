import { ChatUI } from "@/components/chat/chat-ui";

export default async function Page({
  params,
}: {
  params: Promise<{ conversation_id: string }>;
}) {
  const { conversation_id } = await params;
  return <ChatUI initialConversationId={conversation_id} />;
}
