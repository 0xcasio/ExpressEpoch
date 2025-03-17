import React from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LineChart, 
  Search, 
  Settings, 
  BarChart3,
  FileText,
  PanelLeft
} from "lucide-react";
import StrykeLogoYellow from '../assets/stryke-logo-yellow.svg';

export default function Sidebar({ className, activeTab, onTabChange, isCollapsed, onToggleCollapse }) {
  const menuItems = [
    {
      value: "options",
      label: "Options Chain",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      value: "dashboard",
      label: "Epoch Rewards",
      icon: <LineChart className="h-4 w-4" />,
    },
    {
      value: "rewards",
      label: "Epoch Lookup",
      icon: <Search className="h-4 w-4" />,
    },
    {
      value: "contract",
      label: "Contract Interface",
      icon: <FileText className="h-4 w-4" />,
    },
  ];

  return (
    <div className={cn(
      "relative flex flex-col h-screen border-r bg-background transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Toggle Button */}
      <div className="absolute right-0 top-3 translate-x-1/2 z-50">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-md border bg-background hover:bg-accent hover:text-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0"
          onClick={onToggleCollapse}
          data-sidebar="trigger"
        >
          <PanelLeft />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>

      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className={cn(
            "flex items-center gap-2 mb-2 px-4 relative",
            isCollapsed ? "justify-center" : "justify-start"
          )}>
            <div className="relative flex-shrink-0">
              <img 
                src={StrykeLogoYellow} 
                alt="Stryke Logo" 
                className={cn(
                  "transition-all duration-300 relative z-10",
                  isCollapsed ? "h-6 w-6" : "h-5 w-5",
                  "block" // Ensure visibility on all devices
                )}
              />
            </div>
            {!isCollapsed && (
              <h2 className="text-lg font-semibold tracking-tight truncate">
                Stryke Data Interface
              </h2>
            )}
          </div>
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Button
                key={item.value}
                variant={activeTab === item.value ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isCollapsed && "justify-center px-2"
                )}
                onClick={() => onTabChange(item.value)}
              >
                {item.icon}
                {!isCollapsed && (
                  <span className="ml-2">{item.label}</span>
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 