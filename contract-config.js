// contract-config.js - Configuration and ABI for the Stryke contract

// Contract ABI
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
  
  // Configuration with predefined values - creating it after contractAbi is defined
  const config = {
    rpcUrl: process.env.RPC_URL || 'https://arb1.arbitrum.io/rpc',
    contractAddress: process.env.CONTRACT_ADDRESS || '0x82C13fCab02A168F06E12373F9e5D2C2Bd47e399',
    contractAbi, // Using the ABI defined above
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
  
  // Export the configuration and ABI for use in other files
  module.exports = {
    contractAbi,
    config
  };