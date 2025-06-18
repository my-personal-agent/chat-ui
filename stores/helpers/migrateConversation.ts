import { useConversationStore } from "@/stores/useConversationStore";

export function migrateConversation(fromId: string, toId: string) {
  const state = useConversationStore.getState();
  const from = state.conversations[fromId];
  if (!from) return;

  useConversationStore.setState((prev) => ({
    conversations: {
      ...prev.conversations,
      [toId]: {
        messages: from.messages,
        cursor: from.cursor,
        hasMore: from.hasMore,
      },
    },
  }));

  useConversationStore.getState().resetConversation(fromId);
}
