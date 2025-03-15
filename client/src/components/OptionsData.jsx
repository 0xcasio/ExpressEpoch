import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { RefreshCw, TrendingUp, DollarSign, BarChart3, Activity, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";

export default function OptionsData() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marketsData, setMarketsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [aggregatedStats, setAggregatedStats] = useState({
    totalNotional: 0,
    openInterest: 0,
    volume24h: 0,
    totalLiquidity: 0
  });
  
  // Filtering and sorting state
  const [chainFilter, setChainFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: 'totalLiquidity',
    direction: 'desc'
  });
  
  // Get unique chain names for filter
  const chainNames = [...new Set(marketsData.map(market => market.chainName || 'Unknown'))].sort();

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
      // Define all chains to fetch data from
      const chains = [
        { id: 42161, name: 'Arbitrum' },
        { id: 146, name: 'Sonic' },
        { id: 80094, name: 'Berachain' },
        { id: 8453, name: 'Base' },
        { id: 5000, name: 'Mantle' }
      ];
      
      console.log(`Fetching data from ${chains.length} chains...`);
      
      // Fetch data from all chains
      const chainResponses = await Promise.allSettled(
        chains.map(chain => 
          fetch(`https://api.stryke.xyz/v1.1/clamm/option-markets?chains=${chain.id}`)
        )
      );
      
      // Process responses for each chain
      let allActiveMarkets = [];
      let failedChains = [];
      
      for (let i = 0; i < chainResponses.length; i++) {
        const chain = chains[i];
        const response = chainResponses[i];
        
        if (response.status === 'fulfilled' && response.value.ok) {
          console.log(`API response status - ${chain.name}:`, response.value.status);
          
          try {
            // Parse response
            const data = await response.value.json();
            
            // Add chain information to each market
            const marketsWithChain = data.map(market => ({
              ...market,
              chainId: chain.id,
              chainName: chain.name
            }));
            
            // Filter out deprecated markets
            const activeMarkets = marketsWithChain.filter(market => market.deprecated === false);
            
            console.log(`Found ${activeMarkets.length} active markets for ${chain.name}`);
            
            // Add to all markets
            allActiveMarkets = [...allActiveMarkets, ...activeMarkets];
            
          } catch (parseError) {
            console.error(`Error parsing ${chain.name} response:`, parseError);
            failedChains.push(chain.name);
          }
        } else {
          console.error(`Failed to fetch data from ${chain.name}:`, 
            response.status === 'fulfilled' ? `Status ${response.value.status}` : response.reason);
          failedChains.push(chain.name);
        }
      }
      
      console.log(`Combined ${allActiveMarkets.length} active markets from ${chains.length - failedChains.length} chains`);
      if (failedChains.length > 0) {
        console.warn(`Failed to fetch data from these chains: ${failedChains.join(', ')}`);
      }
      
      // Calculate aggregated stats from all chains
      const stats = allActiveMarkets.reduce((acc, market) => {
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
      stats.totalNotional = stats.openInterest;
      
      setMarketsData(allActiveMarkets);
      setAggregatedStats(stats);
      setError(null);
    } catch (err) {
      console.error("Error fetching market data:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle sorting
  const handleSort = (key) => {
    let direction = 'desc';
    
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    
    setSortConfig({ key, direction });
  };
  
  // Get sort icon based on current sort state
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4 ml-1" />;
    }
    
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="h-4 w-4 ml-1" /> 
      : <ArrowDown className="h-4 w-4 ml-1" />;
  };
  
  // Filter and sort data when dependencies change
  useEffect(() => {
    if (marketsData.length > 0) {
      let filtered = [...marketsData];
      
      // Apply chain filter
      if (chainFilter !== 'all') {
        filtered = filtered.filter(market => market.chainName === chainFilter);
      }
      
      // Apply sorting
      filtered.sort((a, b) => {
        const valueA = parseFloat(a[sortConfig.key] || 0);
        const valueB = parseFloat(b[sortConfig.key] || 0);
        
        if (sortConfig.direction === 'asc') {
          return valueA - valueB;
        } else {
          return valueB - valueA;
        }
      });
      
      // Limit to top 20 markets
      setFilteredData(filtered.slice(0, 20));
    }
  }, [marketsData, chainFilter, sortConfig]);
  
  // Fetch data on component mount
  useEffect(() => {
    fetchMarketData();
  }, []);
  
  // Handle refresh button click
  const handleRefresh = () => {
    fetchMarketData();
  };
  
  // Handle chain filter change
  const handleChainFilterChange = (value) => {
    setChainFilter(value);
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
      
      {/* Options chain Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Options chain</CardTitle>
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
          {/* Filter Controls */}
          <div className="mb-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="chain-filter">Filter by Chain:</Label>
              <Select value={chainFilter} onValueChange={handleChainFilterChange}>
                <SelectTrigger id="chain-filter" className="w-[180px]">
                  <SelectValue placeholder="Select Chain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Chains</SelectItem>
                  {chainNames.map(chain => (
                    <SelectItem key={chain} value={chain}>{chain}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">{error}</div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No markets data available</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Market</TableHead>
                    <TableHead>Chain</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('openInterest')}>
                      <div className="flex items-center">
                        Open Interest
                        {getSortIcon('openInterest')}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('totalLiquidity')}>
                      <div className="flex items-center">
                        Total Liquidity
                        {getSortIcon('totalLiquidity')}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('volume24h')}>
                      <div className="flex items-center">
                        24h Volume
                        {getSortIcon('volume24h')}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((market, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{market.pairName}</TableCell>
                      <TableCell>{market.chainName}</TableCell>
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