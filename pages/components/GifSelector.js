import { Search, X, Wand2 } from "lucide-react";
import { useState } from "react";
import { fal } from "@fal-ai/client";

const FAL_KEY = process.env.NEXT_PUBLIC_FAL_AI_KEY;

if (!FAL_KEY) {
  console.error("Missing FAL_KEY environment variable");
}

fal.config({
  credentials: FAL_KEY,
});

export const GifSelector = ({ isOpen, onClose, onSelectGif }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(null);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [generationProgress, setGenerationProgress] = useState("");
  const [error, setError] = useState(null);

  const generateVideo = async () => {
    if (!searchQuery.trim()) return;

    setIsGenerating(true);
    setGenerationStep("image");
    setError(null);

    try {
      console.log("Starting image generation...");
      setGenerationProgress("Creating initial image...");

      const imageResult = await fal.subscribe("fal-ai/fast-lightning-sdxl", {
        input: {
          prompt: searchQuery,
          image_size: "landscape_16_9",
          sync_mode: true,
          expand_prompt: true,
        },
        logs: true,
        onQueueUpdate: (update) => {
          console.log("Queue update:", update);
          if (update.status === "IN_PROGRESS") {
            setGenerationProgress("Generating image...");
          }
        },
      });

      console.log("Image generation result:", imageResult.data);
      if (!imageResult?.data.images?.[0]?.url) {
        throw new Error("No image URL in the response");
      }

      const imageUrl = imageResult.data.images[0].url;
      console.log("Successfully generated image:", imageUrl);

      setGenerationStep("video");
      setGenerationProgress("Converting to animation...");

      const videoResult = await fal.subscribe(
        "fal-ai/runway-gen3/turbo/image-to-video",
        {
          input: {
            prompt: searchQuery,
            image_url: imageResult.data.images[0].url,
          },
          logs: true,
          onQueueUpdate: (update) => {
            if (update.status === "IN_PROGRESS") {
              console.log("Video generation progress:", update);
              const messages = update.logs.map((log) => log.message);
              setGenerationProgress(
                messages[messages.length - 1] || "Processing animation..."
              );
            }
          },
        }
      );

      console.log(videoResult.data);

      if (!videoResult?.data.video?.url) {
        throw new Error("Failed to generate video");
      }

      console.log("Generated video URL:", videoResult.data.video.url);
      setGeneratedVideo(videoResult.data.video.url);
    } catch (error) {
      console.error("Error generating content:", error);
      setError(error.message || "Error occurred during generation");
      setGenerationProgress("");
    } finally {
      setIsGenerating(false);
      setGenerationStep(null);
    }
  };

  if (!isOpen) return null;

  const popularGifs = [
    {
      id: 1,
      title: "GN",
      preview: "/night.webp",
      tags: ["agree", "yes", "thumbs up"],
    },
    {
      id: 2,
      title: "Love",
      preview: "/love.webp",
      tags: ["wow", "impressed", "amazed"],
    },
    {
      id: 3,
      title: "Happy",
      preview: "/happy.webp",
      tags: ["thanks", "grateful"],
    },
    {
      id: 4,
      title: "Sleep",
      preview: "/sleep.webp",
      tags: ["lol", "haha", "funny"],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[600px] flex flex-col m-4">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-semibold text-lg">
            Select or Generate Animation
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Describe what you want to generate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>
            <button
              onClick={generateVideo}
              disabled={isGenerating || !searchQuery.trim()}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Wand2 size={20} />
              {isGenerating ? "Generating..." : "Generate"}
            </button>
          </div>
          {isGenerating && (
            <div className="mt-2 text-sm text-gray-600">
              {generationProgress}
              <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: generationStep === "image" ? "50%" : "100%",
                  }}
                />
              </div>
            </div>
          )}
          {error && <div className="mt-2 text-sm text-red-500">{error}</div>}
        </div>

        {generatedVideo && (
          <div className="p-4 border-b">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
              <video
                src={generatedVideo}
                autoPlay
                loop
                muted
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => {
                  onSelectGif({
                    id: "generated",
                    title: searchQuery,
                    preview: generatedVideo,
                    isVideo: true,
                  });
                  onClose();
                }}
                className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <span className="text-white font-medium px-4 py-2 bg-black/50 rounded-full">
                  Use this Animation
                </span>
              </button>
            </div>
          </div>
        )}

        <div className="overflow-y-auto p-4 grid grid-cols-2 gap-4">
          {popularGifs.map((gif) => (
            <button
              key={gif.id}
              onClick={() => {
                onSelectGif(gif);
                onClose();
              }}
              className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 hover:ring-2 hover:ring-blue-500 transition-all"
            >
              <img
                src={gif.preview}
                alt={gif.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                <span className="text-white text-sm p-2 font-medium">
                  {gif.title}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
