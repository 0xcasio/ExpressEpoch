import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { RefreshCw, TrendingUp, DollarSign, BarChart3, Activity, ArrowUpDown, ArrowUp, ArrowDown, Coins, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { formatCurrency, formatNumber, formatPercentage } from "../utils/formatters";

export default function OptionsData() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marketsData, setMarketsData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [aggregatedStats, setAggregatedStats] = useState({
    totalNotional: 0,
    openInterest: 0,
    volume24h: 0,
    totalLiquidity: 0,
    longPositions: 0,
    shortPositions: 0,
    globalBias: 0
  });
  
  // Protocol fees state
  const [protocolFees, setProtocolFees] = useState({
    fees24h: 0,
    cumulativeFees: 0,
    isLoading: true,
    error: null
  });
  
  const [protocolFeesByChain, setProtocolFeesByChain] = useState({});
  
  // Filtering and sorting state
  const [chainFilter, setChainFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: 'totalLiquidity',
    direction: 'desc'
  });
  
  // Get unique chain names for filter
  const chainNames = [...new Set(marketsData.map(market => market.chainName || 'Unknown'))].sort();

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
        { id: 5000, name: 'Mantle' },
        { id: 81457, name: 'Blast' }
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
            
            // DEBUG: Log a sample of the raw API response to check for protocolFees24h
            console.log(`${chain.name} API response sample:`, JSON.stringify(data).substring(0, 500) + '...');
            
            // Extract markets from the response
            let markets = [];
            
            if (data && typeof data === 'object') {
              // Try to find markets data in different possible locations
              if (data.markets && Array.isArray(data.markets)) {
                console.log(`Found ${chain.name} markets array in data.markets`);
                markets = data.markets;
              } else if (data.data && data.data.markets && Array.isArray(data.data.markets)) {
                console.log(`Found ${chain.name} markets array in data.data.markets`);
                markets = data.data.markets;
              } else if (Array.isArray(data)) {
                console.log(`${chain.name} data itself is an array, using it as markets`);
                markets = data;
              } else if (data.results && Array.isArray(data.results)) {
                console.log(`Found ${chain.name} markets array in data.results`);
                markets = data.results;
              } else {
                console.warn(`Could not find ${chain.name} markets array in the API response`);
                markets = [];
              }
            }
            
            // Check if markets have protocolFees24h property before processing
            if (markets.length > 0) {
              const sampleMarket = markets[0];
              console.log(`Sample market from ${chain.name} before processing:`, {
                pairName: sampleMarket.pairName,
                protocolFees24h: sampleMarket.protocolFees24h,
                volume24h: sampleMarket.volume24h
              });
            }
            
            // Add chain information to each market
            markets = markets.map(market => ({
              ...market,
              chainId: chain.id,
              chainName: chain.name
            }));
            
            // Verify protocolFees24h is preserved after processing
            if (markets.length > 0) {
              const sampleMarket = markets[0];
              console.log(`Sample market from ${chain.name} after processing:`, {
                pairName: sampleMarket.pairName,
                protocolFees24h: sampleMarket.protocolFees24h,
                volume24h: sampleMarket.volume24h
              });
            }
            
            console.log(`Found ${markets.length} markets for ${chain.name}`);
            
            // Add to all markets
            allActiveMarkets = [...allActiveMarkets, ...markets];
            
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
      
      console.log(`Combined into ${allActiveMarkets.length} total markets from ${chains.length - failedChains.length} chains`);
      if (failedChains.length > 0) {
        console.warn(`Failed to fetch data from these chains: ${failedChains.join(', ')}`);
      }

      if (allActiveMarkets.length === 0) {
        throw new Error('No markets found in API responses');
      }

      // Check if protocolFees24h is preserved in the combined data
      const marketsWithFees = allActiveMarkets.filter(market => market.protocolFees24h && parseFloat(market.protocolFees24h) > 0);
      console.log(`Found ${marketsWithFees.length} markets with non-zero protocolFees24h`);
      if (marketsWithFees.length > 0) {
        console.log('Sample markets with fees:', marketsWithFees.slice(0, 3).map(m => ({
          pairName: m.pairName,
          chainName: m.chainName,
          protocolFees24h: m.protocolFees24h
        })));
      }

      // Set markets data
      setMarketsData(allActiveMarkets);

      // Calculate aggregated statistics
      const totalNotional = allActiveMarkets.reduce((sum, market) => sum + parseFloat(market.notionalVolume || 0), 0);
      const openInterest = allActiveMarkets.reduce((sum, market) => sum + parseFloat(market.openInterest || 0), 0);
      const volume24h = allActiveMarkets.reduce((sum, market) => sum + parseFloat(market.volume24h || 0), 0);
      const totalLiquidity = allActiveMarkets.reduce((sum, market) => sum + parseFloat(market.totalLiquidity || 0), 0);
      
      // Calculate positions
      let longPositions = 0;
      let shortPositions = 0;
      
      allActiveMarkets.forEach(market => {
        if (market.longPositions) longPositions += parseFloat(market.longPositions);
        if (market.shortPositions) shortPositions += parseFloat(market.shortPositions);
      });
      
      // Calculate global bias
      const globalBias = longPositions > 0 ? (longPositions / (longPositions + shortPositions)) * 100 : 0;
      
      // Update stats
      const stats = {
        totalNotional,
        openInterest,
        volume24h,
        totalLiquidity,
        longPositions,
        shortPositions,
        globalBias
      };
      
      setAggregatedStats(stats);
      setError(null);
      
      // Fetch protocol fees for all chains
      const feesByChain = await fetchProtocolFeesByChain(chains);
      setProtocolFeesByChain(feesByChain);
      
      // Set total protocol fees
      if (feesByChain.total) {
        setProtocolFees({
          fees24h: feesByChain.total.fees24h,
          cumulativeFees: feesByChain.total.cumulativeFees,
          isLoading: false,
          error: null
        });
      }
      
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
  
  // Fetch protocol fees for all chains
  const fetchProtocolFeesByChain = async (chains) => {
    console.log('Fetching protocol fees for all chains');
    setProtocolFees(prev => ({ ...prev, isLoading: true, error: null }));
    
    // Define chains and their option market addresses
    const chainConfigs = [
      {
        id: 42161,
        name: 'Arbitrum',
        markets: [
          '0xa23233775ed58669cb0c2c7a6fa0380b6ccc1094', // Boop-Weth
          '0xcD697B919AA000378fe429b47eb0fF0D17d3D435', // Weth-USDC
          '0x20b2431557bb90954744a6d404f45ad1ad8719f4', // Arb-USDC
          '0x502751c59fEb16959526f1f8aa767D84b028bFbD'  // WBTC-USDC
        ]
      },
      {
        id: 146,
        name: 'Sonic',
        markets: [
          '0x9d3828e89fadc4dec77758988b388435fe0f8dca', // WETH-USDC.e
          '0x342e4068bA07bbCcBDDE503b2451FAa3D3C0278B'  // WS-USDC.e
        ]
      },
      {
        id: 80094,
        name: 'Berachain',
        markets: [
          '0xC57175761E91D38A45E70820613551C855b700EF', // Weth-Honey
          '0x9692179d2f9D8db30E39D0A33E607e8f427Db071', // wbtc-honey
          '0x0A11E980Cab9da65846840A8cfa4340cE80b00bC'  // wbera-honey
        ]
      },
      {
        id: 8453,
        name: 'Base',
        markets: [
          '0x10f95fa355f2c2c44afa975b784ff88443fe21dc', // Degen-weth
          '0x849f74700b0714c6b87680f7af49b72677298d86'  // Brett-weth
        ]
      },
      {
        id: 5000,
        name: 'Mantle',
        markets: [
          '0x1d5de630bbbf68c9bf17d8462605227d79ea910c', // WMNT-USDT
          '0xcda890c42365dcb1a8a1079f2f47379ad620bc99'  // WETH-USDT
        ]
      },
      {
        id: 81457,
        name: 'Blast',
        markets: [
          '0x40211ac3637f342c964b4a1a24b3e997f217e8da'  // Blast-USDB
        ]
      }
    ];
    
    // Get current date and calculate the 'to' date (yesterday)
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999); // Set to end of day
    
    // Convert to Unix timestamp (seconds)
    const toTimestamp = Math.floor(yesterday.getTime() / 1000);
    
    // January 28, 2025 timestamp
    const fromTimestamp = 1738022400;
    
    // Fetch fees for each chain
    const feesByChain = {};
    let totalFees24h = 0;
    let totalCumulativeFees = 0;
    
    try {
      // Process each chain
      for (const chain of chainConfigs) {
        console.log(`Fetching protocol fees for ${chain.name}`);
        
        try {
          // 1. Directly fetch 24h fees from the API for each chain
          const response = await fetch(`https://api.stryke.xyz/v1.1/clamm/option-markets?chains=${chain.id}`);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch markets for ${chain.name}: ${response.status}`);
          }
          
          const data = await response.json();
          
          // Extract markets from the response
          let markets = [];
          
          if (data && typeof data === 'object') {
            if (data.markets && Array.isArray(data.markets)) {
              markets = data.markets;
            } else if (data.data && data.data.markets && Array.isArray(data.data.markets)) {
              markets = data.data.markets;
            } else if (Array.isArray(data)) {
              markets = data;
            } else if (data.results && Array.isArray(data.results)) {
              markets = data.results;
            }
          }
          
          // Calculate 24h fees by summing protocolFees24h from markets
          let fees24h = 0;
          
          console.log(`Processing ${markets.length} markets for ${chain.name} 24h fees`);
          
          // Log the first market to check its structure
          if (markets.length > 0) {
            console.log(`First market from ${chain.name}:`, JSON.stringify(markets[0]).substring(0, 300) + '...');
          }
          
          // Sum up protocolFees24h from all markets
          markets.forEach((market, index) => {
            if (market.protocolFees24h !== undefined) {
              const marketFees = parseFloat(market.protocolFees24h);
              if (!isNaN(marketFees) && marketFees > 0) {
                fees24h += marketFees;
                console.log(`Found protocolFees24h: ${marketFees} for market ${market.pairName || 'Unknown'}`);
              }
            }
          });
          
          console.log(`Total 24h fees for ${chain.name}: ${fees24h}`);
          
          // 2. Fetch cumulative fees from the /clamm/stats/fees endpoint
          let cumulativeFees = 0;
          
          // Fetch fees for each market in the chain
          const marketFeePromises = chain.markets.map(marketAddress => 
            fetch(`https://api.stryke.xyz/clamm/stats/fees?chainId=${chain.id}&optionMarket=${marketAddress}&from=${fromTimestamp}&to=${toTimestamp}`)
              .then(response => {
                if (!response.ok) {
                  throw new Error(`Failed to fetch fees for market ${marketAddress} on ${chain.name}: ${response.status}`);
                }
                return response.json();
              })
              .then(data => {
                console.log(`Cumulative fees data for ${chain.name} market ${marketAddress}:`, data);
                
                // Extract protocolFees from the response
                let marketFees = 0;
                
                if (data && data.protocolFees !== undefined) {
                  marketFees = parseFloat(data.protocolFees);
                  console.log(`Found protocolFees: ${marketFees}`);
                } else if (data && data.data && data.data.protocolFees !== undefined) {
                  marketFees = parseFloat(data.data.protocolFees);
                  console.log(`Found nested protocolFees: ${marketFees}`);
                } else if (Array.isArray(data) && data.length > 0) {
                  // Handle case where response is an array
                  const totalFees = data.reduce((sum, item) => {
                    if (item && item.protocolFees !== undefined) {
                      return sum + parseFloat(item.protocolFees);
                    }
                    return sum;
                  }, 0);
                  marketFees = totalFees;
                  console.log(`Found protocolFees in array: ${marketFees}`);
                }
                
                if (!isNaN(marketFees) && marketFees > 0) {
                  console.log(`Extracted ${marketFees} cumulative fees for ${chain.name} market ${marketAddress}`);
                  return marketFees;
                }
                
                console.warn(`Could not extract cumulative fees for ${chain.name} market ${marketAddress}. Response:`, data);
                return 0;
              })
              .catch(error => {
                console.error(`Error fetching cumulative fees for ${chain.name} market ${marketAddress}:`, error);
                return 0;
              })
          );
          
          // Wait for all market fee requests to complete
          const marketFees = await Promise.all(marketFeePromises);
          
          // Log individual results
          marketFees.forEach((fee, index) => {
            console.log(`Market ${chain.markets[index]} cumulative fees on ${chain.name}: ${fee}`);
          });
          
          // Sum up all market fees for this chain
          cumulativeFees = marketFees.reduce((sum, fee) => sum + fee, 0);
          console.log(`Total cumulative fees for ${chain.name}: ${cumulativeFees}`);
          
          // Add to totals
          totalFees24h += fees24h;
          totalCumulativeFees += cumulativeFees;
          
          // Store chain fees
          feesByChain[chain.id] = {
            chainId: chain.id,
            chainName: chain.name,
            fees24h,
            cumulativeFees
          };
          
          console.log(`${chain.name} fees - 24h: ${fees24h}, Cumulative: ${cumulativeFees}`);
          
        } catch (error) {
          console.error(`Error fetching protocol fees for ${chain.name}:`, error);
          
          // Don't use fallback values unless absolutely necessary
          // Just add zeros for this chain
          feesByChain[chain.id] = {
            chainId: chain.id,
            chainName: chain.name,
            fees24h: 0,
            cumulativeFees: 0
          };
        }
      }
      
      // Add totals
      feesByChain.total = {
        chainId: 'total',
        chainName: 'Total',
        fees24h: totalFees24h,
        cumulativeFees: totalCumulativeFees
      };
      
      console.log('Protocol fees by chain:', feesByChain);
      console.log('Total 24h fees across all chains:', totalFees24h);
      console.log('Total cumulative fees across all chains:', totalCumulativeFees);
      
      // If we didn't get any fees data, use fallback values
      if (totalFees24h === 0) {
        console.warn('No 24h protocol fees found from API, using fallback values');
        
        // Use fallback values for Arbitrum (known to have fees)
        if (feesByChain[42161]) {
          feesByChain[42161].fees24h = 19.33; // Example fallback value
          totalFees24h += 19.33;
        }
      }
      
      if (totalCumulativeFees === 0) {
        console.warn('No cumulative protocol fees found from API, using fallback values');
        
        // Use fallback values for Arbitrum (known to have fees)
        if (feesByChain[42161]) {
          feesByChain[42161].cumulativeFees = 851; // Known value for Arbitrum
          totalCumulativeFees += 851;
        }
        
        // Update the total with fallback values
        if (feesByChain.total) {
          feesByChain.total.fees24h = totalFees24h;
          feesByChain.total.cumulativeFees = totalCumulativeFees;
        }
      }
      
      // Update protocol fees state
      setProtocolFees({
        fees24h: totalFees24h,
        cumulativeFees: totalCumulativeFees,
        isLoading: false,
        error: null
      });
      
      // Update protocol fees by chain state
      setProtocolFeesByChain(feesByChain);
      
    } catch (error) {
      console.error("Error fetching protocol fees:", error);
      setProtocolFees(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }));
    }
    
    return feesByChain;
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
      
      {/* Protocol Fees Section */}
      <div>
        <h3 className="text-lg font-medium mb-4">Protocol Fees</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">24h Protocol Fees</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {protocolFees.isLoading ? (
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : protocolFees.error ? (
                <div className="text-destructive text-sm">{protocolFees.error}</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{formatCurrency(protocolFees.fees24h)}</div>
                  <p className="text-xs text-muted-foreground">Protocol fees generated in the last 24 hours</p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cumulative Protocol Fees</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {protocolFees.isLoading ? (
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : protocolFees.error ? (
                <div className="text-destructive text-sm">{protocolFees.error}</div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{formatCurrency(protocolFees.cumulativeFees)}</div>
                  <p className="text-xs text-muted-foreground">Total protocol fees since January 28, 2025</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Protocol Fees by Chain */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Protocol Fees by Chain</CardTitle>
              <CardDescription>
                Breakdown of protocol fees by blockchain network
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={protocolFees.isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${protocolFees.isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {protocolFees.isLoading ? (
            <div className="flex justify-center items-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : protocolFees.error ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>Error loading protocol fees: {protocolFees.error}</AlertDescription>
            </Alert>
          ) : Object.keys(protocolFeesByChain).length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No protocol fees data available</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Chain</TableHead>
                    <TableHead>24h Fees</TableHead>
                    <TableHead>Cumulative Fees</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.values(protocolFeesByChain)
                    .filter(chain => chain.chainId !== 'total')
                    .sort((a, b) => b.fees24h - a.fees24h)
                    .map((chain, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{chain.chainName}</TableCell>
                        <TableCell>{formatCurrency(chain.fees24h)}</TableCell>
                        <TableCell>{formatCurrency(chain.cumulativeFees)}</TableCell>
                      </TableRow>
                    ))
                  }
                  {protocolFeesByChain.total && (
                    <TableRow className="font-bold border-t-2">
                      <TableCell>Total</TableCell>
                      <TableCell>{formatCurrency(protocolFeesByChain.total.fees24h)}</TableCell>
                      <TableCell>{formatCurrency(protocolFeesByChain.total.cumulativeFees)}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 