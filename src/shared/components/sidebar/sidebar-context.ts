import { createContext } from 'react';

interface SidebarContextData {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

export const SidebarContext = createContext<SidebarContextData>(
  {} as SidebarContextData
);
