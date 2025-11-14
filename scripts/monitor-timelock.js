// scripts/monitor-timelock.js
const { ethers } = require("hardhat");

async function main() {
  const timelockAddr = "TIMelock_ADDRESS";
  const timelock = await ethers.getContractAt("TimelockController", timelockAddr);

  // You can add known operation ids (hash) or query typical things
  // This simple script demonstrates retrieving the minDelay and proposer/executor roles
  const minDelay = await timelock.getMinDelay();
  console.log("Timelock minDelay (seconds):", minDelay.toString());

  // Example: check if an operation (op) is pending
  // You must compute op = keccak256(target, value, data, predecessor, salt)
  // For now, we show the public role members for monitoring
  const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
  const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();
  const proposers = await timelock.getRoleMemberCount(PROPOSER_ROLE);
  console.log("Proposer count:", proposers.toString());
  for (let i = 0; i < proposers; i++) {
    const addr = await timelock.getRoleMember(PROPOSER_ROLE, i);
    console.log("Proposer:", addr);
  }
  const executors = await timelock.getRoleMemberCount(EXECUTOR_ROLE);
  console.log("Executor count:", executors.toString());
  for (let i = 0; i < executors; i++) {
    const addr = await timelock.getRoleMember(EXECUTOR_ROLE, i);
    console.log("Executor:", addr);
  }

  console.log("To monitor pending ops you must compute opHash and call timelock.isOperation(opHash).");
}

main().catch(console.error);
