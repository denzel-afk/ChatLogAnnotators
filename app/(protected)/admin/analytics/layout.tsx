"use client";

import React, { useEffect, useState } from "react";
import Head from "next/head";

interface AnalyticsLayoutProps {
  children: React.ReactNode;
}

const AnalyticsLayout: React.FC<AnalyticsLayoutProps> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    setCurrentPath(window.location.pathname);
  }, []);

  const navigate = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <React.StrictMode>
        <Head>
          <title>Analytics Dashboard</title>
        </Head>
        <header className="bg-secondary text-card-foreground p-4 shadow-lg w-full">
          <div className="container mx-auto flex justify-center space-x-10">
            <button
              className={`hover:underline cursor-pointer text-xl font-semibold px-4 py-2 rounded-lg ${
                currentPath === "/admin/analytics/conversation"
                  ? "bg-primary text-white"
                  : "bg-transparent"
              }`}
              onClick={() => navigate("/admin/analytics/conversation")}
            >
              Conversation
            </button>
            <button
              className={`hover:underline cursor-pointer text-xl font-semibold px-4 py-2 rounded-lg ${
                currentPath === "/admin/analytics/annotator"
                  ? "bg-primary text-white"
                  : "bg-transparent"
              }`}
              onClick={() => navigate("/admin/analytics/annotator")}
            >
              Annotators
            </button>
          </div>
        </header>
        <main className="flex-grow container mx-auto p-4 w-full">
          {children}
        </main>
      </React.StrictMode>
    </div>
  );
};

export default AnalyticsLayout;
