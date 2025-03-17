import React, { useState, useEffect } from 'react';
import Dashboard from './Dashboard';
import RewardsLookup from './RewardsLookup';
import ContractFunctions from './ContractFunctions';
import OptionsData from './OptionsData';
import Sidebar from './Sidebar';
import { ThemeProvider } from "./theme-provider";
import { cn } from '../lib/utils';

export default function Layout() {
  const [activeTab, setActiveTab] = useState("options");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      // Auto-collapse sidebar on mobile
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      }
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <ThemeProvider defaultTheme="dark" forcedTheme="dark">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleSidebar}
        />

        {/* Overlay for mobile */}
        {!isCollapsed && isMobile && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsCollapsed(true)}
          />
        )}

        {/* Main Content */}
        <main className={cn(
          "flex-1 transition-all duration-300",
          isCollapsed ? "ml-17" : "ml-[0px]",
        )}>
          <div className="container mx-auto py-10">
            <div className="space-y-8">
              {activeTab === "dashboard" && <Dashboard />}
              {activeTab === "rewards" && <RewardsLookup />}
              {activeTab === "contract" && <ContractFunctions />}
              {activeTab === "options" && <OptionsData />}
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}