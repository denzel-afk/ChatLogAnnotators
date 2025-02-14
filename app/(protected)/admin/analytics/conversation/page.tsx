"use client";

import React, { useEffect, useState } from "react";
import { useDatabase } from "@/components/context/database-context";
import { toast } from "react-toastify";
import MessageDistributionChart from "@/components/chart/message-distribution";
import Heatmap from "@/components/chart/heatmap-conversation";
import {
  HeatMapConversationData,
  MessageDistributionData,
} from "@/types/chart";

const AnalyticsConversationPage = () => {
  const [totalConversations, setTotalConversations] = useState(0);
  const [heatMapData, setHeatMapData] = useState<HeatMapConversationData[]>([]);
  const [messageDistribution, setMessageDistribution] = useState<
    MessageDistributionData[]
  >([]);
  const { activeDatabase } = useDatabase();

  const processHeatMapData = (
    conversations: any[] //eslint-disable-line @typescript-eslint/no-explicit-any
  ): HeatMapConversationData[] => {
    const dataMap: { [key: string]: HeatMapConversationData } = {};

    console.log("Processing heatmap data...");
    conversations.forEach((conversation) => {
      const date = new Date(conversation.firstInteraction);
      if (isNaN(date.getTime())) {
        console.error(
          "Invalid date format for firstInteraction:",
          conversation.firstInteraction
        );
        return;
      }

      const day = date.getDay();
      const hour = date.getHours();
      const key = `${day}-${hour}`;

      if (dataMap[key]) {
        dataMap[key].count += 1;
      } else {
        dataMap[key] = {
          day,
          hour,
          count: 1,
        };
      }
    });

    console.log("Heatmap data processed:", Object.values(dataMap));
    return Object.values(dataMap);
  };

  useEffect(() => {
    async function fetchConversations() {
      const cookieValue = document.cookie
        .split("; ")
        .find((row) => row.startsWith("username="))
        ?.split("=")[1];
      const username = cookieValue
        ? decodeURIComponent(cookieValue)
        : "Anonymous";

      if (!activeDatabase) {
        console.error("Active database is not set.");
        toast.error("Active database is not set.");
        return;
      }

      try {
        console.log("Fetching conversations...");
        const response = await fetch(
          `/api/conversations?username=${username}&name=${activeDatabase.name}`
        );
        const data = await response.json();

        if (response.ok) {
          console.log("Conversations fetched successfully:", data);
          toast.success("Conversations fetched successfully!");

          const messageCount = data.reduce(
            (
              acc: { [key: number]: number },
              conversation: { messages: any[] } //eslint-disable-line @typescript-eslint/no-explicit-any
            ) => {
              const count = conversation.messages.length;
              acc[count] = (acc[count] || 0) + 1;
              return acc;
            },
            {}
          );

          const chartData = Object.keys(messageCount).map((key) => ({
            numMessages: Number(key),
            numConversations: messageCount[key],
          }));

          console.log("Message distribution data:", chartData);
          toast.success("Message distribution data processed!");

          setTotalConversations(data.length);
          setMessageDistribution(chartData);

          const processedData = processHeatMapData(data);
          console.log("Processed heatmap data:", processedData);
          toast.success("Heatmap data processed!");
          setHeatMapData(processedData);
        } else {
          toast.error("Failed to fetch conversations.");
          console.error(
            "Failed to fetch data with status:",
            response.status,
            data
          );
        }
      } catch (error) {
        toast.error("Error fetching conversations");
        console.error("Error fetching conversations:", error);
      }
    }

    fetchConversations();
  }, [activeDatabase]);

  return (
    <div className="flex flex-col items-center min-h-screen">
      <div className="text-lg h-[250px] w-[250px] bg-white rounded-lg shadow-lg flex items-center justify-center text-primary p-4 border border-accent m-4">
        Total Conversations: {totalConversations}
      </div>
      <MessageDistributionChart data={messageDistribution} />
      <Heatmap data={heatMapData} />
    </div>
  );
};

export default AnalyticsConversationPage;
