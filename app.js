// app.js - Express.js version of the application
const express = require('express');
const { ethers } = require('ethers');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

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

// Replace the hard-coded minimal ABI with the full ABI
const contractAbi = [
  {"inputs":[{"internalType":"address","name":"authority","type":"address"}],"name":"AccessManagedInvalidAuthority","type":"error"},
  {"inputs":[{"internalType":"address","name":"caller","type":"address"},{"internalType":"uint32","name":"delay","type":"uint32"}],"name":"AccessManagedRequiredDelay","type":"error"},
  {"inputs":[{"internalType":"address","name":"caller","type":"address"}],"name":"AccessManagedUnauthorized","type":"error"},
  {"inputs":[{"internalType":"address","name":"target","type":"address"}],"name":"AddressEmptyCode","type":"error"},
  {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"AddressInsufficientBalance","type":"error"},
  {"inputs":[{"internalType":"address","name":"implementation","type":"address"}],"name":"ERC1967InvalidImplementation","type":"error"},
  {"inputs":[],"name":"ERC1967NonPayable","type":"error"},
  {"inputs":[],"name":"FailedInnerCall","type":"error"},
  {"inputs":[],"name":"GaugeController_EpochActive","type":"error"},
  {"inputs":[],"name":"GaugeController_EpochNotFinalized","type":"error"},
  {"inputs":[],"name":"GaugeController_GaugeAlreadyAdded","type":"error"},
  {"inputs":[],"name":"GaugeController_GaugeNotFound","type":"error"},
  {"inputs":[],"name":"GaugeController_IncorrectEpoch","type":"error"},
  {"inputs":[],"name":"GaugeController_InvalidGauge","type":"error"},
  {"inputs":[],"name":"GaugeController_NotEnoughPowerAvailable","type":"error"},
  {"inputs":[],"name":"GaugeController_NotEnoughRewardAvailable","type":"error"},
  {"inputs":[],"name":"GaugeController_NotGauge","type":"error"},
  {"inputs":[],"name":"GaugeController_RewardAlreadyPulled","type":"error"},
  {"inputs":[],"name":"InvalidInitialization","type":"error"},
  {"inputs":[],"name":"NotInitializing","type":"error"},
  {"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"SafeERC20FailedOperation","type":"error"},
  {"inputs":[],"name":"UUPSUnauthorizedCallContext","type":"error"},
  {"inputs":[{"internalType":"bytes32","name":"slot","type":"bytes32"}],"name":"UUPSUnsupportedProxiableUUID","type":"error"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"authority","type":"address"}],"name":"AuthorityUpdated","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"bridgeAdapter","type":"address"},{"indexed":false,"internalType":"bool","name":"add","type":"bool"}],"name":"BridgeAdapterUpdated","type":"event"},
  {"anonymous":false,"inputs":[{"components":[{"internalType":"uint256","name":"chainId","type":"uint256"},{"internalType":"uint256","name":"baseReward","type":"uint256"},{"internalType":"uint8","name":"gaugeType","type":"uint8"},{"internalType":"address","name":"gaugeAddress","type":"address"}],"indexed":false,"internalType":"struct GaugeInfo","name":"gaugeInfo","type":"tuple"}],"name":"GaugeAdded","type":"event"},
  {"anonymous":false,"inputs":[{"components":[{"internalType":"uint256","name":"chainId","type":"uint256"},{"internalType":"uint256","name":"baseReward","type":"uint256"},{"internalType":"uint8","name":"gaugeType","type":"uint8"},{"internalType":"address","name":"gaugeAddress","type":"address"}],"indexed":false,"internalType":"struct GaugeInfo","name":"gaugeInfo","type":"tuple"}],"name":"GaugeRemoved","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint64","name":"version","type":"uint64"}],"name":"Initialized","type":"event"},
  {"anonymous":false,"inputs":[{"components":[{"internalType":"uint256","name":"epoch","type":"uint256"},{"internalType":"bytes32","name":"gaugeId","type":"bytes32"},{"internalType":"address","name":"gaugeAddress","type":"address"}],"indexed":false,"internalType":"struct PullParams","name":"pullParams","type":"tuple"},{"indexed":false,"internalType":"uint256","name":"reward","type":"uint256"}],"name":"RewardPulled","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"totalRewardsPerEpoch","type":"uint256"}],"name":"SetTotalRewardsPerEpoch","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"implementation","type":"address"}],"name":"Upgraded","type":"event"},
  {"anonymous":false,"inputs":[{"components":[{"internalType":"uint256","name":"power","type":"uint256"},{"internalType":"uint256","name":"totalPower","type":"uint256"},{"internalType":"uint256","name":"epoch","type":"uint256"},{"internalType":"bytes32","name":"gaugeId","type":"bytes32"},{"internalType":"bytes32","name":"accountId","type":"bytes32"}],"indexed":false,"internalType":"struct VoteParams","name":"voteParams","type":"tuple"}],"name":"Voted","type":"event"},
  {"inputs":[],"name":"EPOCH_LENGTH","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"UPGRADE_INTERFACE_VERSION","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"accountPowerUsedPerEpoch","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"components":[{"internalType":"uint256","name":"chainId","type":"uint256"},{"internalType":"uint256","name":"baseReward","type":"uint256"},{"internalType":"uint8","name":"gaugeType","type":"uint8"},{"internalType":"address","name":"gaugeAddress","type":"address"}],"internalType":"struct GaugeInfo","name":"_gaugeInfo","type":"tuple"}],"name":"addGauge","outputs":[{"internalType":"bytes32","name":"id","type":"bytes32"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"authority","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"bridgeAdapters","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"bytes32","name":"_id","type":"bytes32"},{"internalType":"uint256","name":"_epoch","type":"uint256"}],"name":"computeRewards","outputs":[{"internalType":"uint256","name":"reward","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"epoch","outputs":[{"internalType":"uint256","name":"_epoch","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"epochFinalized","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_epoch","type":"uint256"}],"name":"finalizeEpoch","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"gaugePowersPerEpoch","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"gauges","outputs":[{"internalType":"uint256","name":"chainId","type":"uint256"},{"internalType":"uint256","name":"baseReward","type":"uint256"},{"internalType":"uint8","name":"gaugeType","type":"uint8"},{"internalType":"address","name":"gaugeAddress","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"genesis","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"_syk","type":"address"},{"internalType":"address","name":"_xSyk","type":"address"},{"internalType":"address","name":"_xSykStaking","type":"address"},{"internalType":"address","name":"_initialAuthority","type":"address"}],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"isConsumingScheduledOp","outputs":[{"internalType":"bytes4","name":"","type":"bytes4"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"proxiableUUID","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"components":[{"internalType":"uint256","name":"epoch","type":"uint256"},{"internalType":"bytes32","name":"gaugeId","type":"bytes32"},{"internalType":"address","name":"gaugeAddress","type":"address"}],"internalType":"struct PullParams","name":"_pullParams","type":"tuple"}],"name":"pull","outputs":[{"internalType":"uint256","name":"reward","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"bytes32","name":"_gaugeId","type":"bytes32"}],"name":"removeGauge","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"newAuthority","type":"address"}],"name":"setAuthority","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_genesis","type":"uint256"}],"name":"setGenesis","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_totalRewardPerEpoch","type":"uint256"}],"name":"setTotalRewardPerEpoch","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"syk","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"totalBaseReward","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"totalBaseRewardPerEpoch","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"totalPowerUsedPerEpoch","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"totalReward","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"totalRewardPerEpoch","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"totalVoteableReward","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"totalVoteableRewardPerEpoch","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"_bridgeAdapter","type":"address"},{"internalType":"bool","name":"_add","type":"bool"}],"name":"updateBridgeAdapter","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"_xSykStaking","type":"address"}],"name":"updateXSykStaking","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"newImplementation","type":"address"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"upgradeToAndCall","outputs":[],"stateMutability":"payable","type":"function"},
  {"inputs":[{"components":[{"internalType":"uint256","name":"power","type":"uint256"},{"internalType":"uint256","name":"totalPower","type":"uint256"},{"internalType":"uint256","name":"epoch","type":"uint256"},{"internalType":"bytes32","name":"gaugeId","type":"bytes32"},{"internalType":"bytes32","name":"accountId","type":"bytes32"}],"internalType":"struct VoteParams","name":"_voteParams","type":"tuple"}],"name":"vote","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"xSyk","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"xSykStaking","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}
];

