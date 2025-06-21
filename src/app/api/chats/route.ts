export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");

  const limit = parseInt(process.env.CHATS_EXTRACT_LIMIT || "30");

  const apiUrl = new URL(`${process.env.API_BASE_URL}/chats`);

  apiUrl.searchParams.set("limit", limit.toString());
  if (cursor) {
    apiUrl.searchParams.set("cursor", cursor);
  }

  const res = await fetch(apiUrl.toString());
  const data = await res.json();

  return Response.json(data);
}
