// scripts/execute-action.js
const { ethers } = require("hardhat");

async function main() {
  const timelockAddress = "TIMelock_ADDRESS";
  const target = "TARGET_CONTRACT_ADDRESS";
  const abi = ["function updateFees(uint256,uint256,uint256)"];
  const iface = new ethers.utils.Interface(abi);
  const calldata = iface.encodeFunctionData("updateFees", [1500, 10, 10]);

  const timelock = await ethers.getContractAt("TimelockController", timelockAddress);
  const predecessor = ethers.constants.HashZero;
  const salt = ethers.utils.id("updateFees-1");

  const tx = await timelock.execute(target, 0, calldata, predecessor, salt);
  await tx.wait();
  console.log("Executed scheduled tx.");
}

main().catch(console.error);
