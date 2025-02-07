"use client";

import React, { useState, useEffect } from "react";
import CueCard from "./cue-card";
import { Conversation } from "@/types/conversations";

interface ConvSidebarProps {
  conversations: Conversation[];
  onConversationSelect: (conversationId: string) => void;
  selectedConversation: string | null;
}

const ConversationSidebar: React.FC<ConvSidebarProps> = ({
  conversations,
  onConversationSelect,
  selectedConversation,
}) => {
  const [username, setUsername] = useState<string | undefined>();

  useEffect(() => {
    const usernameFromCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("username="))
      ?.split("=")[1];
    setUsername(usernameFromCookie);
  }, []);

  return (
    <div className="w-80 h-screen overflow-y-scroll bg-sidebar text-sidebar-foreground resize-x overflow-auto p-4 border-r border-sidebar-border">
      <h2 className="text-lg font-semibold mb-4 tracking-wide">
        Conversations
      </h2>
      {conversations.length > 0 ? (
        conversations.map((conv) => {
          const isAnnotatedByUser = !!(
            username &&
            conv.annotations &&
            (conv.annotations.some((annotation) =>
              annotation.answers.some((answer) => answer.name === username)
            ) ||
              conv.messages.some((message) =>
                message.annotations?.some((annotation) =>
                annotation.answers.some((answer) => answer.name === username)
              ))
            )
          );
          return (
            <CueCard
              key={conv._id}
              title={conv.title || "Untitled"}
              person={conv.person || "Unknown"}
              firstInteraction={conv.stime.text}
              lastInteraction={conv.last_interact.text}
              onClick={() => onConversationSelect(conv._id)}
              isActive={conv._id === selectedConversation}
              isAnnotatedByUser={isAnnotatedByUser}
            />
          );
        })
      ) : (
        <div className="text-sm text-center text-gray-500 mt-8">
          Cannot find conversation
        </div>
      )}
    </div>
  );
};

export default ConversationSidebar;
