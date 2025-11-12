// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title RebalanceManager
 * @notice Manages automatic rebalancing across Morpho Blue strategies
 * @dev Target: 40% Spark USDC, 30% Steakhouse USDT, 30% sDAI
 */
contract RebalanceManager is Ownable {
    struct Strategy {
        address vaultAddress;
        uint256 targetAllocationBps;
        uint256 currentAllocationBps;
        bool isActive;
    }

    address public immutable treasury;
    uint256 public constant TOTAL_BPS = 10000;
    uint256 public constant REBALANCE_THRESHOLD_BPS = 500;

    Strategy[] public strategies;
    uint256 public lastRebalanceTime;
    uint256 public rebalanceInterval = 7 days;
    uint256 public totalMevCaptured;

    event StrategyAdded(address indexed vault, uint256 targetAllocationBps);
    event StrategyUpdated(uint256 indexed strategyId, uint256 newAllocationBps);
    event Rebalanced(uint256 timestamp, uint256 totalValue, uint256 gasUsed);
    event MevCaptured(uint256 amount, uint256 treasuryFee);

    constructor(address _treasury) {
        require(_treasury != address(0), "Invalid treasury");
        treasury = _treasury;
        lastRebalanceTime = block.timestamp;
    }

    function addStrategy(
        address vaultAddress,
        uint256 targetAllocationBps
    ) external onlyOwner {
        require(vaultAddress != address(0), "Invalid vault");

        uint256 totalAllocation = targetAllocationBps;
        for (uint256 i = 0; i < strategies.length; i++) {
            if (strategies[i].isActive) {
                totalAllocation += strategies[i].targetAllocationBps;
            }
        }
        require(totalAllocation <= TOTAL_BPS, "Exceeds 100%");

        strategies.push(Strategy({
            vaultAddress: vaultAddress,
            targetAllocationBps: targetAllocationBps,
            currentAllocationBps: 0,
            isActive: true
        }));

        emit StrategyAdded(vaultAddress, targetAllocationBps);
    }

    function updateStrategy(
        uint256 strategyId,
        uint256 newAllocationBps
    ) external onlyOwner {
        require(strategyId < strategies.length, "Invalid strategy");

        uint256 totalAllocation = newAllocationBps;
        for (uint256 i = 0; i < strategies.length; i++) {
            if (i != strategyId && strategies[i].isActive) {
                totalAllocation += strategies[i].targetAllocationBps;
            }
        }
        require(totalAllocation <= TOTAL_BPS, "Exceeds 100%");

        strategies[strategyId].targetAllocationBps = newAllocationBps;

        emit StrategyUpdated(strategyId, newAllocationBps);
    }

    function needsRebalancing() public view returns (bool) {
        if (block.timestamp < lastRebalanceTime + rebalanceInterval) {
            return false;
        }

        for (uint256 i = 0; i < strategies.length; i++) {
            if (!strategies[i].isActive) continue;

            uint256 diff;
            if (strategies[i].currentAllocationBps > strategies[i].targetAllocationBps) {
                diff = strategies[i].currentAllocationBps - strategies[i].targetAllocationBps;
            } else {
                diff = strategies[i].targetAllocationBps - strategies[i].currentAllocationBps;
            }

            if (diff > REBALANCE_THRESHOLD_BPS) {
                return true;
            }
        }

        return false;
    }

    function executeRebalance(uint256 totalValue) external onlyOwner {
        require(needsRebalancing(), "Rebalancing not needed");

        uint256 gasStart = gasleft();

        for (uint256 i = 0; i < strategies.length; i++) {
            if (!strategies[i].isActive) continue;

            uint256 targetValue = (totalValue * strategies[i].targetAllocationBps) / TOTAL_BPS;
            strategies[i].currentAllocationBps = strategies[i].targetAllocationBps;
        }

        lastRebalanceTime = block.timestamp;
        uint256 gasUsed = gasStart - gasleft();

        emit Rebalanced(block.timestamp, totalValue, gasUsed);
    }

    function captureMev(uint256 amount) external onlyOwner {
        require(amount > 0, "Zero amount");

        uint256 treasuryFee = (amount * 1000) / 10000;
        totalMevCaptured += amount;

        emit MevCaptured(amount, treasuryFee);
    }

    function getStrategies() external view returns (Strategy[] memory) {
        return strategies;
    }

    function setRebalanceInterval(uint256 newInterval) external onlyOwner {
        require(newInterval >= 1 days && newInterval <= 30 days, "Invalid interval");
        rebalanceInterval = newInterval;
    }
}
