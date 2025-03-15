import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card";
import { Button } from "./button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from "../../utils/formatters";

// Color palette for different chains
const CHAIN_COLORS = {
  'Arbitrum': '#10B981', // Green
  'Sonic': '#3B82F6',    // Blue
  'Berachain': '#8B5CF6', // Purple
  'Base': '#EC4899',     // Pink
  'Mantle': '#F59E0B',   // Amber
  'Blast': '#EF4444',    // Red
  'Total': '#6B7280'     // Gray
};

const ProtocolFeesChart = ({ feesByChain }) => {
  const [timeRange, setTimeRange] = useState('7d'); // Default to 7 days
  
  // Generate mock historical data based on current fees
  // In a real app, this would come from an API
  const chartData = useMemo(() => {
    if (!feesByChain || Object.keys(feesByChain).length === 0) {
      return [];
    }
    
    const chains = Object.values(feesByChain)
      .filter(chain => chain.chainId !== 'total')
      .map(chain => chain.chainName);
    
    // Number of days to show based on selected time range
    const days = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
    
    // Generate data points for each day
    return Array.from({ length: days }).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - index));
      
      // Start with the date
      const dataPoint = {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      };
      
      // Add cumulative fees for each chain
      // This creates a progressive increase based on current values
      chains.forEach(chainName => {
        const chain = Object.values(feesByChain).find(c => c.chainName === chainName);
        if (chain) {
          // Create a progressive growth pattern
          const growthFactor = 1 + (index / days);
          const baseValue = chain.cumulativeFees / days * (index + 1);
          // Add some randomness to make it look more realistic
          const randomFactor = 0.9 + Math.random() * 0.2;
          dataPoint[chainName] = baseValue * growthFactor * randomFactor;
        }
      });
      
      return dataPoint;
    });
  }, [feesByChain, timeRange]);
  
  // Get active chains (those with non-zero fees)
  const activeChains = useMemo(() => {
    if (!feesByChain) return [];
    
    return Object.values(feesByChain)
      .filter(chain => chain.chainId !== 'total' && chain.cumulativeFees > 0)
      .map(chain => chain.chainName);
  }, [feesByChain]);
  
  if (!feesByChain || Object.keys(feesByChain).length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Cumulative Protocol Fees</CardTitle>
          <CardDescription>Historical view of protocol fees by chain</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] flex items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex flex-col space-y-1.5">
          <CardTitle>Cumulative Protocol Fees</CardTitle>
          <CardDescription>Historical view of protocol fees by chain</CardDescription>
        </div>
        <div className="flex space-x-2 mt-2">
          <Button 
            variant={timeRange === '7d' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setTimeRange('7d')}
          >
            7 Days
          </Button>
          <Button 
            variant={timeRange === '14d' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setTimeRange('14d')}
          >
            14 Days
          </Button>
          <Button 
            variant={timeRange === '30d' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setTimeRange('30d')}
          >
            30 Days
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="date" />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value, { notation: 'compact' })}
              />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              {activeChains.map((chain, index) => (
                <Area
                  key={chain}
                  type="monotone"
                  dataKey={chain}
                  stackId="1"
                  stroke={CHAIN_COLORS[chain] || `hsl(${index * 40}, 70%, 50%)`}
                  fill={CHAIN_COLORS[chain] || `hsl(${index * 40}, 70%, 50%)`}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProtocolFeesChart; 