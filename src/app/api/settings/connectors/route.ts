import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const apiUrl = new URL(`${process.env.API_BASE_URL}/connectors`);

  const res = await fetch(apiUrl.toString());
  const data = await res.json();

  return Response.json(data);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { connector, currentUri } = body;

    const apiUrl = new URL(`${process.env.GOOGLE_SERVICE_URL}/auth`);

    const clientId = process.env.GOOGLE_SERVICE_CLIENT_ID ?? "";
    apiUrl.searchParams.set("client_id", clientId);
    apiUrl.searchParams.set("auth_type", connector);
    apiUrl.searchParams.set("current_uri", currentUri);

    const res = await fetch(apiUrl.toString());

    if (!res.ok) {
      throw new Error("Failed to fetch auth URL");
    }

    const data = await res.json();

    // Return the URL to the client
    return NextResponse.json({ url: data.url });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
