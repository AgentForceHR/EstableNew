const { ethers } = require('hardhat');

const REBALANCE_MANAGER_ADDRESS = process.env.REBALANCE_MANAGER_ADDRESS || '';

const TARGET_ALLOCATIONS = {
  sparkUSDC: 4000,
  steakhouseUSDT: 3000,
  sDAI: 3000
};

async function checkRebalanceNeeded() {
  console.log('🔍 Checking if rebalancing is needed...\n');

  const rebalanceManager = await ethers.getContractAt(
    'RebalanceManager',
    REBALANCE_MANAGER_ADDRESS
  );

  const needsRebalance = await rebalanceManager.needsRebalancing();

  if (!needsRebalance) {
    console.log('✅ No rebalancing needed at this time');
    return false;
  }

  console.log('⚠️  Rebalancing threshold exceeded');
  return true;
}

async function executeRebalance() {
  console.log('🔄 Executing rebalance...\n');

  const [signer] = await ethers.getSigners();
  console.log('Executor:', signer.address);

  const rebalanceManager = await ethers.getContractAt(
    'RebalanceManager',
    REBALANCE_MANAGER_ADDRESS
  );

  const strategies = await rebalanceManager.getStrategies();

  let totalValue = ethers.BigNumber.from(0);
  for (let i = 0; i < strategies.length; i++) {
    const vault = await ethers.getContractAt('MorphoVault', strategies[i].vaultAddress);
    const vaultValue = await vault.totalAssets();
    totalValue = totalValue.add(vaultValue);

    console.log(`Vault ${i}: ${ethers.utils.formatUnits(vaultValue, 6)} USDC/USDT`);
  }

  console.log(`\nTotal Value: ${ethers.utils.formatUnits(totalValue, 6)} USD\n`);

  console.log('Target Allocations:');
  console.log(`  - Spark USDC: 40% (${TARGET_ALLOCATIONS.sparkUSDC} bps)`);
  console.log(`  - Steakhouse USDT: 30% (${TARGET_ALLOCATIONS.steakhouseUSDT} bps)`);
  console.log(`  - sDAI: 30% (${TARGET_ALLOCATIONS.sDAI} bps)\n`);

  const tx = await rebalanceManager.executeRebalance(totalValue);
  const receipt = await tx.wait();

  console.log('✅ Rebalancing completed!');
  console.log('Transaction:', receipt.transactionHash);
  console.log('Gas used:', receipt.gasUsed.toString());
  console.log('Block:', receipt.blockNumber, '\n');

  return receipt;
}

async function captureArbitrage(amount) {
  console.log('💰 Capturing MEV/Arbitrage opportunity...\n');

  const rebalanceManager = await ethers.getContractAt(
    'RebalanceManager',
    REBALANCE_MANAGER_ADDRESS
  );

  const tx = await rebalanceManager.captureMev(amount);
  await tx.wait();

  console.log(`✅ Captured ${ethers.utils.formatUnits(amount, 6)} USD in MEV\n`);
}

async function main() {
  try {
    const needsRebalance = await checkRebalanceNeeded();

    if (needsRebalance) {
      await executeRebalance();
    }

    console.log('📊 Rebalance check completed\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = {
  checkRebalanceNeeded,
  executeRebalance,
  captureArbitrage
};
