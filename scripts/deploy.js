const { ethers } = require('hardhat');

const TREASURY_ADDRESS = '0x9017DE667f3835b3A7cb2D50013F65fC3d408BbE';

const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

async function main() {
  console.log('🚀 Starting Estable.lat deployment...\n');

  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);
  console.log('Account balance:', (await deployer.getBalance()).toString(), '\n');

  console.log('Treasury address:', TREASURY_ADDRESS, '\n');

  console.log('📦 Deploying VaultFactory...');
  const VaultFactory = await ethers.getContractFactory('VaultFactory');
  const factory = await VaultFactory.deploy(TREASURY_ADDRESS);
  await factory.deployed();
  console.log('✅ VaultFactory deployed to:', factory.address, '\n');

  console.log('📦 Creating USDC Vault...');
  const usdcTx = await factory.createVault(
    USDC_ADDRESS,
    'Estable USDC Vault',
    'esUSDC'
  );
  await usdcTx.wait();
  const usdcVault = await factory.assetToVault(USDC_ADDRESS);
  console.log('✅ USDC Vault deployed to:', usdcVault, '\n');

  console.log('📦 Creating USDT Vault...');
  const usdtTx = await factory.createVault(
    USDT_ADDRESS,
    'Estable USDT Vault',
    'esUSDT'
  );
  await usdtTx.wait();
  const usdtVault = await factory.assetToVault(USDT_ADDRESS);
  console.log('✅ USDT Vault deployed to:', usdtVault, '\n');

  console.log('📦 Deploying MultiStrategyVault...');
  const MultiStrategyVault = await ethers.getContractFactory('MultiStrategyVault');
  const multiVault = await MultiStrategyVault.deploy(USDC_ADDRESS, TREASURY_ADDRESS);
  await multiVault.deployed();
  console.log('✅ MultiStrategyVault deployed to:', multiVault.address, '\n');

  console.log('🎉 Deployment completed!\n');
  console.log('=================================');
  console.log('📋 Deployment Summary:');
  console.log('=================================');
  console.log('VaultFactory:', factory.address);
  console.log('USDC Vault:', usdcVault);
  console.log('USDT Vault:', usdtVault);
  console.log('Multi-Strategy Vault:', multiVault.address);
  console.log('Treasury:', TREASURY_ADDRESS);
  console.log('=================================\n');

  console.log('💾 Saving deployment addresses...');
  const fs = require('fs');
  const deploymentData = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployedAt: new Date().toISOString(),
    contracts: {
      VaultFactory: factory.address,
      USDCVault: usdcVault,
      USDTVault: usdtVault,
      MultiStrategyVault: multiVault.address,
      Treasury: TREASURY_ADDRESS
    },
    tokens: {
      USDC: USDC_ADDRESS,
      USDT: USDT_ADDRESS
    }
  };

  fs.writeFileSync(
    './deployment.json',
    JSON.stringify(deploymentData, null, 2)
  );
  console.log('✅ Deployment data saved to deployment.json\n');

  console.log('🔍 Verification commands:');
  console.log(`npx hardhat verify --network mainnet ${factory.address} ${TREASURY_ADDRESS}`);
  console.log(`npx hardhat verify --network mainnet ${multiVault.address} ${USDC_ADDRESS} ${TREASURY_ADDRESS}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
