import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card";
import { Button } from "./button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from "../../utils/formatters";
import { CHAIN_COLORS } from "../../config/chain-colors";

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
    
    // Get the total cumulative fees to ensure our chart matches the actual total
    const totalCumulativeFees = feesByChain.total ? feesByChain.total.cumulativeFees : 
      Object.values(feesByChain)
        .filter(chain => chain.chainId !== 'total')
        .reduce((sum, chain) => sum + chain.cumulativeFees, 0);
    
    console.log('Total cumulative fees for chart:', totalCumulativeFees);
    
    // Generate data points for each day
    return Array.from({ length: days }).map((_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - index));
      
      // Start with the date
      const dataPoint = {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      };
      
      // Calculate the proportion of total fees to show for this day
      // For the last day, we want to show exactly the current cumulative fees
      const dayProportion = index === days - 1 ? 1 : (index / (days - 1)) * 0.9;
      
      // Add cumulative fees for each chain
      chains.forEach(chainName => {
        const chain = Object.values(feesByChain).find(c => c.chainName === chainName);
        if (chain && chain.cumulativeFees > 0) {
          if (index === days - 1) {
            // For the last day, use the exact cumulative fees value
            dataPoint[chainName] = chain.cumulativeFees;
          } else {
            // For previous days, create a progressive growth pattern
            dataPoint[chainName] = chain.cumulativeFees * dayProportion;
          }
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