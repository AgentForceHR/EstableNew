const { ethers } = require('hardhat');

const TREASURY_ADDRESS = '0x9017DE667f3835b3A7cb2D50013F65fC3d408BbE';

const BASE_USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const BASE_USDT_ADDRESS = '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb';
const BASE_DAI_ADDRESS = '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb';

async function main() {
  console.log('🚀 Starting Estable.lat Morpho Blue deployment on Base...\n');

  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);
  console.log('Account balance:', (await deployer.getBalance()).toString(), '\n');

  console.log('Treasury address:', TREASURY_ADDRESS, '\n');
  console.log('Network: Base (Chain ID: 8453)\n');

  console.log('📦 Deploying RebalanceManager...');
  const RebalanceManager = await ethers.getContractFactory('RebalanceManager');
  const rebalanceManager = await RebalanceManager.deploy(TREASURY_ADDRESS);
  await rebalanceManager.deployed();
  console.log('✅ RebalanceManager deployed to:', rebalanceManager.address, '\n');

  console.log('📦 Deploying Spark USDC Vault...');
  const MorphoVault = await ethers.getContractFactory('MorphoVault');
  const sparkUSDCVault = await MorphoVault.deploy(
    BASE_USDC_ADDRESS,
    TREASURY_ADDRESS,
    'Estable Spark USDC',
    'esSPARK-USDC'
  );
  await sparkUSDCVault.deployed();
  console.log('✅ Spark USDC Vault deployed to:', sparkUSDCVault.address, '\n');

  console.log('📦 Deploying Steakhouse USDT Vault...');
  const steakhouseUSDTVault = await MorphoVault.deploy(
    BASE_USDT_ADDRESS,
    TREASURY_ADDRESS,
    'Estable Steakhouse USDT',
    'esSTEAK-USDT'
  );
  await steakhouseUSDTVault.deployed();
  console.log('✅ Steakhouse USDT Vault deployed to:', steakhouseUSDTVault.address, '\n');

  console.log('📦 Deploying sDAI MetaMorpho Vault...');
  const sDAIVault = await MorphoVault.deploy(
    BASE_DAI_ADDRESS,
    TREASURY_ADDRESS,
    'Estable sDAI MetaMorpho',
    'essDAI'
  );
  await sDAIVault.deployed();
  console.log('✅ sDAI MetaMorpho Vault deployed to:', sDAIVault.address, '\n');

  console.log('⚙️  Configuring RebalanceManager strategies...');

  await rebalanceManager.addStrategy(sparkUSDCVault.address, 4000);
  console.log('✅ Added Spark USDC strategy (40%)');

  await rebalanceManager.addStrategy(steakhouseUSDTVault.address, 3000);
  console.log('✅ Added Steakhouse USDT strategy (30%)');

  await rebalanceManager.addStrategy(sDAIVault.address, 3000);
  console.log('✅ Added sDAI strategy (30%)\n');

  console.log('🎉 Deployment completed!\n');
  console.log('=================================');
  console.log('📋 Deployment Summary:');
  console.log('=================================');
  console.log('RebalanceManager:', rebalanceManager.address);
  console.log('Spark USDC Vault:', sparkUSDCVault.address);
  console.log('Steakhouse USDT Vault:', steakhouseUSDTVault.address);
  console.log('sDAI MetaMorpho Vault:', sDAIVault.address);
  console.log('Treasury:', TREASURY_ADDRESS);
  console.log('=================================\n');

  console.log('💾 Saving deployment addresses...');
  const fs = require('fs');
  const deploymentData = {
    network: 'base',
    chainId: 8453,
    deployedAt: new Date().toISOString(),
    contracts: {
      RebalanceManager: rebalanceManager.address,
      SparkUSDCVault: sparkUSDCVault.address,
      SteakhouseUSDTVault: steakhouseUSDTVault.address,
      sDAIVault: sDAIVault.address,
      Treasury: TREASURY_ADDRESS
    },
    tokens: {
      USDC: BASE_USDC_ADDRESS,
      USDT: BASE_USDT_ADDRESS,
      DAI: BASE_DAI_ADDRESS
    },
    allocations: {
      sparkUSDC: '40%',
      steakhouseUSDT: '30%',
      sDAI: '30%'
    },
    fees: {
      performanceFee: '15% (10% treasury, 5% referrers)',
      depositFee: '0% (activates at $500k TVL)',
      withdrawalFee: '0% (activates at $500k TVL)',
      referralFee: '5%'
    }
  };

  fs.writeFileSync(
    './deployment-morpho.json',
    JSON.stringify(deploymentData, null, 2)
  );
  console.log('✅ Deployment data saved to deployment-morpho.json\n');

  console.log('🔍 Next steps:');
  console.log('1. Verify contracts on Basescan');
  console.log('2. Update Supabase vaults table with contract addresses');
  console.log('3. Set up weekly rebalance cron job');
  console.log('4. Enable deposit/withdrawal fees after $500k TVL');
  console.log('5. Configure MEV capture bot\n');

  console.log('📈 Revenue projections ($10M TVL @ 14% net APY):');
  console.log('  Performance fees: $210k/year ($17.5k/month)');
  console.log('  Referral kickbacks: $105k/year (5% to referrers)');
  console.log('  Deposit/withdrawal fees: $36k/year (after activation)');
  console.log('  MEV capture: $12-60k/year (estimated)\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
