// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Timelockable.sol";

/// @notice Timelock-aware RebalanceManager
contract RebalanceManager is Ownable, Timelockable {
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

    /// @notice set timelock address (owner only)
    function setTimelock(address _timelock) external onlyOwner {
        _setTimelock(_timelock);
    }

    /// @notice add strategy (timelocked)
    function addStrategy(address vaultAddress, uint256 targetAllocationBps) external onlyTimelock {
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

    /// @notice update strategy target (timelocked)
    function updateStrategy(uint256 strategyId, uint256 newAllocationBps) external onlyTimelock {
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

    /// @notice check if rebalancing is needed (view)
    function needsRebalancing() public view returns (bool) {
        if (block.timestamp < lastRebalanceTime + rebalanceInterval) {
            return false;
        }

        for (uint256 i = 0; i < strategies.length; i++) {
            if (!strategies[i].isActive) continue;

            uint256 diff = strategies[i].currentAllocationBps > strategies[i].targetAllocationBps
                ? strategies[i].currentAllocationBps - strategies[i].targetAllocationBps
                : strategies[i].targetAllocationBps - strategies[i].currentAllocationBps;

            if (diff > REBALANCE_THRESHOLD_BPS) {
                return true;
            }
        }

        return false;
    }

    /// @notice execute rebalance (timelocked)
    /// @dev totalValue should be computed off-chain and represents the aggregate TVL of tracked vaults.
    ///      We keep the same parameter for compatibility, but you can switch to on-chain derivation later.
    function executeRebalance(uint256 totalValue) external onlyTimelock {
        require(needsRebalancing(), "Rebalancing not needed");

        uint256 gasStart = gasleft();

        for (uint256 i = 0; i < strategies.length; i++) {
            if (!strategies[i].isActive) continue;

            // compute and set current to target (this is bookkeeping; actual vault moves happen elsewhere)
            uint256 targetValue = (totalValue * strategies[i].targetAllocationBps) / TOTAL_BPS;
            strategies[i].currentAllocationBps = strategies[i].targetAllocationBps;
            // NOTE: implementation assumes external actor (or the vault itself) will move funds accordingly
        }

        lastRebalanceTime = block.timestamp;
        uint256 gasUsed = gasStart - gasleft();

        emit Rebalanced(block.timestamp, totalValue, gasUsed);
    }

    /// @notice capture MEV (timelocked)
    /// @dev This function only records capture; it's expected the real token transfer is performed out-of-band
    function captureMev(uint256 amount) external onlyTimelock {
        require(amount > 0, "Zero amount");

        uint256 treasuryFee = (amount * 1000) / 10000;
        totalMevCaptured += amount;

        emit MevCaptured(amount, treasuryFee);
    }

    function getStrategies() external view returns (Strategy[] memory) {
        return strategies;
    }

    /// @notice set rebalance interval (timelocked)
    function setRebalanceInterval(uint256 newInterval) external onlyTimelock {
        require(newInterval >= 1 days && newInterval <= 30 days, "Invalid interval");
        rebalanceInterval = newInterval;
    }
}
