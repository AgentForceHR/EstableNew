// scripts/deploy-timelock.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying timelock with deployer:", deployer.address);

  const minDelay = 48 * 60 * 60; // 48 hours recommended
  const proposers = [deployer.address]; // you can add more later (e.g., backup)
  const executors = [ethers.constants.AddressZero]; // anyone can execute after delay

  const Timelock = await ethers.getContractFactory("TimelockController");
  const timelock = await Timelock.deploy(minDelay, proposers, executors);
  await timelock.deployed();

  console.log("TimelockController deployed at:", timelock.address);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