// Configuration with hardcoded values
const config = {
  rpcUrl: process.env.RPC_URL || 'https://arb1.arbitrum.io/rpc',
  contractAddress: process.env.CONTRACT_ADDRESS || '0x82C13fCab02A168F06E12373F9e5D2C2Bd47e399',
  contractAbi: contractAbi,
  predefinedInputs: {
    poolIds: [
      "0x02d1dc927ecebd87407e1a58a6f2d81f0d6c0ade72ac926e865310aa482b893a", 
      "0x726dd6a67a7c5b399e0e6954596d6b01605ec97e34e75f5547416146ec001a6c",
      "0x74b6b9b1267a0a12d24cfa963f1a3c96aae2f2cd870847cbc9a70c46b7803ae1",
      "0xbb8c79b0fc39426b2cf4bb42501aaa2bdcc7a72f86a564d44a42c6385496618d",
      "0x36ff4f3050b6a776353d7d160276dcf6b310a658502e226fdd2fa049e6c603dd"
    ],
    poolNames: [
      "PancankeSwap WETH",
      "PancakeSwap WBTC", 
      "OrangeFinance PCS WETH", 
      "OrangeFinance PCS WBTC", 
      "OrangeFinance PCS ARB"
    ]
  }
};

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

// Serve HTML page
app.get('/', (req, res) => {
  const htmlFilePath = path.join(__dirname, 'public', 'index.html');
  
  // Check if the file exists in the public directory
  if (fs.existsSync(htmlFilePath)) {
    res.sendFile(htmlFilePath);
  } else {
    // If not, serve the embedded HTML
    res.send(getIndexHtml());
  }
});

