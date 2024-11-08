import Image from "next/image";
import { useState } from "react";
import { Send, Image as ImageIcon } from "lucide-react";
import { GifSelector } from "./components/GifSelector";

export default function Home() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hey there! 👋", sent: false, timestamp: "10:01 AM" },
    { id: 2, text: "Hi! How are you?", sent: true, timestamp: "10:02 AM" },
    {
      id: 3,
      text: "I'm doing great, thanks!",
      sent: false,
      timestamp: "10:03 AM",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isGifSelectorOpen, setIsGifSelectorOpen] = useState(false);

  const handleSend = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          text: newMessage,
          sent: true,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
      setNewMessage("");
    }
  };

  const handleSelectGif = (content) => {
    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        text: `[${content.isVideo ? "Video" : "GIF"}: ${content.title}]`,
        sent: true,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isVideo: !!content.isVideo,
        isGif: !content.isVideo,
        preview: content.preview,
        gifPreview: content.preview,
      },
    ]);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] min-h-screen">
      <div className="row-start-2 flex flex-col h-[calc(100vh-40px)] max-w-2xl w-full mx-auto bg-gray-100 rounded-lg overflow-hidden">
        <div className="bg-gray-200 p-4 shadow">
          <h1 className="text-lg font-semibold">Chat</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sent ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  message.sent
                    ? "bg-blue-500 text-white rounded-br-sm"
                    : "bg-gray-300 text-black rounded-bl-sm"
                }`}
              >
                {message.isVideo ? (
                  <video
                    src={message.preview}
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : message.isGif ? (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <Image
                      src={message.gifPreview || message.preview}
                      alt={message.text}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <p>{message.text}</p>
                )}
                <p
                  className={`text-xs mt-1 ${
                    message.sent ? "text-blue-100" : "text-gray-600"
                  }`}
                >
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-300 p-4 bg-white">
          <div className="flex items-center space-x-2">
            <button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setIsGifSelectorOpen(true)}
            >
              <ImageIcon size={24} className="text-gray-600" />
            </button>
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="iMessage"
                className="w-full rounded-2xl border border-gray-300 px-4 py-2 pr-12 resize-none focus:outline-none focus:border-blue-500"
                rows={1}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!newMessage.trim()}
              className="p-2 rounded-full bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      <GifSelector
        isOpen={isGifSelectorOpen}
        onClose={() => setIsGifSelectorOpen(false)}
        onSelectGif={handleSelectGif}
      />
    </div>
  );
}
