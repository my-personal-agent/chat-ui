export async function GET(
  request: Request,
  { params }: { params: Promise<{ conversation_id: string }> }
) {
  const { conversation_id } = await params;

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "20");
  const cursor = searchParams.get("cursor");

  const apiUrl = new URL(
    `${process.env.API_BASE_URL}/chat/conversations/${conversation_id}/messages`
  );

  apiUrl.searchParams.set("limit", limit.toString());
  if (cursor) {
    apiUrl.searchParams.set("cursor", cursor);
  }

  const res = await fetch(apiUrl.toString());
  const data = await res.json();

  return Response.json(data);
}
