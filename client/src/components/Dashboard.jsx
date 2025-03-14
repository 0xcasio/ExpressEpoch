import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Progress } from "./ui/progress";
import { Button } from "./ui/button";
import { RefreshCw } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { callContractFunction, fetchHistoricalEpochData } from '../services/api';

// Chart colors matching the shadcn dark theme
const colors = ["#3b82f6", "#f472b6", "#f59e0b", "#10b981", "#c084fc"];

export default function Dashboard() {
  const [currentEpoch, setCurrentEpoch] = useState("Loading...");
  const [totalReward, setTotalReward] = useState("Loading...");
  const [countdownDisplay, setCountdownDisplay] = useState("Calculating...");
  const [progress, setProgress] = useState(0);
  const [previousEpochRewards, setPreviousEpochRewards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [chartData, setChartData] = useState([]);

  // Function to convert historical data to chart format
  const transformDataForChart = (data) => {
    if (!data || data.length === 0) return [];
    
    // Get all unique pool names
    const allPools = new Set();
    data.forEach(epoch => {
      epoch.pools.forEach(pool => {
        allPools.add(pool.poolName);
      });
    });
    
    // Create data points for each epoch
    return data.map(epoch => {
      const dataPoint = {
        name: `Epoch ${epoch.epoch}`,
      };
      
      // Add data for each pool
      Array.from(allPools).forEach(poolName => {
        const poolData = epoch.pools.find(p => p.poolName === poolName);
        dataPoint[poolName] = poolData ? poolData.reward : 0;
      });
      
      return dataPoint;
    });
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch current epoch
      const epochResponse = await callContractFunction('epoch');
      if (epochResponse.success) {
        setCurrentEpoch(epochResponse.result);
        
        // Fetch rewards for previous epoch if it exists
        const previousEpoch = parseInt(epochResponse.result) - 1;
        if (previousEpoch >= 0) {
          const rewardsResponse = await fetch('/api/all-pools', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ epoch: previousEpoch.toString() })
          });
          
          const rewardsData = await rewardsResponse.json();
          if (rewardsData.success) {
            setPreviousEpochRewards(rewardsData.results);
          }
        }
      }

      // Fetch total reward per epoch
      const rewardResponse = await callContractFunction('totalRewardPerEpoch');
      if (rewardResponse.success) {
        // Format the reward value
        const bigNumber = BigInt(rewardResponse.result);
        const formatted = Number(bigNumber) / 1e18;
        setTotalReward(formatted.toLocaleString(undefined, { maximumFractionDigits: 2 }));
      }

      // Fetch historical data for chart
      const histData = await fetchHistoricalEpochData();
      setHistoricalData(histData);
      setChartData(transformDataForChart(histData));

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  // Initialize epoch countdown
  const initEpochCountdown = async () => {
    try {
      const [epochLengthResult, genesisResult, currentEpochResult] = await Promise.all([
        callContractFunction('EPOCH_LENGTH'),
        callContractFunction('genesis'),
        callContractFunction('epoch')
      ]);

      if (epochLengthResult.success && genesisResult.success && currentEpochResult.success) {
        const epochLength = BigInt(epochLengthResult.result);
        const genesis = BigInt(genesisResult.result);
        const currentEpoch = BigInt(currentEpochResult.result);

        // Calculate current epoch end time
        const currentEpochEndTime = Number(genesis + ((currentEpoch + 1n) * epochLength)) * 1000;
        updateCountdown(currentEpochEndTime, Number(epochLength) * 1000);
        
        // Update countdown every second
        const interval = setInterval(() => {
          updateCountdown(currentEpochEndTime, Number(epochLength) * 1000);
        }, 1000);
        
        return interval; // Return the interval ID instead of a function
      }
    } catch (error) {
      console.error("Error initializing countdown:", error);
      setCountdownDisplay("Error loading countdown");
    }
    
    return null; // Return null if there's an error or if the if condition is not met
  };

  // Update countdown display and progress
  const updateCountdown = (endTime, epochLengthMs) => {
    const now = Date.now();
    const timeRemaining = endTime - now;
    
    if (timeRemaining <= 0) {
      setCountdownDisplay("Epoch has ended! Refreshing...");
      setProgress(100);
      setTimeout(fetchDashboardData, 3000);
      return;
    }
    
    // Calculate time components
    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);
    
    // Format countdown
    setCountdownDisplay(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    
    // Update progress bar
    const startTime = endTime - epochLengthMs;
    const elapsed = now - startTime;
    const percentage = Math.min(100, Math.max(0, (elapsed / epochLengthMs) * 100));
    setProgress(percentage);
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Fix the async function issue by creating a separate async function inside useEffect
    let intervalId = null;
    
    const setupCountdown = async () => {
      intervalId = await initEpochCountdown();
    };
    
    setupCountdown();
    
    // Return a proper cleanup function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Button 
          onClick={fetchDashboardData} 
          variant="outline" 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> 
          Refresh Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Current Epoch Card */}
        <Card>
          <CardHeader>
            <CardTitle>Current Epoch</CardTitle>
            <CardDescription>The current epoch number users are voting for</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{currentEpoch}</div>
          </CardContent>
        </Card>

        {/* Total Reward Card */}
        <Card>
          <CardHeader>
            <CardTitle>Total Reward Per Epoch</CardTitle>
            <CardDescription>Total Syk rewards distributed each epoch</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalReward}</div>
          </CardContent>
        </Card>

        {/* Epoch Countdown Card */}
        <Card>
          <CardHeader>
            <CardTitle>Current Epoch Ends In</CardTitle>
            <CardDescription>Time remaining until current epoch ends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-center">{countdownDisplay}</div>
            <Progress value={progress} className="h-2 mt-4" />
          </CardContent>
        </Card>
      </div>

      {/* Previous Epoch Rewards Card */}
      <Card>
        <CardHeader>
          <CardTitle>Previous Epoch Rewards</CardTitle>
          <CardDescription>Rewards distribution for all pools in the previous epoch</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">Loading rewards data...</div>
          ) : error ? (
            <div className="text-destructive">{error}</div>
          ) : previousEpochRewards.length === 0 ? (
            <div className="text-muted-foreground py-4">No previous epoch data available yet</div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Pool</th>
                    <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Syk Total Rewards</th>
                  </tr>
                </thead>
                <tbody>
                  {previousEpochRewards.map((reward, index) => (
                    <tr key={index} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle">{reward.poolName}</td>
                      <td className="p-4 align-middle text-right">{reward.formattedValue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historical Chart Card */}
      <Card>
        <CardHeader>
          <CardTitle>Historical Epoch Rewards Distribution</CardTitle>
          <CardDescription>Rewards distribution for all pools across completed epochs</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {isLoading ? (
            <div className="flex justify-center py-4">Loading chart data...</div>
          ) : error ? (
            <div className="text-destructive">{error}</div>
          ) : chartData.length === 0 ? (
            <div className="text-muted-foreground py-4">No historical data available yet</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="name" stroke="#a1a1aa" />
                <YAxis stroke="#a1a1aa" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    borderColor: 'hsl(var(--border))',
                    color: 'hsl(var(--card-foreground))',
                    borderRadius: 'var(--radius)'
                  }} 
                />
                <Legend />
                {Object.keys(chartData[0])
                  .filter(key => key !== 'name')
                  .map((key, index) => (
                    <Line 
                      key={key}
                      type="monotone" 
                      dataKey={key} 
                      stroke={colors[index % colors.length]} 
                      strokeWidth={2}
                      dot={{ strokeWidth: 1, r: 4 }}
                      activeDot={{ r: 6 }} 
                    />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}