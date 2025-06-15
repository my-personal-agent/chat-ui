import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.toString();
  const apiUrl = `${process.env.API_BASE_URL}/chat/stream?${query}`;

  try {
    const fastApiRes = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "text/event-stream",
      },
    });

    if (!fastApiRes.body) {
      return new Response("FastAPI response has no body", { status: 500 });
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = fastApiRes.body!.getReader();

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            break;
          }
          controller.enqueue(value);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("Failed to proxy SSE from FastAPI:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
