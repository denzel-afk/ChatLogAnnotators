"use client";
import { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ConversationSidebar from "@/components/conversation-sidebar";
import { Conversation } from "@/types/conversations";

export default function HomeLayout({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<
    Conversation[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/conversations")
      .then((res) => res.json())
      .then((data) => {
        const transformedData = data.map((chatlog: any) => ({
          _id: chatlog._id || "unknown_id",
          stime: {
            text: chatlog.firstInteraction
              ? new Date(chatlog.firstInteraction).toLocaleString()
              : "Unknown Start Time",
            timestamp: chatlog.firstInteraction
              ? new Date(chatlog.firstInteraction).getTime()
              : 0,
          },
          last_interact: {
            text: chatlog.lastInteraction
              ? new Date(chatlog.lastInteraction).toLocaleString()
              : "Unknown Last Interaction",
            timestamp: chatlog.lastInteraction
              ? new Date(chatlog.lastInteraction).getTime()
              : 0,
          },
          person: chatlog.Person || "Unknown Person",
          messages: chatlog.messages || [],
          annotations: chatlog.annotations || [],
        }));
        setConversations(transformedData);
        setFilteredConversations(transformedData);
      })
      .catch((error) => {
        console.error("Error fetching conversations:", error);
      });
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredConversations(conversations);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      setFilteredConversations(
        conversations.filter(
          (conv) =>
            conv.person.toLowerCase().includes(lowerQuery) ||
            conv.stime.text.toLowerCase().includes(lowerQuery) ||
            conv.last_interact.text.toLowerCase().includes(lowerQuery)
        )
      );
    }
  }, [searchQuery, conversations]);

  return (
    <div className="h-screen flex-row flex text-foreground bg-background">
      {/* Sidebar */}
      <div className="w-80 bg-background text-sidebar-foreground h-full border-r border-sidebar-border">
        {/* Search Bar */}
        <div className="p-4 border-b border-sidebar-border">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 rounded-md bg-input text-foreground border border-border focus:outline-none focus:ring focus:ring-ring"
          />
        </div>
        <ConversationSidebar
          conversations={filteredConversations}
          onConversationSelect={(id) => router.push(`/admin/home/${id}`)}
        />
      </div>
      <div className="flex-1 overflow-auto bg-background text-foreground">
        {children}
      </div>
    </div>
  );
}
