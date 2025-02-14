import React, { useState } from "react";
import { ExpandableCardProps } from "@/types/chart";

const ExpandableCard: React.FC<ExpandableCardProps> = ({
  summary,
  details,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-[300px] border border-accent-DEFAULT rounded-lg overflow-hidden shadow-lg transition-shadow duration-300 ease-in-out hover:shadow-xl">
      <div
        className="flex justify-between items-center p-4 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h4 className="font-bold text-primary-DEFAULT">{summary}</h4>
        <svg
          className={`w-6 h-6 text-primary-DEFAULT transition-transform duration-300 ease-in-out ${
            isOpen ? "transform rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
      {isOpen && (
        <div className="bg-secondary-DEFAULT text-secondary-foreground p-4">
          {details}
        </div>
      )}
    </div>
  );
};

export default ExpandableCard;
