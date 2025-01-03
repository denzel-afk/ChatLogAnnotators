"use client";
import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ConversationSidebar from "@/components/conversation-sidebar";
import { Conversation } from "@/types/conversations";

export default function HomeLayout({ children }: { children: ReactNode }) {
  const [firstConversation, setFirstConversation] =
    useState<Conversation | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchFirstConversation = async () => {
      try {
        const response = await fetch(`/api/conversations`);
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          const chatlog = data[0]; // Grab the first conversation
          const transformedConversation: Conversation = {
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
          };

          setFirstConversation(transformedConversation);

          // Automatically navigate to the first conversation
          router.push(`/admin/admin/${transformedConversation._id}`);
        } else {
          console.error("No conversations found");
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    fetchFirstConversation();
  }, [router]);

  return (
    <div className="flex-row flex text-foreground bg-background">
      {/* Sidebar */}
      <div className="w-80 bg-background text-sidebar-foreground h-full border-r border-sidebar-border">
        {firstConversation && (
          <ConversationSidebar
            conversations={[firstConversation]} // Pass only the first conversation
            onConversationSelect={(id) => router.push(`/admin/admin/${id}`)}
          />
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-background text-foreground">
        {children}
      </div>
    </div>
  );
}
