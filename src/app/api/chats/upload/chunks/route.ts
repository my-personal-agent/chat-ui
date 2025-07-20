import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const chunk = formData.get("chunk") as File | null;
    const fileName = formData.get("filename") as string | null;
    const chunkIndex = formData.get("chunk_index") as string | null;
    const totalChunks = formData.get("total_chunks") as string | null;
    const fileId = formData.get("file_id") as string | null;

    if (!chunk || !fileName || !chunkIndex || !totalChunks) {
      return NextResponse.json(
        { error: "Missing required data" },
        { status: 400 }
      );
    }

    // Forward to FastAPI backend
    const backendFormData = new FormData();
    backendFormData.append("chunk", chunk);
    backendFormData.append("filename", fileName);
    backendFormData.append("chunk_index", chunkIndex);
    backendFormData.append("total_chunks", totalChunks);
    if (fileId) backendFormData.append("file_id", fileId);

    const resp = await fetch(
      `${process.env.API_BASE_URL}/chats/upload/chunks`,
      {
        method: "POST",
        body: backendFormData,
      }
    );

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json({ error: text }, { status: resp.status });
    }

    const result = await resp.json();
    return NextResponse.json(result);
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
