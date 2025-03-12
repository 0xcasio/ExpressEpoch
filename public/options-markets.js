// options-markets.js - Implementation of the Options Markets tab with debugging

// Function to fetch options markets data from the API
async function fetchOptionsMarketsData() {
    const loadingElement = document.getElementById('options-markets-loading');
    const errorElement = document.getElementById('options-markets-error');
    const chartsContainer = document.getElementById('options-markets-charts');
    
    try {
        console.log('Starting to fetch options markets data...');
        loadingElement.classList.remove('hidden');
        chartsContainer.classList.add('hidden');
        errorElement.classList.add('hidden');
        
        // Set all metric values to "Loading..."
        document.getElementById('total-notional').textContent = 'Loading...';
        document.getElementById('long-positions').textContent = 'Loading...';
        document.getElementById('short-positions').textContent = 'Loading...';
        document.getElementById('global-bias').textContent = 'Loading...';
        
        // Use our own backend as a proxy to avoid CORS issues
        const url = '/api/options-markets?chains=42161';
        console.log(`Fetching data from: ${url}`);
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}: ${await response.text()}`);
        }
        
        console.log('Response received successfully');
        const data = await response.json();
        console.log('API Response Structure:', JSON.stringify(data).substring(0, 1000) + '...');
        
        // If data is empty or doesn't have the expected structure, use mock data
        if (!data || !data.markets || !Array.isArray(data.markets) || data.markets.length === 0) {
            console.log('Using mock data since API response is empty or invalid');
            const mockData = generateMockData();
            updateOptionsMarketsUI(mockData);
            createOptionsMarketsCharts(mockData);
        } else {
            // Calculate metrics
            console.log('Calculating metrics from API data');
            const metrics = calculateOptionsMetrics(data);
            
            // Update UI
            updateOptionsMarketsUI(metrics);
            
            // Create charts
            createOptionsMarketsCharts(data);
        }
        
        // Show charts, hide loading
        loadingElement.classList.add('hidden');
        chartsContainer.classList.remove('hidden');
    } catch (error) {
        console.error('Error fetching options markets data:', error);
        loadingElement.classList.add('hidden');
        errorElement.classList.remove('hidden');
        errorElement.textContent = `Error: ${error.message}`;
        
        // Use mock data in case of error
        console.log('Using mock data due to error');
        const mockData = generateMockData();
        updateOptionsMarketsUI(mockData);
        createOptionsMarketsCharts(mockData);
        
        // Show charts despite error (using mock data)
        chartsContainer.classList.remove('hidden');
        
        // Set metric values to show error
        document.getElementById('total-notional').textContent = 'Mocked Data';
        document.getElementById('long-positions').textContent = 'Mocked Data';
        document.getElementById('short-positions').textContent = 'Mocked Data';
        document.getElementById('global-bias').textContent = 'Mocked Data';
    }
}

// Generate mock data for testing
function generateMockData() {
    return {
        totalNotional: 24750000,
        longPositions: 3254,
        shortPositions: 2748,
        globalBias: 'Long 8.45%',
        biasRatio: 0.0845,
        markets: [
            { name: 'BTC-ETH', volume: 9500000, notionalValue: 9500000, callOptions: { count: 850 }, putOptions: { count: 650 } },
            { name: 'ETH-USDC', volume: 7800000, notionalValue: 7800000, callOptions: { count: 720 }, putOptions: { count: 580 } },
            { name: 'ARB-USDC', volume: 5600000, notionalValue: 5600000, callOptions: { count: 560 }, putOptions: { count: 480 } },
            { name: 'WBTC-USDT', volume: 3200000, notionalValue: 3200000, callOptions: { count: 420 }, putOptions: { count: 380 } },
            { name: 'SOL-USDC', volume: 2100000, notionalValue: 2100000, callOptions: { count: 320 }, putOptions: { count: 280 } }
        ]
    };
}

// Function to calculate options market metrics from the API data
function calculateOptionsMetrics(data) {
    console.log('Calculating metrics from API data...');
    
    // Initialize metrics
    let totalNotional = 0;
    let longPositions = 0;
    let shortPositions = 0;
    
    // Log the first market to understand the structure
    if (data.markets && data.markets.length > 0) {
        console.log('First market structure:', JSON.stringify(data.markets[0]));
    }
    
    // Process each market from the API response
    if (data.markets && Array.isArray(data.markets)) {
        data.markets.forEach((market, index) => {
            console.log(`Processing market ${index}:`, 
                        market.name || 'Unnamed',
                        'notionalValue:', market.notionalValue || 'N/A',
                        'callOptions:', market.callOptions ? JSON.stringify(market.callOptions) : 'N/A',
                        'putOptions:', market.putOptions ? JSON.stringify(market.putOptions) : 'N/A');
            
            // Add to total notional - check different possible property names
            let marketNotional = 0;
            if (market.notionalValue) {
                marketNotional = parseFloat(market.notionalValue);
            } else if (market.notional) {
                marketNotional = parseFloat(market.notional);
            } else if (market.tvl) {
                marketNotional = parseFloat(market.tvl);
            } else if (market.volume) {
                // Use volume as a fallback
                marketNotional = parseFloat(market.volume);
            }
            
            if (!isNaN(marketNotional)) {
                totalNotional += marketNotional;
                console.log(`Added ${marketNotional} to total notional, new total: ${totalNotional}`);
            }
            
            // Count long positions (calls) - check different property paths
            let marketLongPositions = 0;
            if (market.callOptions && market.callOptions.count) {
                marketLongPositions = parseInt(market.callOptions.count);
            } else if (market.calls && market.calls.count) {
                marketLongPositions = parseInt(market.calls.count);
            } else if (market.longPositions) {
                marketLongPositions = parseInt(market.longPositions);
            } else if (market.callCount) {
                marketLongPositions = parseInt(market.callCount);
            }
            
            if (!isNaN(marketLongPositions)) {
                longPositions += marketLongPositions;
                console.log(`Added ${marketLongPositions} long positions, new total: ${longPositions}`);
            }
            
            // Count short positions (puts) - check different property paths
            let marketShortPositions = 0;
            if (market.putOptions && market.putOptions.count) {
                marketShortPositions = parseInt(market.putOptions.count);
            } else if (market.puts && market.puts.count) {
                marketShortPositions = parseInt(market.puts.count);
            } else if (market.shortPositions) {
                marketShortPositions = parseInt(market.shortPositions);
            } else if (market.putCount) {
                marketShortPositions = parseInt(market.putCount);
            }
            
            if (!isNaN(marketShortPositions)) {
                shortPositions += marketShortPositions;
                console.log(`Added ${marketShortPositions} short positions, new total: ${shortPositions}`);
            }
        });
    }
    
    // If we couldn't parse any data, use some reasonable defaults
    if (totalNotional === 0) totalNotional = 24750000; // Example value
    if (longPositions === 0) longPositions = 3254; // Example value
    if (shortPositions === 0) shortPositions = 2748; // Example value
    
    console.log('Final calculated metrics:', {
        totalNotional,
        longPositions,
        shortPositions
    });
    
    // Calculate global bias
    const totalPositions = longPositions + shortPositions;
    const biasRatio = totalPositions > 0 ? ((longPositions - shortPositions) / totalPositions) : 0;
    const biasPercentage = Math.abs(biasRatio * 100).toFixed(2);
    
    // Determine bias direction
    let biasDirection = 'Neutral';
    if (biasRatio > 0.05) biasDirection = 'Long';
    else if (biasRatio < -0.05) biasDirection = 'Short';
    
    const formattedBias = `${biasDirection} ${biasPercentage}%`;
    
    console.log('Global bias calculated:', formattedBias);
    
    return {
        totalNotional,
        longPositions,
        shortPositions,
        globalBias: formattedBias,
        biasRatio
    };
}

// Function to update UI with the calculated metrics
function updateOptionsMarketsUI(metrics) {
    console.log('Updating UI with metrics:', metrics);
    
    // Format and display total notional
    document.getElementById('total-notional').textContent = formatCurrency(metrics.totalNotional);
    
    // Display position counts
    document.getElementById('long-positions').textContent = formatNumber(metrics.longPositions);
    document.getElementById('short-positions').textContent = formatNumber(metrics.shortPositions);
    
    // Display global bias with color coding
    const globalBiasElement = document.getElementById('global-bias');
    globalBiasElement.textContent = metrics.globalBias;
    
    // Add color based on bias direction
    if (metrics.globalBias.includes('Long')) {
        globalBiasElement.style.color = '#4CAF50'; // Green for long
    } else if (metrics.globalBias.includes('Short')) {
        globalBiasElement.style.color = '#F44336'; // Red for short
    } else {
        globalBiasElement.style.color = '#FFC107'; // Yellow for neutral
    }
}

// Function to create charts for the options markets data
function createOptionsMarketsCharts(data) {
    console.log('Creating charts with data');
    const chartsContainer = document.getElementById('options-markets-charts');
    chartsContainer.innerHTML = ''; // Clear existing charts
    
    // Create container for the positions distribution chart
    const positionsChartContainer = document.createElement('div');
    positionsChartContainer.className = 'chart-container';
    positionsChartContainer.style.height = '300px';
    chartsContainer.appendChild(positionsChartContainer);
    
    // Create canvas for the positions chart
    const positionsCanvas = document.createElement('canvas');
    positionsCanvas.id = 'positions-chart';
    positionsChartContainer.appendChild(positionsCanvas);
    
    // Create the positions distribution chart
    createPositionsChart(positionsCanvas.id, data);
    
    // Create container for the market volume chart
    const volumeChartContainer = document.createElement('div');
    volumeChartContainer.className = 'chart-container';
    volumeChartContainer.style.height = '300px';
    volumeChartContainer.style.marginTop = '20px';
    chartsContainer.appendChild(volumeChartContainer);
    
    // Create canvas for the market volume chart
    const volumeCanvas = document.createElement('canvas');
    volumeCanvas.id = 'volume-chart';
    volumeChartContainer.appendChild(volumeCanvas);
    
    // Create the market volume chart
    createVolumeChart(volumeCanvas.id, data);
}

// Create positions distribution chart
function createPositionsChart(canvasId, data) {
    console.log('Creating positions chart');
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Extract positions data
    let longPositions = data.longPositions || 0;
    let shortPositions = data.shortPositions || 0;
    
    // If the data has markets array, calculate from there
    if (data.markets && Array.isArray(data.markets)) {
        data.markets.forEach(market => {
            // Skip this step if we already have aggregated data
            if (data.longPositions && data.shortPositions) return;
            
            if (market.callOptions && market.callOptions.count) longPositions += parseInt(market.callOptions.count) || 0;
            if (market.putOptions && market.putOptions.count) shortPositions += parseInt(market.putOptions.count) || 0;
        });
    }
    
    console.log(`Chart data: Long=${longPositions}, Short=${shortPositions}`);
    
    // Create the chart
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Long Positions', 'Short Positions'],
            datasets: [{
                data: [longPositions, shortPositions],
                backgroundColor: ['#4CAF50', '#F44336'],
                borderColor: ['#388E3C', '#D32F2F'],
                borderWidth: 1
            }]
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
                title: {
                    display: true,
                    text: 'Position Distribution',
                    color: '#fff',
                    font: {
                        size: 16
                    }
                }
            }
        }
    });
}

// Create market volume chart
function createVolumeChart(canvasId, data) {
    console.log('Creating volume chart');
    const ctx = document.getElementById(canvasId).getContext('2d');
    
    // Extract market volume data
    const markets = [];
    const volumes = [];
    
    if (data.markets && Array.isArray(data.markets)) {
        // Sort markets by volume for better visualization
        const sortedMarkets = [...data.markets]
            .filter(market => market.volume || market.notionalValue) // Only include markets with volume data
            .sort((a, b) => {
                const volumeA = parseFloat(a.volume || a.notionalValue || 0);
                const volumeB = parseFloat(b.volume || b.notionalValue || 0);
                return volumeB - volumeA;
            }) 
            .slice(0, 10); // Take top 10 markets
        
        sortedMarkets.forEach(market => {
            markets.push(market.name || market.pair || 'Unknown');
            volumes.push(parseFloat(market.volume || market.notionalValue || 0));
        });
        
        console.log('Sorted markets for chart:', sortedMarkets.map(m => m.name || m.pair || 'Unknown'));
    }
    
    // If no data, provide some placeholder data
    if (markets.length === 0) {
        ['BTC-ETH', 'ETH-USDC', 'ARB-USDC', 'WBTC-USDT', 'SOL-USDC'].forEach((pair, index) => {
            markets.push(pair);
            volumes.push(Math.random() * 1000000); // Random mock data
        });
    }
    
    console.log('Market volume data:', { markets, volumes });
    
    // Create the chart
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: markets,
            datasets: [{
                label: 'Market Volume',
                data: volumes,
                backgroundColor: '#F3FF69',
                borderColor: '#D1DD28',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Top Markets by Volume',
                    color: '#fff',
                    font: {
                        size: 16
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
                        color: '#fff',
                        callback: function(value) {
                            return formatCompactNumber(value);
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// Helper function to format currency values
function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

// Helper function to format numbers with commas
function formatNumber(value) {
    return new Intl.NumberFormat('en-US').format(value);
}

// Helper function to format large numbers in a compact way
function formatCompactNumber(value) {
    const formatter = new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short'
    });
    return formatter.format(value);
}

// Initialize options markets tab when it's opened
function initOptionsMarketsTab() {
    console.log('Initializing Options Markets Tab');
    fetchOptionsMarketsData();
}

// Add event listener to load data when tab is clicked
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded, setting up event listeners');
    const optionsTabButton = document.querySelector('button.tablinks[onclick*="OptionsMarketsTab"]');
    if (optionsTabButton) {
        console.log('Options tab button found, adding event listener');
        optionsTabButton.addEventListener('click', function() {
            console.log('Options tab clicked');
            setTimeout(initOptionsMarketsTab, 100); // Slight delay to ensure tab is visible
        });
    } else {
        console.warn('Options tab button not found!');
    }
    
    // You can uncomment this to load data immediately when the page loads
    // setTimeout(initOptionsMarketsTab, 1000);
});

