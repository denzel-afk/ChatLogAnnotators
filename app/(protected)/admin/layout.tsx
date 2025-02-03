"use client";

import "../../globals.css";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Database } from "@/types/conversations";

const DatabaseContext = createContext<{
  activeDatabase: Database | null;
  setActiveDatabase: (db: Database | null) => void;
  databases: Database[];
  switchDatabase: (databaseId: string) => Promise<void>;
}>({
  activeDatabase: null,
  setActiveDatabase: () => {},
  databases: [],
  switchDatabase: async () => {},
});

export const useDatabase = () => useContext(DatabaseContext);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeDatabase, setActiveDatabase] = useState<Database | null>(null);
  const [databases, setDatabases] = useState<Database[]>([]);

  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        const response = await fetch(`/api/admin/databases`);
        const data = await response.json();
        setDatabases(data);
      } catch (error) {
        console.error("[RootLayout] Error fetching databases:", error);
      }
    };

    const fetchActiveDatabase = async () => {
      try {
        const response = await fetch(`/api/admin/databases/active`);
        const data = await response.json();
        setActiveDatabase(data);
      } catch (error) {
        console.error("[RootLayout] Error fetching active database:", error);
      }
    };

    fetchDatabases();
    fetchActiveDatabase();
  }, []);

  const switchDatabase = async (databaseId: string) => {
    try {
      const response = await fetch(`/api/admin/databases/switch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ databaseId }),
      });

      if (!response.ok) {
        throw new Error("Failed to switch database");
      }

      const updatedActiveDatabase = await response.json();
      setActiveDatabase(updatedActiveDatabase);
      toast.success("Switched database successfully");
    } catch (error) {
      console.error("[RootLayout] Error switching database:", error);
      toast.error("Failed to switch database");
    }
  };

  return (
    <DatabaseContext.Provider
      value={{ activeDatabase, setActiveDatabase, databases, switchDatabase }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className="bg-primary text-foreground h-screen overflow-hidden">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SidebarProvider>
              <div className="flex h-full">
                <AppSidebar />
                <main className="flex-1 overflow-auto">
                  <div className="sticky top-0 z-10 bg-background p-1 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <SidebarTrigger />
                      <ModeToggle />
                    </div>
                    {/* Database Switcher */}
                    <div className="flex items-center space-x-2">
                      <label
                        htmlFor="databaseSwitcher"
                        className="text-sm font-medium text-foreground"
                      >
                        Active Database:
                      </label>
                      <select
                        id="databaseSwitcher"
                        value={activeDatabase?.databaseId || ""}
                        onChange={(e) => switchDatabase(e.target.value)}
                        className="border border-muted focus:ring-primary focus:border-primary rounded-md p-2 bg-secondary text-secondary-foreground"
                      >
                        <option value="">Select a database</option>
                        {databases.map((db) => (
                          <option key={db.databaseId} value={db.databaseId}>
                            {db.name || "Unnamed Database"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {children}
                  <ToastContainer />
                </main>
              </div>
            </SidebarProvider>
          </ThemeProvider>
        </body>
      </html>
    </DatabaseContext.Provider>
  );
}
