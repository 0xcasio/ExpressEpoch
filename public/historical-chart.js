// historical-chart.js - Save this file in the public directory
// This file contains functions for fetching and displaying historical epoch data

// Function to fetch historical epoch data
async function fetchHistoricalEpochData() {
    try {
      // Get current epoch to determine how many previous epochs exist
      const epochResponse = await fetch('/api/contract-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ functionName: 'epoch', params: [] })
      });
      
      const epochData = await epochResponse.json();
      if (!epochData.success) throw new Error('Failed to fetch current epoch');
      
      const currentEpoch = parseInt(epochData.result);
      const historicalData = [];
      
      // Fetch data for all previous epochs (0 to currentEpoch-1)
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
  
  // Transform data for chart visualization
  function transformDataForChart(historicalData) {
    // Extract all unique pool names
    const allPools = new Set();
    historicalData.forEach(epoch => {
      epoch.pools.forEach(pool => {
        allPools.add(pool.poolName);
      });
    });
  
    // Create chart data structure
    const chartData = Array.from(allPools).map(poolName => {
      const dataPoint = {
        name: poolName
      };
      
      // Add data for each epoch
      historicalData.forEach(epoch => {
        const poolData = epoch.pools.find(p => p.poolName === poolName);
        dataPoint[`epoch${epoch.epoch}`] = poolData ? poolData.reward : 0;
      });
      
      return dataPoint;
    });
    
    return chartData;
  }
  
  // Generate chart colors
  function generateChartColors(count) {
    const colors = [
      '#FF9F43', // Orange
      '#00CFE8', // Cyan
      '#EA5455', // Red
      '#28C76F', // Green
      '#F3FF69', // Yellow (Stryke brand color)
      '#9C8DF0', // Purple
      '#FF9FF3', // Pink
      '#5EFCE8', // Teal
      '#FFF5BA', // Light yellow
      '#B4F8C8'  // Light green
    ];
    
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(colors[i % colors.length]);
    }
    
    return result;
  }
  
  // Load the historical rewards chart
  async function loadHistoricalRewardsChart() {
    const chartContainer = document.getElementById('historical-rewards-chart');
    const loadingElement = document.getElementById('historical-rewards-loading');
    const errorElement = document.getElementById('historical-rewards-error');
    
    // Show loading state
    loadingElement.classList.remove('hidden');
    chartContainer.classList.add('hidden');
    errorElement.classList.add('hidden');
    
    try {
      // Fetch historical data
      const historicalData = await fetchHistoricalEpochData();
      
      if (historicalData.length === 0) {
        loadingElement.classList.add('hidden');
        errorElement.classList.remove('hidden');
        errorElement.textContent = 'No historical data available yet';
        return;
      }
      
      // Get the chart container dimensions
      const containerWidth = chartContainer.clientWidth;
      
      // Transform data for the chart
      const chartData = transformDataForChart(historicalData);
      
      // Extract epoch numbers for chart configuration
      const epochs = historicalData.map(data => data.epoch);
      
      // Show the chart container
      loadingElement.classList.add('hidden');
      chartContainer.classList.remove('hidden');
      
      // Render the chart using Chart.js
      renderBarChart(chartContainer, chartData, epochs);
      
    } catch (error) {
      console.error('Error loading historical chart:', error);
      loadingElement.classList.add('hidden');
      errorElement.classList.remove('hidden');
      errorElement.textContent = 'Error loading chart: ' + error.message;
    }
  }
  
  // Render bar chart using Chart.js
  function renderBarChart(container, data, epochs) {
    // Clear any existing chart
    container.innerHTML = '';
    
    // Create canvas element for Chart.js
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    // Prepare datasets for Chart.js
    const datasets = epochs.map((epoch, index) => {
      const colors = generateChartColors(epochs.length);
      return {
        label: `Epoch ${epoch}`,
        data: data.map(item => item[`epoch${epoch}`]),
        backgroundColor: colors[index % colors.length]
      };
    });
    
    // Create the chart
    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: data.map(item => item.name),
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#fff'
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${parseFloat(context.raw).toFixed(4)}`;
              }
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#fff'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          y: {
            ticks: {
              color: '#fff'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            title: {
              display: true,
              text: 'Rewards Amount',
              color: '#fff'
            }
          }
        }
      }
    });
    
    return chart;
  }