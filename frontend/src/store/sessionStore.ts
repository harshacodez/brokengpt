import axios from "axios";
import { create } from "zustand";

interface SessionStore {
  activeSession: string;
  setActiveSession: (session: string) => void;
  sessions: object;
  getSessions: () => Promise<void>;
  deleteSession: (id: string, toast: any) => Promise<void>;
}

const useSessionStore = create<SessionStore>((set, _) => ({
  activeSession: "default",
  setActiveSession: (session) => set({ activeSession: session }),
  sessions: {},
  getSessions: async () => {
    try {
      const response = await axios.post(
        "https://api.brokengpt.com/sessions/get",
        {},
        { withCredentials: true }
      );
      const sortedSessions = response.data.sessions.sort((a: any, b: any) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateB.getTime() - dateA.getTime();
      });

      // Update Zustand store with sorted sessions
      set({ sessions: sortedSessions });

      // Log the updated sessions from the state
    } catch (error) {
      console.error("Failed to fetch sessions", error);
    }
  },

  deleteSession: async (id, toast) => {
    await axios.delete(`https://api.brokengpt.com/sessions/delete/${id}`, {
      withCredentials: true,
    });

    toast.success("Deleted successfully");
  },
}));

export default useSessionStore;
