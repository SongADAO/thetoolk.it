"use client";

import Image from "next/image";
import { useState } from "react";

interface ScreenshotButtonProps {
  readonly imagePath: string;
  readonly altText: string;
}

function ScreenshotButton({ imagePath, altText }: ScreenshotButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        className="ml-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 transition-colors hover:bg-blue-200"
        onClick={() => setIsModalOpen(true)}
        title="View screenshot"
        type="button"
      >
        <svg
          className="h-4 w-4 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
          <path
            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      </button>

      {isModalOpen ? (
        <div
          className="bg-opacity-75 fixed inset-0 z-50 flex items-center justify-center bg-black"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative max-h-[95vh] max-w-6xl rounded-lg bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 z-10 text-2xl font-bold text-gray-500 hover:text-gray-700"
              onClick={() => setIsModalOpen(false)}
              type="button"
            >
              ×
            </button>
            <Image
              alt={altText}
              className="max-h-full max-w-full object-contain"
              height={800}
              src={imagePath}
              width={1200}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

export { ScreenshotButton };
