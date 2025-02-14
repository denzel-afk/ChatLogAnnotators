import React from "react";
import { HeatMapConversationChartProps } from "@/types/chart";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hoursOfDay = Array.from({ length: 24 }, (_, i) => i);

const Heatmap: React.FC<HeatMapConversationChartProps> = ({ data }) => {
  const grid = Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => 0)
  );

  data.forEach(({ day, hour, count }) => {
    const adjustedDay = (day + 6) % 7;
    grid[adjustedDay][hour] += count;
  });

  const maxCount = Math.max(...grid.flat(), 1);

  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">
        Heatmap of Conversations
      </h1>

      <div className="flex mb-2">
        <div className="w-12"></div>
        {hoursOfDay.map((hour) => (
          <div key={hour} className="w-9 text-center text-sm text-gray-600">
            {hour}
          </div>
        ))}
      </div>

      {daysOfWeek.map((day, dayIndex) => (
        <div key={day} className="flex items-center">
          <div className="w-12 text-right mr-2 text-sm text-gray-600">
            {day}
          </div>

          {hoursOfDay.map((hour) => {
            const count = grid[dayIndex][hour];
            const intensity = count / maxCount;
            return (
              <div
                key={`${day}-${hour}`}
                className="w-8 h-8 border border-gray-200 rounded m-0.5 transition-all duration-200 ease-in-out transform hover:scale-110 hover:shadow-lg"
                style={{
                  backgroundColor: `rgba(0, 123, 255, ${intensity})`,
                }}
                title={`${day} ${hour}:00 - ${count} conversations`}
                aria-label={`${count} conversations on ${day} at ${hour}:00`}
              >
                <div className="w-full h-full flex items-center justify-center text-xs text-white opacity-0 hover:opacity-100 transition-opacity duration-200">
                  {count}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Heatmap;
