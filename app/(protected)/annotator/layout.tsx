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

const AssignmentContext = createContext<{
  activeAssignment: string | null;
  activeDatabase: string | null;
  setActiveAssignment: (assignment: string | null) => void;
  assignments: { assignmentTitle: string; databaseId: string }[];
  switchAssignment: (assignmentTitle: string) => Promise<void>;
}>({
  activeAssignment: null,
  activeDatabase: null,
  setActiveAssignment: () => {},
  assignments: [],
  switchAssignment: async () => {},
});

export const useAssignment = () => useContext(AssignmentContext);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeAssignment, setActiveAssignment] = useState<string | null>(null);
  const [activeDatabase, setActiveDatabase] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<
    { assignmentTitle: string; databaseId: string }[]
  >([]);

  useEffect(() => {
    const username = document.cookie
      .split("; ")
      .find((row) => row.startsWith("username="))
      ?.split("=")[1];

    if (!username) {
      console.error("[RootLayout] Username not found in cookies");
      return;
    }

    const fetchAssignments = async () => {
      try {
        const response = await fetch(
          `/api/annotators/databases?username=${username}`
        );
        const data = await response.json();
        setAssignments(data);
      } catch (error) {
        console.error("[RootLayout] Error fetching assignments:", error);
      }
    };

    const fetchActiveAssignment = async () => {
      try {
        const response = await fetch(
          `/api/annotators/databases/active?username=${username}`
        );
        const data = await response.json();
        setActiveAssignment(data.assignmentTitle);
        setActiveDatabase(data.databaseId);
      } catch (error) {
        console.error("[RootLayout] Error fetching active assignment:", error);
      }
    };

    fetchAssignments();
    fetchActiveAssignment();
  }, []);

  const switchAssignment = async (assignmentTitle: string) => {
    const selectedAssignment = assignments.find(
      (a) => a.assignmentTitle === assignmentTitle
    );
    if (!selectedAssignment) return;

    try {
      const response = await fetch("/api/annotators/databases/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: document.cookie
            .split("; ")
            .find((row) => row.startsWith("username="))
            ?.split("=")[1],
          databaseId: selectedAssignment.databaseId,
          assignmentTitle,
        }),
      });

      if (!response.ok) throw new Error("Failed to switch assignment");

      const updatedActiveAssignment = await response.json();
      setActiveAssignment(assignmentTitle);
      setActiveDatabase(updatedActiveAssignment.databaseId);
      toast.success("Switched assignment successfully");
    } catch (error) {
      console.error("[RootLayout] Error switching assignment:", error);
      toast.error("Failed to switch assignment");
    }
  };

  return (
    <AssignmentContext.Provider
      value={{
        activeAssignment,
        activeDatabase,
        setActiveAssignment,
        assignments,
        switchAssignment,
      }}
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
                    {/* Assignment Switcher */}
                    <div className="flex items-center space-x-2">
                      <label
                        htmlFor="assignmentSwitcher"
                        className="text-sm font-medium text-foreground"
                      >
                        Active Assignment:
                      </label>
                      <select
                        id="assignmentSwitcher"
                        value={activeAssignment || ""}
                        onChange={(e) => switchAssignment(e.target.value)}
                        className="border border-muted focus:ring-primary focus:border-primary rounded-md p-2 bg-secondary text-secondary-foreground"
                      >
                        <option value="">Select an assignment</option>
                        {assignments.map((assignment) => (
                          <option
                            key={assignment.assignmentTitle}
                            value={assignment.assignmentTitle}
                          >
                            {assignment.assignmentTitle}
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
    </AssignmentContext.Provider>
  );
}
