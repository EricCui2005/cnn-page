import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Convert the image to a buffer
    const buffer = await image.arrayBuffer();

    // Forward the request to your CNN model server
    const response = await fetch("http://127.0.0.1:5000/classify", {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: buffer,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error during classification:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Classification failed",
      },
      { status: 500 }
    );
  }
}
