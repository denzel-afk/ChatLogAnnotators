"use client";
import { useState, useEffect } from "react";
import ConversationSidebar from "@/components/conversation-sidebar";

interface Chatlog {
  _id: string;
  Person: string;
  firstInteraction: string;
  lastInteraction: string;
  messages: { role: string; content: string }[];
}

export default function Home() {
  const [conversations, setConversations] = useState<Chatlog[]>([]);

  useEffect(() => {
    fetch("/api/conversations")
      .then((res) => res.json())
      .then((data) => {
        setConversations(data);
      })
      .catch((error) => {
        console.error("Error fetching conversations:", error);
      });
  }, []);

  return (
    <div className="h-screen flex-row flex">
      {/* Sidebar */}
      <div className="resize-x">
        <ConversationSidebar
          conversations={conversations}
          onConversationSelect={(id) => console.log(`Selected: ${id}`)}
        />
      </div>
    </div>
  );
}
