// app.js - Express.js version of the application
const express = require('express');
const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import the contract configuration and ABI from the external file
const { config, contractAbi } = require('./contract-config');

const app = express();
const port = process.env.PORT || 3000;

// Middleware for parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Function to extract and log all read functions from the ABI
function printReadFunctions() {
  console.log('=== READ FUNCTIONS FROM CONTRACT ABI ===');
  
  // Filter the ABI to only include view functions (read functions)
  const readFunctions = contractAbi.filter(item => 
    item.type === 'function' && item.stateMutability === 'view'
  );
  
  // Print each read function with its inputs and outputs
  readFunctions.forEach((func, index) => {
    // Format the function signature
    let signature = `${func.name}(`;
    
    // Add input parameters
    if (func.inputs && func.inputs.length > 0) {
      signature += func.inputs.map(input => {
        return `${input.type} ${input.name || ''}`.trim();
      }).join(', ');
    }
    
    signature += ')';
    
    // Add output types
    if (func.outputs && func.outputs.length > 0) {
      const outputTypes = func.outputs.map(output => output.type).join(', ');
      signature += ` returns (${outputTypes})`;
    }
    
    console.log(`${index + 1}. ${signature}`);
    
    // Print more details about inputs if they exist
    if (func.inputs && func.inputs.length > 0) {
      console.log('   Inputs:');
      func.inputs.forEach((input, i) => {
        console.log(`     ${i + 1}. ${input.type} ${input.name || ''}`);
      });
    }
    
    // Print more details about outputs if they exist
    if (func.outputs && func.outputs.length > 0) {
      console.log('   Outputs:');
      func.outputs.forEach((output, i) => {
        console.log(`     ${i + 1}. ${output.type} ${output.name || ''}`);
      });
    }
    
    console.log(''); // Add a blank line for readability
  });
  
  console.log(`Total read functions: ${readFunctions.length}`);
  console.log('=====================================');
  
  return readFunctions;
}

// Try to load ABI from file if exists
try {
  if (fs.existsSync(path.join(__dirname, 'contract-abi.json'))) {
    const abiJson = fs.readFileSync(path.join(__dirname, 'contract-abi.json'), 'utf8');
    config.contractAbi = JSON.parse(abiJson);
    console.log('Loaded contract ABI from file');
  } else {
    console.log('Using default contractAbi');
  }
} catch (error) {
  console.log('Error loading ABI file, using default ABI');
}

// Call the function to print read functions when the app starts
const readFunctions = printReadFunctions();

