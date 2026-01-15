const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying to Base Mainnet...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const BASE_MAINNET_TOKENS = {
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    USDT: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
    DAI: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb"
  };

  const MORPHO_ADDRESS = "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb";

  const MORPHO_MARKETS = {
    sparkUSDC: "0x8793d6e0c6c5f1d2b1d2d2c5d7f8a9b0c1d2e3f4",
    steakhouseUSDT: "0x9893d6e0c6c5f1d2b1d2d2c5d7f8a9b0c1d2e3f5",
    sDAI: "0xa893d6e0c6c5f1d2b1d2d2c5d7f8a9b0c1d2e3f6"
  };

  console.log("\n=== Deploying Multi-Strategy Vaults with Timelock ===\n");

  const TIMELOCK_DELAY = 48 * 60 * 60;

  console.log("1. Deploying USDC Vault (Spark.fi strategy)...");
  const USDCVault = await hre.ethers.getContractFactory("MorphoVaultTimelock");
  const usdcVault = await USDCVault.deploy(
    BASE_MAINNET_TOKENS.USDC,
    MORPHO_ADDRESS,
    MORPHO_MARKETS.sparkUSDC,
    TIMELOCK_DELAY,
    "Estable USDC Vault",
    "eUSDC"
  );
  await usdcVault.waitForDeployment();
  const usdcVaultAddress = await usdcVault.getAddress();
  console.log("✅ USDC Vault deployed to:", usdcVaultAddress);

  console.log("\n2. Deploying USDT Vault (Steakhouse strategy)...");
  const USDTVault = await hre.ethers.getContractFactory("MorphoVaultTimelock");
  const usdtVault = await USDTVault.deploy(
    BASE_MAINNET_TOKENS.USDT,
    MORPHO_ADDRESS,
    MORPHO_MARKETS.steakhouseUSDT,
    TIMELOCK_DELAY,
    "Estable USDT Vault",
    "eUSDT"
  );
  await usdtVault.waitForDeployment();
  const usdtVaultAddress = await usdtVault.getAddress();
  console.log("✅ USDT Vault deployed to:", usdtVaultAddress);

  console.log("\n3. Deploying DAI Vault (sDAI strategy)...");
  const DAIVault = await hre.ethers.getContractFactory("MorphoVaultTimelock");
  const daiVault = await DAIVault.deploy(
    BASE_MAINNET_TOKENS.DAI,
    MORPHO_ADDRESS,
    MORPHO_MARKETS.sDAI,
    TIMELOCK_DELAY,
    "Estable DAI Vault",
    "eDAI"
  );
  await daiVault.waitForDeployment();
  const daiVaultAddress = await daiVault.getAddress();
  console.log("✅ DAI Vault deployed to:", daiVaultAddress);

  const deployment = {
    network: "base",
    chainId: 8453,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    tokens: {
      USDC: {
        address: BASE_MAINNET_TOKENS.USDC,
        decimals: 6
      },
      USDT: {
        address: BASE_MAINNET_TOKENS.USDT,
        decimals: 6
      },
      DAI: {
        address: BASE_MAINNET_TOKENS.DAI,
        decimals: 18
      }
    },
    morpho: {
      address: MORPHO_ADDRESS,
      markets: MORPHO_MARKETS
    },
    timelockDelay: TIMELOCK_DELAY,
    stableVaults: [
      {
        id: "usdc-vault-mainnet",
        name: "USDC Vault",
        assetSymbol: "USDC",
        assetAddress: BASE_MAINNET_TOKENS.USDC,
        vaultAddress: usdcVaultAddress,
        decimals: 6,
        description: "Vault optimizado para USDC con estrategia Spark.fi en Morpho Blue"
      },
      {
        id: "usdt-vault-mainnet",
        name: "USDT Vault",
        assetSymbol: "USDT",
        assetAddress: BASE_MAINNET_TOKENS.USDT,
        vaultAddress: usdtVaultAddress,
        decimals: 6,
        description: "Vault optimizado para USDT con estrategia Steakhouse en Morpho Blue"
      },
      {
        id: "dai-vault-mainnet",
        name: "DAI Vault",
        assetSymbol: "DAI",
        assetAddress: BASE_MAINNET_TOKENS.DAI,
        vaultAddress: daiVaultAddress,
        decimals: 18,
        description: "Vault optimizado para DAI con estrategia sDAI en Morpho Blue"
      }
    ]
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filePath = path.join(deploymentsDir, "base-mainnet.json");
  fs.writeFileSync(filePath, JSON.stringify(deployment, null, 2));

  console.log("\n=== Deployment Summary ===");
  console.log("Network: Base Mainnet");
  console.log("Chain ID: 8453");
  console.log("Timelock Delay: 48 hours");
  console.log("\nVault Addresses:");
  console.log("- USDC Vault:", usdcVaultAddress);
  console.log("- USDT Vault:", usdtVaultAddress);
  console.log("- DAI Vault:", daiVaultAddress);
  console.log("\nDeployment saved to:", filePath);
  console.log("\n✅ Mainnet deployment complete!");

  console.log("\n=== Important Security Notes ===");
  console.log("1. All vaults have a 48-hour timelock on sensitive operations");
  console.log("2. Ensure proper RPC configuration for Base Mainnet");
  console.log("3. Verify all contract addresses before use");
  console.log("4. Monitor vault performance and security");
  console.log("5. Update Morpho market IDs with real addresses before deployment");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
