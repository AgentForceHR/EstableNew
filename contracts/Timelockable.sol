// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

abstract contract Timelockable {
    address public timelock;

    event TimelockSet(address indexed timelock);

    /// @dev internal setter used by owner-only wrapper
    function _setTimelock(address _timelock) internal {
        require(_timelock != address(0), "Timelock: zero");
        timelock = _timelock;
        emit TimelockSet(_timelock);
    }

    modifier onlyTimelock() {
        require(msg.sender == timelock, "Only timelock");
        _;
    }

    /// @dev helper modifier allowing Either timelock OR the contract owner (owner check implemented in concrete contract)
    modifier onlyTimelockOr(address allowed) {
        if (msg.sender == timelock) {
            _;
        } else {
            require(msg.sender == allowed, "Only timelock or allowed");
            _;
        }
    }
}
