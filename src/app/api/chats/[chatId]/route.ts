export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;

    // Construct the correct API URL with the chatId
    const apiUrl = new URL(`${process.env.API_BASE_URL}/chats/${chatId}`);

    // Make the DELETE request to your backend API
    const res = await fetch(apiUrl.toString(), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Check if the request was successful
    if (!res.ok) {
      const errorData = await res
        .json()
        .catch(() => ({ message: "Unknown error" }));
      return Response.json(
        { error: errorData.message || "Failed to delete chat" },
        { status: res.status }
      );
    }

    // Return success response
    return Response.json(
      { message: "Chat deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting chat:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
