// scripts/schedule-action.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const timelockAddress = "TIMelock_ADDRESS";
  const target = "TARGET_CONTRACT_ADDRESS"; // e.g., MorphoVault
  const abi = ["function updateFees(uint256,uint256,uint256)"];
  const iface = new ethers.utils.Interface(abi);
  const calldata = iface.encodeFunctionData("updateFees", [1500, 10, 10]);

  const timelock = await ethers.getContractAt("TimelockController", timelockAddress);
  const delay = 48 * 60 * 60; // 48 hours
  const predecessor = ethers.constants.HashZero;
  const salt = ethers.utils.id("updateFees-1");

  const tx = await timelock.connect(deployer).schedule(target, 0, calldata, predecessor, salt, delay);
  await tx.wait();
  console.log("Scheduled tx. Salt:", salt);
}

main().catch(console.error);
