import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./card";
import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "../../utils/formatters";
import { CHAIN_COLORS } from "../../config/chain-colors";

// Custom tooltip component
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {data.name}
            </span>
            <span className="font-bold text-muted-foreground">
              {formatCurrency(data.value)}
            </span>
            <span className="text-[0.70rem] text-muted-foreground">
              {((data.value / payload[0].payload.total) * 100).toFixed(1)}% of total
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Legend Item Component
const LegendItem = ({ name, color, percentage }) => (
  <div className="flex items-center justify-between py-1">
    <div className="flex items-center gap-2">
      <div 
        className="w-3 h-3 rounded-full" 
        style={{ backgroundColor: color }}
      />
      <span className="text-sm font-medium">{name}</span>
    </div>
    <span className="text-sm text-muted-foreground">{percentage.toFixed(2)}%</span>
  </div>
);

const LiquidityPieChart = ({ marketsData }) => {
  // Calculate liquidity by chain
  const liquidityByChain = useMemo(() => {
    if (!marketsData || marketsData.length === 0) return [];

    const chainLiquidity = {};
    
    // Sum up liquidity for each chain
    marketsData.forEach(market => {
      const chainName = market.chainName || 'Unknown';
      const liquidity = parseFloat(market.totalLiquidity || 0);
      
      if (!chainLiquidity[chainName]) {
        chainLiquidity[chainName] = 0;
      }
      chainLiquidity[chainName] += liquidity;
    });

    // Calculate total liquidity
    const total = Object.values(chainLiquidity).reduce((sum, value) => sum + value, 0);

    // Convert to array format for the chart
    return Object.entries(chainLiquidity)
      .map(([chain, liquidity]) => ({
        name: chain,
        value: liquidity,
        total: total,
        fill: CHAIN_COLORS[chain] || CHAIN_COLORS.Unknown
      }))
      .sort((a, b) => b.value - a.value); // Sort by liquidity descending
  }, [marketsData]);

  if (!marketsData || marketsData.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Liquidity Distribution</CardTitle>
          <CardDescription>Liquidity breakdown by chain</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[250px]">
            <p className="text-muted-foreground">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Liquidity Distribution</CardTitle>
        <CardDescription>Liquidity breakdown by chain</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row md:items-center gap-8 py-4">
          <div className="w-full md:w-[312px] aspect-square">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={liquidityByChain}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={75}
                  outerRadius={100}
                  paddingAngle={2}
                  stroke="none"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col justify-center flex-1">
            {liquidityByChain.map((item) => (
              <LegendItem
                key={item.name}
                name={item.name}
                color={item.fill}
                percentage={(item.value / item.total) * 100}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LiquidityPieChart; 