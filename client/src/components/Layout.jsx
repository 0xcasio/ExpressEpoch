import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Dashboard from './Dashboard';
import RewardsLookup from './RewardsLookup';
import ContractFunctions from './ContractFunctions';
import OptionsData from './OptionsData';
import { ThemeProvider } from "./theme-provider";

export default function Layout() {
  const [activeTab, setActiveTab] = useState("options");

  return (
    <ThemeProvider defaultTheme="dark" forcedTheme="dark">
      <div className="container mx-auto py-10">
        <h1 className="text-4xl font-bold text-center mb-10">
          Stryke Data Interface
        </h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3 mb-8">
            <TabsTrigger value="options">Options chain</TabsTrigger>
            <TabsTrigger value="dashboard">Epoch rewards</TabsTrigger>
            <TabsTrigger value="rewards">Epoch lookup</TabsTrigger>
            {/* <TabsTrigger value="contract">Contract interface</TabsTrigger> */}

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