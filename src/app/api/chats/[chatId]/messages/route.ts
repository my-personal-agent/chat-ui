export async function GET(
  request: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const { chatId } = await params;

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");

  const limit = parseInt(process.env.CHAT_MESSAGES_EXTRACT_LIMIT || "20");

  const apiUrl = new URL(
    `${process.env.API_BASE_URL}/chats/${chatId}/messages`
  );

  apiUrl.searchParams.set("limit", limit.toString());
  if (cursor) {
    apiUrl.searchParams.set("cursor", cursor);
  }

  const res = await fetch(apiUrl.toString());
  const data = await res.json();

  return Response.json(data);
}
