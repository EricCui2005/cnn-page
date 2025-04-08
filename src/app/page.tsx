"use client";
import "./globals.css";

import { useState, useEffect } from "react";

export default function Home() {
  const [probabilities, setProbabilities] = useState<number[]>(
    Array(10).fill(0)
  ); // Probabilities state for each class (initialized to 0)
  const [imageLoaded, setImageLoaded] = useState(false); // Image loaded state
  const [featureMap, setFeatureMap] = useState<number[][]>([]); // Feature maps state

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
      if (!classify_response.ok) {
        throw new Error("Classification failed");
      }
      if (!feature_maps_response.ok) {
        throw new Error("Feature maps failed");
      }

      // Logging classification response and setting response probabilities
      console.log("Classification Response:", classify_response);
      const result = await classify_response.json();
      setProbabilities(result.class_probabilities);

      console.log("Feature Maps Response:", feature_maps_response);
      const feature_maps = await feature_maps_response.json();
      console.log("Feature Maps:", feature_maps);

      // Extracting the first feature map
      const map = feature_maps.feature_maps[0];
      const firstChannel = map.map((row: number[][]) =>
        row.map((pixel: number[]) => pixel[10])
      );
      setFeatureMap(firstChannel);

      // Error handling
    } catch (error) {
      console.error("Error during classification:", error);
    }
  };

  // Render feature map to canvas
  useEffect(() => {
    if (featureMap.length > 0) {
      const canvas = document.getElementById(
        "featureMapCanvas"
      ) as HTMLCanvasElement;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Create ImageData
      const imageData = ctx.createImageData(64, 64);
      const data = imageData.data;

      // Fill the ImageData with grayscale values from featureMap
      for (let y = 0; y < 64; y++) {
        for (let x = 0; x < 64; x++) {
          const value = featureMap[y][x];
          // Normalize value to 0-255 range
          const grayscale = Math.min(255, Math.max(0, Math.floor(value * 255)));

          // Set RGBA values (all channels same for grayscale)
          const index = (y * 64 + x) * 4;
          data[index] = grayscale; // R
          data[index + 1] = grayscale; // G
          data[index + 2] = grayscale; // B
          data[index + 3] = 255; // A
        }
      }

      // Put the ImageData onto the canvas
      ctx.putImageData(imageData, 0, 0);
    }
  }, [featureMap]);

  // Function to clear the loaded image and the preview
  const clearImage = () => {
    const preview = document.getElementById("imagePreview") as HTMLImageElement;
    if (preview) {
      preview.src = "";
    }

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
      <div className="h-full flex justify-center gap-4">
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
                  const preview = document.getElementById(
                    "imagePreview"
                  ) as HTMLImageElement;

                  // Setting the preview image
                  if (preview) preview.src = resizedDataUrl;

                  setImageLoaded(true);

                  // Send the original file for processing
                  handleImageUpload(file);
                };
                img.src = URL.createObjectURL(file);
              }}
            />
            <div
              onClick={() => document.getElementById("imageUpload")?.click()}
              className="bg-gray-700 w-full h-full cursor-pointer flex items-center justify-center relative"
              style={{ appearance: "none" }}
            >
              <img
                id="imagePreview"
                className="w-full h-full object-cover"
                alt=""
                style={{ appearance: "none" }}
              />
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
                <div className="absolute inset-0 flex items-center justify-center text-white hover:bg-black/30 transition-colors">
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
        <div className="aspect-square bg-[#1f2937] rounded-lg p-4">
          <div className="h-full flex items-center justify-center">
            <canvas
              id="featureMapCanvas"
              width="64"
              height="64"
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
