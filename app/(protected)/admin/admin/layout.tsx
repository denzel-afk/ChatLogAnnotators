"use client";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex-row flex text-foreground bg-background w-full">
      {/* Main Content */}
      <div className="flex-1 bg-background text-foreground w-full">
        {children}
      </div>
    </div>
  );
}
