// test-stryke-api.js
// This script tests the Stryke API and logs the response structure

const axios = require('axios');
const fs = require('fs');

async function testStrykeApi() {
  console.log('Testing Stryke API endpoint...');
  console.log('URL: https://api.stryke.xyz/v1.1/clamm/option-markets?chains=42161');
  
  try {
    console.log('Making API request...');
    const response = await axios.get('https://api.stryke.xyz/v1.1/clamm/option-markets?chains=42161', {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n=== API RESPONSE STATUS ===');
    console.log(`Status: ${response.status}`);
    console.log(`Status Text: ${response.statusText}`);
    
    console.log('\n=== API RESPONSE HEADERS ===');
    console.log(JSON.stringify(response.headers, null, 2));
    
    console.log('\n=== API RESPONSE DATA OVERVIEW ===');
    
    // Log general data structure
    const data = response.data;
    console.log(`Response type: ${typeof data}`);
    
    if (typeof data === 'object') {
      console.log(`Top-level keys: ${Object.keys(data).join(', ')}`);
      
      // Check if markets array exists
      if (data.markets && Array.isArray(data.markets)) {
        console.log(`Total markets: ${data.markets.length}`);
        
        // Log first market as example
        if (data.markets.length > 0) {
          console.log('\n=== SAMPLE MARKET DATA (First Item) ===');
          console.log(JSON.stringify(data.markets[0], null, 2));
          
          // Extract and print specific fields we're interested in
          console.log('\n=== RELEVANT FIELDS ===');
          
          // Count markets with each field
          const fieldCounts = {
            name: 0,
            symbol: 0,
            pair: 0,
            openInterest: 0,
            totalLiquidity: 0,
            volume24h: 0,
            volume: 0,
            notionalValue: 0,
            tvl: 0,
            liquidity: 0
          };
          
          // Track which fields are present in each market
          data.markets.forEach(market => {
            Object.keys(fieldCounts).forEach(field => {
              if (market[field] !== undefined) {
                fieldCounts[field]++;
              }
            });
          });
          
          console.log('Field availability in markets:');
          Object.entries(fieldCounts).forEach(([field, count]) => {
            console.log(`${field}: ${count}/${data.markets.length} markets (${(count/data.markets.length*100).toFixed(1)}%)`);
          });
          
          // Summarize key metrics
          console.log('\n=== GLOBAL METRICS ===');
          calculateGlobalMetrics(data.markets);
        }
      } else {
        console.log('No markets array found in the response');
        console.log('Full response:', JSON.stringify(data, null, 2));
      }
      
      // Save the full response to a file for further analysis
      fs.writeFileSync('stryke-api-response.json', JSON.stringify(data, null, 2));
      console.log('\nFull response saved to stryke-api-response.json');
    }
  } catch (error) {
    console.error('\n=== API REQUEST ERROR ===');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`Status: ${error.response.status}`);
      console.error(`Headers: ${JSON.stringify(error.response.headers, null, 2)}`);
      console.error(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
      console.error(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
    console.error('Error config:', error.config);
  }
}

// Function to calculate global metrics similar to the web app
function calculateGlobalMetrics(markets) {
  let totalNotional = 0;
  let totalOpenInterest = 0;
  let totalLiquidity = 0;
  let totalVolume24h = 0;
  let longPositions = 0;
  let shortPositions = 0;
  
  markets.forEach(market => {
    // Notional value
    if (market.notionalValue) totalNotional += parseFloat(market.notionalValue) || 0;
    
    // Open Interest
    if (market.openInterest) totalOpenInterest += parseFloat(market.openInterest) || 0;
    else if (market.stats && market.stats.openInterest) totalOpenInterest += parseFloat(market.stats.openInterest) || 0;
    
    // Liquidity
    if (market.totalLiquidity) totalLiquidity += parseFloat(market.totalLiquidity) || 0;
    else if (market.liquidity) totalLiquidity += parseFloat(market.liquidity) || 0;
    else if (market.tvl) totalLiquidity += parseFloat(market.tvl) || 0;
    
    // Volume
    if (market.volume24h) totalVolume24h += parseFloat(market.volume24h) || 0;
    else if (market.volume) totalVolume24h += parseFloat(market.volume) || 0;
    
    // Count positions
    if (market.callOptions && market.callOptions.count) longPositions += parseInt(market.callOptions.count) || 0;
    if (market.putOptions && market.putOptions.count) shortPositions += parseInt(market.putOptions.count) || 0;
  });
  
  // Calculate global bias
  const totalPositions = longPositions + shortPositions;
  const biasRatio = totalPositions > 0 ? ((longPositions - shortPositions) / totalPositions) : 0;
  const biasPercentage = Math.abs(biasRatio * 100).toFixed(2);
  
  // Determine bias direction
  let biasDirection = 'Neutral';
  if (biasRatio > 0.05) biasDirection = 'Long';
  else if (biasRatio < -0.05) biasDirection = 'Short';
  
  console.log(`Total Notional: $${formatNumber(totalNotional)}`);
  console.log(`Total Open Interest: $${formatNumber(totalOpenInterest)}`);
  console.log(`Total Liquidity: $${formatNumber(totalLiquidity)}`);
  console.log(`24h Volume: $${formatNumber(totalVolume24h)}`);
  console.log(`Long Positions: ${formatNumber(longPositions)}`);
  console.log(`Short Positions: ${formatNumber(shortPositions)}`);
  console.log(`Global Bias: ${biasDirection} ${biasPercentage}%`);
  
  // List top 5 markets by volume
  console.log('\n=== TOP MARKETS BY VOLUME ===');
  const sortedMarkets = [...markets].sort((a, b) => {
    const volumeA = parseFloat(a.volume24h || a.volume || 0);
    const volumeB = parseFloat(b.volume24h || b.volume || 0);
    return volumeB - volumeA;
  });
  
  sortedMarkets.slice(0, 5).forEach((market, index) => {
    const marketName = market.name || market.symbol || market.pair || 'Unknown';
    const marketVolume = parseFloat(market.volume24h || market.volume || 0);
    console.log(`${index + 1}. ${marketName}: $${formatNumber(marketVolume)}`);
  });
}

// Format number with commas
function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

// Run the test
testStrykeApi();