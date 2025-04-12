import React from "react";
import Image from "next/image";

interface LoadingOverlayProps {
  isLoading: boolean;
  error: string | null;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  error,
}) => {
  if (!isLoading && !error) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-[#263242] p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
        {isLoading ? (
          <div className="flex flex-col items-center">
            <Image
              src="/svg-loaders/oval.svg"
              alt="Loading indicator"
              width={48}
              height={48}
              className="mb-4"
            />
            <p className="text-white">Processing image...</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <p className="text-red-600 font-medium mb-2">Error</p>
            <p className="text-white">{error}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
