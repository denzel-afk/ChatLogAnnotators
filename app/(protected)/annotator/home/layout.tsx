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
  const [tempQuery, setTempQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const queryParam = searchQuery
          ? `?query=${encodeURIComponent(searchQuery)}`
          : "";
        const response = await fetch(`/api/conversations${queryParam}`);
        const data = await response.json();

        if (Array.isArray(data)) {
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
        } else {
          console.error("Expected an array but got:", data);
          setConversations([]);
          setFilteredConversations([]);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
        setConversations([]);
        setFilteredConversations([]);
      }
    };

    fetchConversations();
  }, [searchQuery]);

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
          onConversationSelect={(id) => router.push(`/annotator/home/${id}`)}
        />
      </div>
      <div className="flex-1 overflow-auto bg-background text-foreground">
        {children}
      </div>
    </div>
  );
}
