import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Extracting image data from form request
    const formData = await request.formData();
    const image = formData.get("image") as File;

    // Return error if no image is provided
    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Buffer conversion and hitting the model server
    const buffer = await image.arrayBuffer();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      throw new Error("API URL is not configured");
    }
    const response = await fetch(`${apiUrl}/feature-maps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: buffer,
    });

    // Return error if the request fails
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Return the result
    const result = await response.json();
    return NextResponse.json(result);

    // Error catching
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
