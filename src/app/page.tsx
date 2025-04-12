"use client";
import "./globals.css";
import { renderGrayscaleMap } from "@/utils/canvasUtils"; // Import the utility function
import { LoadingOverlay } from "@/components/LoadingOverlay";

import { useState, useEffect } from "react";

export default function Home() {
  const [probabilities, setProbabilities] = useState<number[]>(
    Array(10).fill(0)
  ); // Probabilities state for each class (initialized to 0)
  const [imageLoaded, setImageLoaded] = useState(false); // Image loaded state
  const [featureMap, setFeatureMap] = useState<number[][][]>([]); // Feature maps state
  const [previewSrc, setPreviewSrc] = useState<string | null>(null); // State for image preview src
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Image classes with their probabilities
  const categories = [
    { name: "Tench", score: probabilities[0] },
    { name: "English Springer", score: probabilities[1] },
    { name: "Cassette Player", score: probabilities[2] },
    { name: "Chainsaw", score: probabilities[3] },
    { name: "Church", score: probabilities[4] },
    { name: "French Horn", score: probabilities[5] },
    { name: "Garbage Truck", score: probabilities[6] },
    { name: "Gas Pump", score: probabilities[7] },
    { name: "Golf Ball", score: probabilities[8] },
    { name: "Parachute", score: probabilities[9] },
  ];

  const handleImageUpload = async (file: File) => {
    try {
      setIsLoading(true);
      setError(null);

      // Create FormData to send the image
      const formData = new FormData();
      formData.append("image", file);

      // Request to classify endpoint
      const classify_response = await fetch("/api/classify", {
        method: "POST",
        body: formData,
      });

      // Request to feature maps endpoint
      const feature_maps_response = await fetch("/api/feature-maps", {
        method: "POST",
        body: formData,
      });

      // Error handling
      if (!classify_response.ok || !feature_maps_response.ok) {
        throw new Error(
          "Failed to process image. The EC2 instance may be inactive."
        );
      }

      // Logging classification response and setting response probabilities
      const result = await classify_response.json();
      setProbabilities(result.class_probabilities);

      const feature_maps = await feature_maps_response.json();
      const maps = feature_maps.feature_maps[0];
      setFeatureMap(maps);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Render feature map to canvas
  useEffect(() => {
    // Check if featureMap has data and is a 3D array (Height, Width, Depth)
    if (
      featureMap &&
      featureMap.length === 64 && // Check height
      featureMap[0] &&
      featureMap[0].length === 64 && // Check width
      featureMap[0][0] &&
      Array.isArray(featureMap[0][0]) && // Check depth exists
      featureMap[0][0].length > 0 && // Check depth has elements
      typeof featureMap[0][0][0] === "number" // Basic check for number type
    ) {
      const height = 64;
      const width = 64;
      const depth = featureMap[0][0].length; // Should be 35

      // Iterate through each of the 35 feature maps (depth dimension)
      for (let d = 0; d < depth; d++) {
        const canvas = document.getElementById(
          `featureMapCanvas-${d}`
        ) as HTMLCanvasElement;
        if (!canvas) continue; // Skip if canvas not found

        const ctx = canvas.getContext("2d");
        if (!ctx) continue; // Skip if context cannot be obtained

        // Extract the 2D slice for the current depth map
        const singleMap: number[][] = Array.from({ length: height }, (_, y) =>
          Array.from({ length: width }, (_, x) => featureMap[y][x][d])
        );

        // Use the utility function to render the map
        renderGrayscaleMap(ctx, singleMap, width, height);
      }
    } else {
      // Optional: Clear canvases if featureMap is empty or invalid
      // Loop through 35 canvases and clear them
      for (let d = 0; d < 35; d++) {
        const canvas = document.getElementById(
          `featureMapCanvas-${d}`
        ) as HTMLCanvasElement;
        if (!canvas) continue;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        ctx.clearRect(0, 0, 64, 64);
      }
    }
  }, [featureMap]);

  // Function to clear the loaded image and the preview
  const clearImage = () => {
    setPreviewSrc(null); // Clear the preview src state

    // Clear the file input value
    const fileInput = document.getElementById(
      "imageUpload"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }

    setImageLoaded(false);
  };

  return (
    <div className="h-screen bg-[#1a1b26] p-4">
      <LoadingOverlay isLoading={isLoading} error={error} />
      <div className="h-full flex gap-4">
        {/* Left Panel */}
        <div className="w-108 bg-[#1f2937] rounded-lg p-4 flex flex-col gap-8">
          <div className="aspect-square relative overflow-hidden rounded-lg mb-4 flex-shrink-0">
            {/* Input element to load image, create loaded preview, and make a request to the classification api */}
            <input
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              id="imageUpload"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                // Create canvas to resize image
                const canvas = document.createElement("canvas");
                canvas.width = 64;
                canvas.height = 64;
                const ctx = canvas.getContext("2d");

                // Load and draw image
                const img = new Image();
                img.onload = () => {
                  ctx?.drawImage(img, 0, 0, 64, 64);
                  const resizedDataUrl = canvas.toDataURL("image/jpeg");
                  // const preview = document.getElementById(
                  //   "imagePreview"
                  // ) as HTMLImageElement;

                  // Setting the preview image using state
                  // if (preview) preview.src = resizedDataUrl;
                  setPreviewSrc(resizedDataUrl);

                  setImageLoaded(true);

                  // Send the original file for processing
                  handleImageUpload(file);
                };
                img.src = URL.createObjectURL(file);
              }}
            />
            <div
              onClick={() => document.getElementById("imageUpload")?.click()}
              className="bg-gray-700 w-full h-full cursor-pointer rounded-lg flex items-center justify-center relative focus:outline-none"
            >
              {imageLoaded &&
                previewSrc && ( // Check for previewSrc as well
                  <img
                    id="imagePreview"
                    className="w-full h-full object-cover rounded-lg"
                    alt="Image preview" // Add meaningful alt text
                    src={previewSrc} // Bind src to state
                  />
                )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearImage();
                }}
                className="absolute top-2 left-2 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white text-sm z-10 transition-colors"
              >
                ×
              </button>
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center text-white hover:bg-black/40 transition-colors rounded-lg">
                  Click to upload an image
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2 overflow-y-auto">
            {categories.map((category) => (
              <div key={category.name} className="space-y-1">
                <div className="text-white text-sm">{category.name}</div>
                <div className="h-2 bg-[#1a1b26] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${category.score * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="aspect-square bg-[#1f2937] w-full rounded-lg p-4 overflow-y-auto">
          {/* Grid container for feature maps */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-2">
            {/* Generate 35 canvas elements */}
            {Array.from({ length: 35 }).map((_, index) => (
              <div key={index} className="aspect-square bg-gray-700 rounded">
                <canvas
                  id={`featureMapCanvas-${index}`}
                  width="64"
                  height="64"
                  className="w-full h-full object-contain"
                  title={`Feature Map ${index + 1}`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