// Process function call for all pool IDs
async function processAllPoolIds(epochValue) {
  const results = [];
  console.log(`Processing ${config.predefinedInputs.poolIds.length} predefined pool IDs with epoch = ${epochValue}`);
  
  try {
    // Format input2
    const formattedEpoch = ethers.getBigInt(epochValue);
    
    // Set up provider and contract
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    const contract = new ethers.Contract(
      config.contractAddress,
      config.contractAbi,
      provider
    );
    
    // Process each predefined pool ID with the same epoch
    for (let i = 0; i < config.predefinedInputs.poolIds.length; i++) {
      const poolId = config.predefinedInputs.poolIds[i];
      const poolName = config.predefinedInputs.poolNames[i] || `Pool ${i + 1}`;
      
      console.log(`Processing ${poolName} with ID: ${poolId}`);
      
      try {
        // Call the function with the two inputs
        const result = await contract.computeRewards(poolId, formattedEpoch);
        
        // Format the result
        const formattedResult = result.toString();
        
        // Create formatted value (divided by 1e18)
        let formattedValue = "N/A";
        try {
          if (!isNaN(formattedResult.replace(/,/g, ''))) {
            const numericResult = parseFloat(formattedResult.replace(/,/g, ''));
            formattedValue = (numericResult / 1e18).toString();
            
            // Format with 6 decimal places
            if (formattedValue.includes('.')) {
              const parts = formattedValue.split('.');
              if (parts[1].length > 6) {
                formattedValue = `${parts[0]}.${parts[1].substring(0, 6)}`;
              }
            }
          }
        } catch (error) {
          console.log(`Error formatting result: ${error.message}`);
        }
        
        results.push({ 
          poolName, 
          poolId, 
          result: formattedResult,
          formattedValue,
          error: null 
        });
      } catch (error) {
        console.error(`Error processing ${poolName}: ${error.message}`);
        results.push({ 
          poolName, 
          poolId, 
          result: null,
          formattedValue: null,
          error: error.message 
        });
      }
    }
  } catch (error) {
    console.error(`Error in processAllPoolIds: ${error.message}`);
    throw error;
  }
  
  return { success: true, results };
}

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// API route for rewards lookup
app.post('/api/rewards', async (req, res) => {
  const { poolId, epoch } = req.body;
  
  if (!poolId) {
    return res.status(400).json({ success: false, error: 'Pool ID is required' });
  }
  
  if (!epoch && epoch !== '0') {
    return res.status(400).json({ success: false, error: 'Epoch is required' });
  }
  
  try {
    // Format inputs
    const formattedEpoch = ethers.getBigInt(epoch);
    
    // Set up provider and contract
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    const contract = new ethers.Contract(
      config.contractAddress,
      config.contractAbi,
      provider
    );
    
    // Find pool name
    const poolIndex = config.predefinedInputs.poolIds.indexOf(poolId);
    const poolName = poolIndex >= 0 ? config.predefinedInputs.poolNames[poolIndex] : 'Custom Pool';
    
    // Call the function with the two inputs
    const result = await contract.computeRewards(poolId, formattedEpoch);
    
    // Format the result
    const formattedResult = result.toString();
    
    // Create formatted value (divided by 1e18)
    let formattedValue = formattedResult;
    try {
      if (!isNaN(formattedResult.replace(/,/g, ''))) {
        const numericResult = parseFloat(formattedResult.replace(/,/g, ''));
        formattedValue = (numericResult / 1e18).toFixed(6);
      }
    } catch (error) {
      console.log(`Error formatting result: ${error.message}`);
    }
    
    res.status(200).json({ 
      success: true, 
      results: [{ 
        poolName, 
        poolId, 
        result: formattedResult,
        formattedValue 
      }] 
    });
  } catch (error) {
    console.error('Error processing rewards:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API route for all pools
app.post('/api/all-pools', async (req, res) => {
  const { epoch } = req.body;
  
  if (!epoch && epoch !== '0') {
    return res.status(400).json({ success: false, error: 'Epoch is required' });
  }
  
  try {
    const result = await processAllPoolIds(epoch);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error processing all pools:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add a new API route for general contract function calls
app.post('/api/contract-call', async (req, res) => {
  const { functionName, params } = req.body;
  
  if (!functionName) {
    return res.status(400).json({ success: false, error: 'Function name is required' });
  }
  
  try {
    // Set up provider and contract
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    const contract = new ethers.Contract(
      config.contractAddress,
      config.contractAbi,
      provider
    );
    
    // Check if the function exists in the contract
    if (typeof contract[functionName] !== 'function') {
      return res.status(400).json({ success: false, error: `Function ${functionName} does not exist` });
    }
    
    // Call the function with the provided parameters
    const result = await contract[functionName](...(params || []));
    
    // Format the result based on its type
    let formattedResult;
    
    if (result === null || result === undefined) {
      formattedResult = 'null';
    } else if (typeof result === 'object') {
      // Handle BigInt values in objects
      formattedResult = JSON.parse(JSON.stringify(result, (key, value) => 
        typeof value === 'bigint' ? value.toString() : value
      ));
    } else if (typeof result === 'bigint') {
      formattedResult = result.toString();
    } else {
      formattedResult = result.toString();
    }
    
    res.status(200).json({ 
      success: true, 
      result: formattedResult
    });
  } catch (error) {
    console.error(`Error calling contract function ${functionName}:`, error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server if running directly (not as a module)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Open http://localhost:${port} in your browser`);
  });
}

// Export for Vercel
module.exports = app;