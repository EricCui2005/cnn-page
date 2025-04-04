"use client";
import { useEffect } from "react";

const categories = [
  { name: "Tench", score: 0.8 },
  { name: "English Springer", score: 0.75 },
  { name: "Cassette Player", score: 0.7 },
  { name: "Chainsaw", score: 0.85 },
  { name: "Church", score: 0.9 },
  { name: "French Horn", score: 0.82 },
  { name: "Garbage Truck", score: 0.88 },
  { name: "Gas Pump", score: 0.95 },
  { name: "Golf Ball", score: 0.78 },
  { name: "Parachute", score: 0.86 },
];

export default function Home() {
  const fetchData = async () => {
    const response = await fetch("/api/model-summary");
    const data = await response.json();
    console.log(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const clearImage = () => {
    const preview = document.getElementById("imagePreview") as HTMLImageElement;
    if (preview) {
      preview.src = "";
    }
  };

  return (
    <div className="h-screen bg-[#1a1b26] p-4">
      <div className="h-full flex justify-center gap-4">
        {/* Left Panel */}
        <div className="w-108 bg-[#1f2937] rounded-lg p-4 flex flex-col gap-8">
          <div className="aspect-square relative overflow-hidden rounded-lg mb-4 flex-shrink-0">
            <input
              type="file"
              accept="image/jpeg"
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
                  if (preview) preview.src = resizedDataUrl;
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
              <div className="absolute inset-0 flex items-center justify-center text-white hover:bg-black/30 transition-colors">
                Click to upload image
              </div>
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
          <div className="h-full grid grid-cols-4 gap-4 auto-rows-fr">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="bg-gray-700 rounded-lg w-full h-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
