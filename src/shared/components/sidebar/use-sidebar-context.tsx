import React, { useState } from 'react';
import { SidebarContext } from './sidebar-context';

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <SidebarContext.Provider 
      value={{ 
        isSidebarOpen, 
        toggleSidebar,
        closeSidebar
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
