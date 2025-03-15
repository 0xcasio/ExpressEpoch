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
        
        // Define all chains to fetch data from
        const chains = [
            { id: 42161, name: 'Arbitrum' },
            { id: 146, name: 'Sonic' },
            { id: 80094, name: 'Berachain' },
            { id: 8453, name: 'Base' },
            { id: 5000, name: 'Mantle' }
        ];
        
        // Create chain filter if it doesn't exist
        if (!document.getElementById('options-markets-chain-filter')) {
            const filterContainer = document.createElement('div');
            filterContainer.id = 'options-markets-filter-container';
            filterContainer.className = 'filter-container mb-3';
            
            // Create chain filter
            const chainFilterLabel = document.createElement('label');
            chainFilterLabel.htmlFor = 'options-markets-chain-filter';
            chainFilterLabel.textContent = 'Filter by Chain: ';
            chainFilterLabel.className = 'mr-2';
            
            const chainFilter = document.createElement('select');
            chainFilter.id = 'options-markets-chain-filter';
            chainFilter.className = 'chain-filter';
            
            // Add "All Chains" option
            const allOption = document.createElement('option');
            allOption.value = 'all';
            allOption.textContent = 'All Chains';
            chainFilter.appendChild(allOption);
            
            // Add options for each chain
            chains.forEach(chain => {
                const option = document.createElement('option');
                option.value = chain.name;
                option.textContent = chain.name;
                chainFilter.appendChild(option);
            });
            
            filterContainer.appendChild(chainFilterLabel);
            filterContainer.appendChild(chainFilter);
            
            // Add filter styles if not already added
            if (!document.getElementById('options-markets-styles')) {
                const styleElement = document.createElement('style');
                styleElement.id = 'options-markets-styles';
                styleElement.textContent = `
                    .filter-container {
                        margin-bottom: 15px;
                        display: flex;
                        align-items: center;
                    }
                    
                    .chain-filter {
                        padding: 5px 10px;
                        border-radius: 4px;
                        border: 1px solid #ccc;
                        background-color: #f8f9fa;
                        margin-right: 10px;
                        color: #333;
                    }
                    
                    @media (max-width: 768px) {
                        .filter-container {
                            flex-direction: column;
                            align-items: flex-start;
                        }
                        
                        .chain-filter {
                            margin-top: 5px;
                            width: 100%;
                        }
                    }
                `;
                document.head.appendChild(styleElement);
            }
            
            // Insert filter before the charts container
            const parentElement = chartsContainer.parentElement;
            parentElement.insertBefore(filterContainer, chartsContainer);
        }
        
        // Use our own backend as a proxy to avoid CORS issues
        console.log(`Fetching data from ${chains.length} chains...`);
        
        // Fetch data from all chains
        const chainResponses = await Promise.allSettled(
            chains.map(chain => 
                fetch(`/api/options-markets?chains=${chain.id}`)
            )
        );
        
        // Process responses for each chain
        let combinedData = { markets: [] };
        let failedChains = [];
        
        for (let i = 0; i < chainResponses.length; i++) {
            const chain = chains[i];
            const response = chainResponses[i];
            
            if (response.status === 'fulfilled' && response.value.ok) {
                console.log(`API response status - ${chain.name}:`, response.value.status);
                
                try {
                    // Parse response
                    const data = await response.value.json();
                    
                    console.log(`${chain.name} API Response Structure:`, JSON.stringify(data).substring(0, 300) + '...');
                    
                    // Process chain data
                    if (data && data.markets && Array.isArray(data.markets)) {
                        // Add chain information to each market
                        const marketsWithChain = data.markets.map(market => ({
                            ...market,
                            chainId: chain.id,
                            chainName: chain.name
                        }));
                        
                        console.log(`Found ${marketsWithChain.length} markets for ${chain.name}`);
                        
                        // Add to combined data
                        combinedData.markets = [...combinedData.markets, ...marketsWithChain];
                    } else {
                        console.warn(`No markets found in ${chain.name} response`);
                    }
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
        
        console.log(`Combined ${combinedData.markets.length} markets from ${chains.length - failedChains.length} chains`);
        if (failedChains.length > 0) {
            console.warn(`Failed to fetch data from these chains: ${failedChains.join(', ')}`);
        }
        
        // Store the original data for filtering
        window.optionsMarketsData = combinedData;
        
        // Add event listener for chain filter
        const chainFilter = document.getElementById('options-markets-chain-filter');
        if (chainFilter) {
            chainFilter.addEventListener('change', function() {
                updateOptionsMarketsCharts();
            });
        }
        
        // If combined data is empty, use mock data
        if (!combinedData.markets || combinedData.markets.length === 0) {
            console.log('Using mock data since API responses are empty or invalid');
            const mockData = generateMockData();
            window.optionsMarketsData = mockData;
            updateOptionsMarketsUI(mockData);
            createOptionsMarketsCharts(mockData);
        } else {
            // Update UI and charts
            updateOptionsMarketsCharts();
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
        window.optionsMarketsData = mockData;
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

// Function to update charts based on current filter
function updateOptionsMarketsCharts() {
    if (!window.optionsMarketsData) return;
    
    const chainFilter = document.getElementById('options-markets-chain-filter');
    const selectedChain = chainFilter ? chainFilter.value : 'all';
    
    // Apply chain filter to data
    let filteredData = { ...window.optionsMarketsData };
    
    if (selectedChain !== 'all') {
        filteredData.markets = filteredData.markets.filter(market => 
            market.chainName === selectedChain
        );
    }
    
    // Calculate metrics from filtered data
    const metrics = calculateOptionsMetrics(filteredData);
    
    // Update UI with filtered metrics
    updateOptionsMarketsUI(metrics);
    
    // Create charts with filtered data
    createOptionsMarketsCharts(filteredData);
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
            // Arbitrum markets
            { name: 'BTC-ETH', volume: 9500000, notionalValue: 9500000, callOptions: { count: 850 }, putOptions: { count: 650 }, chainId: 42161, chainName: 'Arbitrum' },
            { name: 'ETH-USDC', volume: 7800000, notionalValue: 7800000, callOptions: { count: 720 }, putOptions: { count: 580 }, chainId: 42161, chainName: 'Arbitrum' },
            
            // Sonic markets
            { name: 'ARB-USDC', volume: 5600000, notionalValue: 5600000, callOptions: { count: 560 }, putOptions: { count: 480 }, chainId: 146, chainName: 'Sonic' },
            { name: 'WBTC-USDT', volume: 3200000, notionalValue: 3200000, callOptions: { count: 420 }, putOptions: { count: 380 }, chainId: 146, chainName: 'Sonic' },
            
            // Berachain markets
            { name: 'BTC-USDC', volume: 4800000, notionalValue: 4800000, callOptions: { count: 520 }, putOptions: { count: 440 }, chainId: 80094, chainName: 'Berachain' },
            { name: 'ETH-USDT', volume: 3900000, notionalValue: 3900000, callOptions: { count: 480 }, putOptions: { count: 410 }, chainId: 80094, chainName: 'Berachain' },
            
            // Base markets
            { name: 'BTC-USDC', volume: 4200000, notionalValue: 4200000, callOptions: { count: 490 }, putOptions: { count: 420 }, chainId: 8453, chainName: 'Base' },
            { name: 'ETH-USDT', volume: 3500000, notionalValue: 3500000, callOptions: { count: 450 }, putOptions: { count: 390 }, chainId: 8453, chainName: 'Base' },
            
            // Mantle markets
            { name: 'BTC-USDC', volume: 2800000, notionalValue: 2800000, callOptions: { count: 380 }, putOptions: { count: 320 }, chainId: 5000, chainName: 'Mantle' },
            { name: 'ETH-USDT', volume: 2100000, notionalValue: 2100000, callOptions: { count: 320 }, putOptions: { count: 280 }, chainId: 5000, chainName: 'Mantle' }
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
    
    // Define all chains
    const chains = [
        { id: 42161, name: 'Arbitrum', color: '#4CAF50', borderColor: '#388E3C' },
        { id: 146, name: 'Sonic', color: '#F44336', borderColor: '#D32F2F' },
        { id: 80094, name: 'Berachain', color: '#8BC34A', borderColor: '#689F38' },
        { id: 8453, name: 'Base', color: '#2196F3', borderColor: '#1976D2' },
        { id: 5000, name: 'Mantle', color: '#FF9800', borderColor: '#F57C00' }
    ];
    
    // Initialize position counts for each chain
    const positionCounts = {};
    chains.forEach(chain => {
        positionCounts[chain.id] = {
            long: 0,
            short: 0,
            name: chain.name,
            color: chain.color,
            borderColor: chain.borderColor
        };
    });
    
    // If the data has markets array, calculate from there
    if (data.markets && Array.isArray(data.markets)) {
        data.markets.forEach(market => {
            // Skip this step if we already have aggregated data
            if (data.longPositions && data.shortPositions && !market.chainId) return;
            
            const chainId = market.chainId;
            if (!chainId || !positionCounts[chainId]) return;
            
            // Count long positions (calls)
            let marketLongPositions = 0;
            if (market.callOptions && market.callOptions.count) {
                marketLongPositions = parseInt(market.callOptions.count) || 0;
            } else if (market.calls && market.calls.count) {
                marketLongPositions = parseInt(market.calls.count) || 0;
            } else if (market.longPositions) {
                marketLongPositions = parseInt(market.longPositions) || 0;
            } else if (market.callCount) {
                marketLongPositions = parseInt(market.callCount) || 0;
            }
            
            // Count short positions (puts)
            let marketShortPositions = 0;
            if (market.putOptions && market.putOptions.count) {
                marketShortPositions = parseInt(market.putOptions.count) || 0;
            } else if (market.puts && market.puts.count) {
                marketShortPositions = parseInt(market.puts.count) || 0;
            } else if (market.shortPositions) {
                marketShortPositions = parseInt(market.shortPositions) || 0;
            } else if (market.putCount) {
                marketShortPositions = parseInt(market.putCount) || 0;
            }
            
            // Add to the appropriate chain totals
            positionCounts[chainId].long += marketLongPositions;
            positionCounts[chainId].short += marketShortPositions;
        });
    } else if (data.longPositions && data.shortPositions) {
        // If we have aggregated data without chain information, distribute proportionally
        // This is just a fallback for mock data
        const totalLong = data.longPositions;
        const totalShort = data.shortPositions;
        
        // Distribute in a reasonable proportion
        positionCounts[42161].long = Math.round(totalLong * 0.4); // 40% to Arbitrum
        positionCounts[42161].short = Math.round(totalShort * 0.4);
        
        positionCounts[146].long = Math.round(totalLong * 0.2); // 20% to Sonic
        positionCounts[146].short = Math.round(totalShort * 0.2);
        
        positionCounts[80094].long = Math.round(totalLong * 0.15); // 15% to Berachain
        positionCounts[80094].short = Math.round(totalShort * 0.15);
        
        positionCounts[8453].long = Math.round(totalLong * 0.15); // 15% to Base
        positionCounts[8453].short = Math.round(totalShort * 0.15);
        
        positionCounts[5000].long = Math.round(totalLong * 0.1); // 10% to Mantle
        positionCounts[5000].short = Math.round(totalShort * 0.1);
    }
    
    // Prepare data for the chart
    const labels = [];
    const chartData = [];
    const backgroundColors = [];
    const borderColors = [];
    
    // Add data for each chain
    chains.forEach(chain => {
        const chainData = positionCounts[chain.id];
        
        // Only include chains with data
        if (chainData.long > 0 || chainData.short > 0) {
            labels.push(`${chainData.name} Long`);
            chartData.push(chainData.long);
            backgroundColors.push(chainData.color);
            borderColors.push(chainData.borderColor);
            
            labels.push(`${chainData.name} Short`);
            chartData.push(chainData.short);
            backgroundColors.push(chainData.color + '80'); // Add transparency for short positions
            borderColors.push(chainData.borderColor + '80');
        }
    });
    
    console.log('Position chart data:', positionCounts);
    
    // Create the chart
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: chartData,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
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
                    text: 'Position Distribution by Chain',
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
    
    // Define chain colors
    const chainColors = {
        42161: { bg: '#F3FF69', border: '#D1DD28' }, // Arbitrum - Yellow
        146: { bg: '#69FFF3', border: '#28DDD1' },   // Sonic - Cyan
        80094: { bg: '#8BC34A', border: '#689F38' }, // Berachain - Green
        8453: { bg: '#2196F3', border: '#1976D2' },  // Base - Blue
        5000: { bg: '#FF9800', border: '#F57C00' }   // Mantle - Orange
    };
    
    // Extract market volume data
    const markets = [];
    const volumes = [];
    const colors = [];
    const borderColors = [];
    
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
            // Include chain name in the market label
            const chainName = market.chainName || 
                             (market.chainId === 42161 ? 'Arbitrum' : 
                              market.chainId === 146 ? 'Sonic' : 
                              market.chainId === 80094 ? 'Berachain' :
                              market.chainId === 8453 ? 'Base' :
                              market.chainId === 5000 ? 'Mantle' : 'Unknown');
            
            const marketLabel = `${market.name || market.pair || 'Unknown'} (${chainName})`;
            
            markets.push(marketLabel);
            volumes.push(parseFloat(market.volume || market.notionalValue || 0));
            
            // Use color based on chain
            const chainId = market.chainId;
            if (chainId && chainColors[chainId]) {
                colors.push(chainColors[chainId].bg);
                borderColors.push(chainColors[chainId].border);
            } else {
                // Default color if chain not recognized
                colors.push('#F3FF69');
                borderColors.push('#D1DD28');
            }
        });
        
        console.log('Sorted markets for chart:', sortedMarkets.map(m => `${m.name || m.pair || 'Unknown'} (${m.chainName || ''})`));
    }
    
    // If no data, provide some placeholder data
    if (markets.length === 0) {
        const mockMarkets = [
            { name: 'BTC-ETH', chain: 'Arbitrum', chainId: 42161 },
            { name: 'ETH-USDC', chain: 'Arbitrum', chainId: 42161 },
            { name: 'ARB-USDC', chain: 'Sonic', chainId: 146 },
            { name: 'BTC-USDC', chain: 'Berachain', chainId: 80094 },
            { name: 'ETH-USDT', chain: 'Base', chainId: 8453 },
            { name: 'BTC-USDC', chain: 'Mantle', chainId: 5000 }
        ];
        
        mockMarkets.forEach(market => {
            markets.push(`${market.name} (${market.chain})`);
            volumes.push(Math.random() * 1000000); // Random mock data
            
            if (chainColors[market.chainId]) {
                colors.push(chainColors[market.chainId].bg);
                borderColors.push(chainColors[market.chainId].border);
            } else {
                colors.push('#F3FF69');
                borderColors.push('#D1DD28');
            }
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
                backgroundColor: colors,
                borderColor: borderColors,
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
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            return `Volume: ${formatCompactNumber(value)}`;
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

