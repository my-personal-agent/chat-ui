import { ChatUI } from "@/components/chat/chat-ui";

export default async function Page({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;
  return <ChatUI initialChatId={chatId} />;
}
