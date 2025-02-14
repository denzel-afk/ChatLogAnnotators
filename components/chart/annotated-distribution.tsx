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

import { AnnotatedDistributionChartProps } from "@/types/chart";

const AnnotatedDistributionChart: React.FC<AnnotatedDistributionChartProps> = ({
  data,
}) => {
  return (
    <div className="flex flex-col items-center w-full py-4">
      <h1 className="text-lg font-semibold mb-2">
        Annotators' Conversations Performance Based on Individual Performance
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
            dataKey="username"
            label={{
              value: "Annotators",
              position: "insideRight",
              offset: 0,
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
            dataKey="annotated"
            fill="#28a745"
            name="Annotated"
            stackId="a"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="inProgress"
            fill="#ffc107"
            name="In Progress"
            stackId="a"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="notAnnotated"
            fill="#dc3545"
            name="Not Annotated"
            stackId="a"
            radius={[10, 10, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnnotatedDistributionChart;
