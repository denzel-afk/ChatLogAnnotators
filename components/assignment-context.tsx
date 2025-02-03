import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { toast } from "react-toastify";

interface Assignment {
  assignmentTitle: string;
  databaseId: string;
}

interface AssignmentContextType {
  activeAssignment: string | null;
  activeDatabase: string | null;
  setActiveAssignment: (assignment: string | null) => void;
  assignments: Assignment[];
  switchAssignment: (assignmentTitle: string) => Promise<void>;
}

const AssignmentContext = createContext<AssignmentContextType | undefined>(
  undefined
);

export const useAssignment = () => {
  const context = useContext(AssignmentContext);
  if (!context) {
    throw new Error("useAssignment must be used within a AssignmentProvider");
  }
  return context;
};

export const AssignmentProvider = ({ children }: { children: ReactNode }) => {
  const [activeAssignment, setActiveAssignment] = useState<string | null>(null);
  const [activeDatabase, setActiveDatabase] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    const username = document.cookie
      .split("; ")
      .find((row) => row.startsWith("username="))
      ?.split("=")[1];
    if (!username) {
      console.error("[AssignmentProvider] Username not found in cookies");
      return;
    }

    async function fetchAssignments() {
      try {
        const response = await fetch(
          `/api/annotators/databases?username=${username}`
        );
        const data = await response.json();
        setAssignments(data);
      } catch (error) {
        console.error(
          "[AssignmentProvider] Error fetching assignments:",
          error
        );
        toast.error("Failed to fetch assignments");
      }
    }

    fetchAssignments();
  }, []);

  const switchAssignment = async (assignmentTitle: string) => {
    const username = document.cookie
      .split("; ")
      .find((row) => row.startsWith("username="))
      ?.split("=")[1];
    if (!username) {
      console.error("[AssignmentProvider] Username not found in cookies");
      return;
    }

    const selectedAssignment = assignments.find(
      (a) => a.assignmentTitle === assignmentTitle
    );
    if (!selectedAssignment) return;

    try {
      const response = await fetch(`/api/annotators/databases/switch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          databaseId: selectedAssignment.databaseId,
          assignmentTitle,
        }),
      });
      if (!response.ok) throw new Error("Failed to switch assignment");

      const updatedAssignment = await response.json();
      setActiveAssignment(assignmentTitle);
      setActiveDatabase(updatedAssignment.databaseId);
      toast.success("Switched assignment successfully");
    } catch (error) {
      console.error("[AssignmentProvider] Error switching assignment:", error);
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
      {children}
    </AssignmentContext.Provider>
  );
};
