import { create } from "zustand";

interface SidebarState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
  setIsMobile: (isMobile: boolean) => void;
  resizeDFalse: () => void;
}

const useSidebarStore = create<SidebarState>((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  isMobile: false,
  setIsMobile: (isMobile) => set({ isMobile }),
  resizeDFalse: () => set({ isSidebarOpen: false }),
}));

export default useSidebarStore;