// Static files (if any)
app.use(express.static(path.join(__dirname, 'public')));

// API route for a single pool reward
app.post('/api/rewards', async (req, res) => {
  const { poolId, epoch } = req.body;
  
  if (!poolId) {
    return res.status(400).json({ success: false, error: 'Pool ID is required' });
  }
  
  if (!epoch && epoch !== '0') {
    return res.status(400).json({ success: false, error: 'Epoch is required' });
  }
  
  try {
    // Set up provider and contract
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    const contract = new ethers.Contract(
      config.contractAddress,
      config.contractAbi,
      provider
    );
    
    // Call computeRewards function
    const result = await contract.computeRewards(poolId, ethers.getBigInt(epoch));
    
    // Format the result
    const formattedResult = result.toString();
    
    // Format value (divide by 1e18)
    let formattedValue = "N/A";
    if (!isNaN(formattedResult.replace(/,/g, ''))) {
      const numericResult = parseFloat(formattedResult.replace(/,/g, ''));
      formattedValue = (numericResult / 1e18).toFixed(6);
    }
    
    // Get pool name
    const poolIndex = config.predefinedInputs.poolIds.indexOf(poolId);
    const poolName = poolIndex !== -1 
      ? config.predefinedInputs.poolNames[poolIndex] 
      : "Custom Pool";
    
    res.status(200).json({ 
      success: true, 
      results: [{ 
        poolName, 
        poolId, 
        result: formattedResult,
        formattedValue,
        error: null
      }]
    });
  } catch (error) {
    console.error('Error calling contract:', error);
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

// Function to get the HTML content
function getIndexHtml() {
  return `
<!DOCTYPE html>
<html>
<head>
    <title>Stryke Contract Rewards</title>
    <style>
        body { 
            font-family: Arial; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
            background: #1c1c1c;
            color: #fff;
        }
        select, input, button { 
            padding: 8px; 
            margin: 5px 0; 
            width: 100%;
            background: #333;
            color: #fff;
            border: 1px solid #555;
        }
        button {
            background: #f3ff69;
            color: #000;
            cursor: pointer;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
        }
        th, td { 
            border: 1px solid #444; 
            padding: 8px; 
            text-align: left;
        }
        .hidden { display: none; }
    </style>
</head>
<body>
    <h1>Stryke Rewards Lookup</h1>
    <div>
        <select id="poolSelect">
            <option value="">Select a pool...</option>
            <option value="0x02d1dc927ecebd87407e1a58a6f2d81f0d6c0ade72ac926e865310aa482b893a">PancakeSwap WETH</option>
            <option value="0x726dd6a67a7c5b399e0e6954596d6b01605ec97e34e75f5547416146ec001a6c">PancakeSwap WBTC</option>
            <option value="0x74b6b9b1267a0a12d24cfa963f1a3c96aae2f2cd870847cbc9a70c46b7803ae1">OrangeFinance PCS WETH</option>
            <option value="0xbb8c79b0fc39426b2cf4bb42501aaa2bdcc7a72f86a564d44a42c6385496618d">OrangeFinance PCS WBTC</option>
            <option value="0x36ff4f3050b6a776353d7d160276dcf6b310a658502e226fdd2fa049e6c603dd">OrangeFinance PCS ARB</option>
            <option value="all">All Pools</option>
        </select>
        <input type="number" id="epochInput" placeholder="Enter epoch number" min="0">
        <button onclick="lookupRewards()">Lookup Rewards</button>
    </div>
    <div id="error" style="color: red; margin-top: 10px;"></div>
    <div id="loading" class="hidden">Loading...</div>
    <div id="results" class="hidden">
        <h2>Results</h2>
        <table>
            <thead>
                <tr>
                    <th>Pool</th>
                    <th>Rewards</th>
                </tr>
            </thead>
            <tbody id="resultsBody"></tbody>
        </table>
    </div>

    <script>
        async function lookupRewards() {
            const poolId = document.getElementById('poolSelect').value;
            const epoch = document.getElementById('epochInput').value;
            
            if (!poolId) {
                showError('Please select a pool');
                return;
            }
            
            if (!epoch && epoch !== '0') {
                showError('Please enter an epoch number');
                return;
            }
            
            // Hide errors, show loading
            document.getElementById('error').textContent = '';
            document.getElementById('loading').classList.remove('hidden');
            document.getElementById('results').classList.add('hidden');
            
            try {
                let response;
                
                if (poolId === 'all') {
                    response = await fetch('/api/all-pools', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ epoch })
                    });
                } else {
                    response = await fetch('/api/rewards', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ poolId, epoch })
                    });
                }
                
                const data = await response.json();
                
                if (data.success) {
                    displayResults(data.results);
                } else {
                    showError(data.error || 'Failed to fetch rewards');
                }
            } catch (error) {
                showError('Error: ' + error.message);
            } finally {
                document.getElementById('loading').classList.add('hidden');
            }
        }
        
        function displayResults(results) {
            const tbody = document.getElementById('resultsBody');
            tbody.innerHTML = '';
            
            results.forEach(result => {
                const row = document.createElement('tr');
                
                const poolCell = document.createElement('td');
                poolCell.textContent = result.poolName;
                row.appendChild(poolCell);
                
                const rewardCell = document.createElement('td');
                rewardCell.textContent = result.formattedValue;
                row.appendChild(rewardCell);
                
                tbody.appendChild(row);
            });
            
            document.getElementById('results').classList.remove('hidden');
        }
        
        function showError(message) {
            document.getElementById('error').textContent = message;
        }
    </script>
</body>
</html>
  `;
}

// Start the server if running directly (not as a module)
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Open http://localhost:${port} in your browser`);
  });
}

// Export for Vercel
module.exports = app;