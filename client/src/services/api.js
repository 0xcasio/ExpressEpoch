export async function callContractFunction(functionName, params = []) {
    try {
      const response = await fetch('/api/contract-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ functionName, params })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error calling ${functionName}:`, error);
      throw error;
    }
  }
  
  export async function lookupRewards(poolId, epoch) {
    try {
      const endpoint = poolId === 'all' ? '/api/all-pools' : '/api/rewards';
      const payload = poolId === 'all' ? { epoch } : { poolId, epoch };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error looking up rewards:', error);
      throw error;
    }
  }
  
  export async function fetchHistoricalEpochData() {
    try {
      // Get current epoch to determine how many previous epochs exist
      const epochResponse = await callContractFunction('epoch');
      if (!epochResponse.success) throw new Error('Failed to fetch current epoch');
      
      const currentEpoch = parseInt(epochResponse.result);
      const historicalData = [];
      
      // Fetch data for previous epochs
      for (let epoch = 0; epoch < currentEpoch; epoch++) {
        const rewardsResponse = await fetch('/api/all-pools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ epoch: epoch.toString() })
        });
        
        const rewardsData = await rewardsResponse.json();
        if (!rewardsData.success) continue;
        
        // Format data for chart consumption
        const epochResults = {
          epoch: epoch,
          pools: rewardsData.results.map(result => ({
            poolName: result.poolName,
            poolId: result.poolId,
            reward: parseFloat(result.formattedValue) || 0
          }))
        };
        
        historicalData.push(epochResults);
      }
      
      return historicalData;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw error;
    }
  }