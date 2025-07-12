import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;

  const backendResponse = await fetch(
    `${process.env.AGENT_RAG_SERVICE_URL}/upload/${fileId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!backendResponse.ok) {
    const errorText = await backendResponse.text();
    throw new Error(
      `Backend delete failed: ${backendResponse.statusText} - ${errorText}`
    );
  }

  // ✅ If backend returns 204 No Content, skip JSON parsing
  if (backendResponse.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const result = await backendResponse.json();
  return NextResponse.json(result);
}
