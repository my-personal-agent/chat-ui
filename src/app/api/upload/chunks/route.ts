import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const fileName = request.headers.get("x-filename");
    const chunkIndex = request.headers.get("x-chunk-index");
    const totalChunks = request.headers.get("x-total-chunks");
    const fileId = request.headers.get("x-file-id"); // Optional - only present after first chunk

    if (!fileName || !chunkIndex || !totalChunks) {
      return NextResponse.json(
        { error: "Missing required headers" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const chunk = formData.get("chunk") as File;

    if (!chunk) {
      return NextResponse.json({ error: "No chunk provided" }, { status: 400 });
    }

    // Forward to FastAPI backend
    const backendFormData = new FormData();
    backendFormData.append("chunk", chunk);

    // Build headers - only include file_id if we have one
    const backendHeaders: Record<string, string> = {
      "x-filename": fileName,
      "x-chunk-index": chunkIndex,
      "x-total-chunks": totalChunks,
    };

    if (fileId) {
      backendHeaders["x-file-id"] = fileId;
    }

    const backendResponse = await fetch(
      `${process.env.AGENT_RAG_SERVICE_URL}/upload/chunks`,
      {
        method: "POST",
        headers: backendHeaders,
        body: backendFormData,
      }
    );

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      throw new Error(
        `Backend upload failed: ${backendResponse.statusText} - ${errorText}`
      );
    }

    const result = await backendResponse.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
