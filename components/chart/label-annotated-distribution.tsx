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

import { AnnotatedLabelAnnotationChartProps } from "@/types/chart";

const AnnotatedLabelDistributionChart: React.FC<
  AnnotatedLabelAnnotationChartProps
> = ({ data }) => {
  return (
    <div className="flex flex-col items-center w-full py-4">
      <h1 className="text-lg font-semibold mb-2">
        Annotators' Conversation Performance Based on Label/Attributes
      </h1>
      <ResponsiveContainer width={1000} height={800}>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 30,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            label={{
              value: "Label/Attributes",
              position: "insideRight",
              offset: -40,
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
            dataKey="numsAnnotated"
            fill="#28a745"
            name="Annotated"
            stackId="a"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="numsNotAnnotated"
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

export default AnnotatedLabelDistributionChart;
