import { ChatUI } from "@/components/chat/chat-ui";

export default async function Page({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  return <ChatUI initialConversationId={conversationId} />;
}
