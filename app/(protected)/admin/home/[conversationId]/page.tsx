"use client";

import { useEffect, useState } from "react";

interface Message {
  role: string;
  content: string;
}

interface Conversation {
  _id: string;
  Person: string;
  messages: Message[];
}

export default function ConversationPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    params
      .then(({ conversationId }) => {
        setConversationId(conversationId);

        fetch(`/api/conversations/${conversationId}`)
          .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch conversation");
            return res.json();
          })
          .then((data) => {
            setConversation(data);
          })
          .catch((error) => {
            console.error("Error fetching conversation:", error);
            setError("Failed to load conversation");
          });
      })
      .catch((error) => {
        console.error("Error resolving params:", error);
        setError("Invalid conversation ID");
      });
  }, [params]);

  if (error) {
    return <p className="text-red-500 p-4">{error}</p>;
  }

  if (!conversation) {
    return <p className="p-4 w-width">Loading conversation...</p>;
  }

  return (
    <div className="p-4">
      <div className="space-y-4">
        {conversation.messages.map((message, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg ${
              message.role === "user" ? "bg-blue-900 text-white ml-auto" : "bg-gray-700 text-gray-300 mr-auto"
            }`}
          >
            <p className={`font-semibold ${message.role === "user" ? "text-blue-100" : "text-blue-400"}`}>
              {message.role === "user" ? "You" : "AI"}
            </p>
            <p className="mt-2 leading-relaxed">{message.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
