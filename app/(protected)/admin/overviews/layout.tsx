"use client";

import { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ConversationSidebar from "@/components/conversation-sidebar";
import { Conversation } from "@/types/conversations";
import { useDatabase } from "@/app/(protected)/layout";

export default function HomeLayout({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<
    Conversation[]
  >([]);
  const [tempQuery, setTempQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const router = useRouter();
  const { activeDatabase } = useDatabase();

  useEffect(() => {
    if (!activeDatabase) return;

    const fetchConversations = async () => {
      try {
        const queryParam = searchQuery
          ? `?query=${encodeURIComponent(searchQuery)}`
          : "";
        console.log("[HomeLayout] Fetching conversations for:", activeDatabase);

        const response = await fetch(`/api/conversations${queryParam}`);
        const data = await response.json();

        if (Array.isArray(data)) {
          // Transform data for conversations
          const transformedData = data.map((chatlog: any) => ({
            _id: chatlog._id || "unknown_id",
            title: chatlog.title || "Untitled",
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
        } else {
          console.error("[HomeLayout] Expected an array but got:", data);
          setConversations([]);
          setFilteredConversations([]);
        }
      } catch (error) {
        console.error("[HomeLayout] Error fetching conversations:", error);
        setConversations([]);
        setFilteredConversations([]);
      }
    };

    fetchConversations();
    setSelectedConversation(null);
  }, [searchQuery, activeDatabase]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchQuery(tempQuery);
    }
  };

  return (
    <div className="flex-row flex text-foreground bg-background">
      {/* Sidebar */}
      <div className="w-80 bg-background text-sidebar-foreground h-full border-r border-sidebar-border">
        {/* Search Bar */}
        <div className="p-4 border-b border-sidebar-border">
          <input
            type="text"
            placeholder="Search conversations..."
            value={tempQuery}
            onChange={(e) => setTempQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full p-2 rounded-md bg-input text-foreground border border-border focus:outline-none focus:ring focus:ring-ring"
          />
        </div>
        <ConversationSidebar
          conversations={filteredConversations}
          onConversationSelect={(id) => {
            setSelectedConversation(id);
            router.push(`/admin/home/${id}`);
          }}
          selectedConversation={selectedConversation}
        />
      </div>
      <div className="flex-1 overflow-auto bg-background text-foreground">
        {/* Show placeholder if no conversation selected */}
        {!selectedConversation ? (
          <div className="p-4 text-center text-muted">
            <p className="text-lg">Select a conversation to view details</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
