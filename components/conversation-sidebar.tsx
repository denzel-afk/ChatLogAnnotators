import React from "react";
import CueCard from "./cue-card";
import { Conversation } from "@/types/conversations";

interface ConvSidebarProps {
  conversations: Conversation[];
  onConversationSelect: (conversationId: string) => void;
}

const ConversationSidebar: React.FC<ConvSidebarProps> = ({
  conversations,
  onConversationSelect,
}) => {
  return (
    <div className="w-80 h-screen overflow-y-scroll bg-sidebar text-sidebar-foreground resize-x overflow-auto p-4 border-r border-sidebar-border">
      <h2 className="text-lg font-semibold mb-4 tracking-wide">
        Conversations
      </h2>
      {conversations.length > 0 ? (
        conversations.map((conv) => (
          <CueCard
            key={conv._id}
            title={conv.annotations?.[0]?.title || "Untitled"}
            person={conv.person}
            firstInteraction={conv.stime.text}
            lastInteraction={conv.last_interact.text}
            onClick={() => onConversationSelect(conv._id)}
          />
        ))
      ) : (
        <div className="text-sm text-center text-gray-500 mt-8">
          Cannot find conversation
        </div>
      )}
    </div>
  );
};

export default ConversationSidebar;
