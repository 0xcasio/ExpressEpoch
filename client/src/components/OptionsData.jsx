import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { RefreshCw, TrendingUp, DollarSign, BarChart3, Activity } from "lucide-react";

export default function OptionsData() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marketsData, setMarketsData] = useState([]);
  const [aggregatedStats, setAggregatedStats] = useState({
    totalNotional: 0,
    openInterest: 0,
    volume24h: 0,
    totalLiquidity: 0
  });

  // Format currency values
  const formatCurrency = (value) => {
    if (!value && value !== 0) return "N/A";
    
    // Convert to number if it's a string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // Check if it's a valid number
    if (isNaN(numValue)) return "N/A";
    
    // Format based on size
    if (numValue >= 1_000_000_000) {
      return `$${(numValue / 1_000_000_000).toFixed(2)}B`;
    } else if (numValue >= 1_000_000) {
      return `$${(numValue / 1_000_000).toFixed(2)}M`;
    } else if (numValue >= 1_000) {
      return `$${(numValue / 1_000).toFixed(2)}K`;
    } else {
      return `$${numValue.toFixed(2)}`;
    }
  };
  
  // Fetch market data from Stryke API
  const fetchMarketData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://api.stryke.xyz/v1.1/clamm/option-markets?chains=42161');
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Filter out deprecated markets
      const activeMarkets = data.filter(market => market.deprecated === false);
      
      // Calculate aggregated stats
      const stats = activeMarkets.reduce((acc, market) => {
        acc.openInterest += parseFloat(market.openInterest || 0);
        acc.volume24h += parseFloat(market.volume24h || 0);
        acc.totalLiquidity += parseFloat(market.totalLiquidity || 0);
        return acc;
      }, {
        openInterest: 0,
        volume24h: 0,
        totalLiquidity: 0
      });
      
      // Set the total notional to be the same as open interest for now
      // This can be adjusted if a different calculation is needed
      stats.totalNotional = stats.openInterest;
      
      // Log the first market to debug
      if (activeMarkets.length > 0) {
        console.log("Sample market data:", {
          openInterest: activeMarkets[0].openInterest,
          volume24h: activeMarkets[0].volume24h,
          totalLiquidity: activeMarkets[0].totalLiquidity
        });
      }
      
      setMarketsData(activeMarkets);
      setAggregatedStats(stats);
      setError(null);
    } catch (err) {
      console.error("Error fetching market data:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch data on component mount
  useEffect(() => {
    fetchMarketData();
  }, []);
  
  // Handle refresh button click
  const handleRefresh = () => {
    fetchMarketData();
  };
  
  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notional</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(aggregatedStats.totalNotional)}</div>
            <p className="text-xs text-muted-foreground">Total value of all options contracts</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Interest</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(aggregatedStats.openInterest)}</div>
            <p className="text-xs text-muted-foreground">Total value of outstanding contracts</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(aggregatedStats.volume24h)}</div>
            <p className="text-xs text-muted-foreground">Trading volume in the last 24 hours</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Liquidity</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(aggregatedStats.totalLiquidity)}</div>
            <p className="text-xs text-muted-foreground">Available liquidity across all markets</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Top Markets Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Top Markets</CardTitle>
              <CardDescription>
                Key metrics for all active options markets
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">{error}</div>
          ) : marketsData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No markets data available</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Market</TableHead>
                    <TableHead>Open Interest</TableHead>
                    <TableHead>Total Liquidity</TableHead>
                    <TableHead>24h Volume</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {marketsData.map((market, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{market.pairName}</TableCell>
                      <TableCell>{formatCurrency(market.openInterest)}</TableCell>
                      <TableCell>{formatCurrency(market.totalLiquidity)}</TableCell>
                      <TableCell>{formatCurrency(market.volume24h)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 