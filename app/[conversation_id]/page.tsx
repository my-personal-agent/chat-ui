import { ChatUI } from "@/components/chat/chat-ui";

export default async function ChatPage({
  params,
}: {
  params: { conversation_id: string };
}) {
  return <ChatUI conversationId={params.conversation_id} />;
}
