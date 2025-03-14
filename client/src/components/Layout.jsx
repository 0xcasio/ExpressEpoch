import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Dashboard from './Dashboard';
import RewardsLookup from './RewardsLookup';
import ContractFunctions from './ContractFunctions';
import OptionsData from './OptionsData';
import { ThemeProvider } from "./theme-provider";

export default function Layout() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <ThemeProvider defaultTheme="dark" forcedTheme="dark">
      <div className="container mx-auto py-10">
        <h1 className="text-4xl font-bold text-center mb-10">
          Stryke Rewards Gauges Interface
        </h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-4 mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="contract">Contract</TabsTrigger>
            <TabsTrigger value="options">Options Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>
          
          <TabsContent value="rewards">
            <RewardsLookup />
          </TabsContent>
          
          <TabsContent value="contract">
            <ContractFunctions />
          </TabsContent>
          
          <TabsContent value="options">
            <OptionsData />
          </TabsContent>
        </Tabs>
      </div>
    </ThemeProvider>
  );
}