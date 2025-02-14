import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { MessageDistributionChartProps } from "@/types/chart";

const MessageDistributionChart: React.FC<MessageDistributionChartProps> = ({
  data,
}) => {
  return (
    <div className="flex flex-col items-center w-full py-4">
      <h1 className="text-lg font-semibold mb-2">
        Message Distribution in Conversations
      </h1>
      <ResponsiveContainer width={1500} height={800}>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="numMessages"
            label={{
              value: "Number of Messages",
              position: "insideBottom",
              offset: -5,
              style: { fill: "#4A5568", fontWeight: "bold" },
            }}
          />
          <YAxis
            label={{
              value: "Number of Conversations",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle" },
            }}
          />
          <Tooltip
            cursor={{ fill: "transparent" }}
            contentStyle={{
              backgroundColor: "#f9fafb",
              borderColor: "#e2e8f0",
              boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.15)",
            }}
          />
          <Legend />
          <Bar
            dataKey="numConversations"
            fill="#8884d8"
            name="Conversations"
            radius={[10, 10, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MessageDistributionChart;
