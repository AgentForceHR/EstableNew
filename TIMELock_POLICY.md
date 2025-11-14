# Timelock Policy (48h) — Estable

## Overview
Estable uses a public timelock (OpenZeppelin TimelockController) to queue all **user-impacting** actions with a 48-hour delay. The founder retains operational control but all critical changes are visible and delayed to protect users.

## Delay: 48 hours (recommended)
- All queued actions are visible on-chain during the delay window.
- Executors: address(0) (anyone can execute once delay expires).
- Proposers: founder EOA (and optionally a backup).

## Timelocked actions (must be scheduled & executed):
- addStrategy, removeStrategy, updateStrategy
- change allocations
- change fee rates
- set or change strategy adapters
- rebalances (optional)
- change treasury address
- contract upgrades (if present)

## Immediate / Owner-only actions:
- withdraw protocol/tresasury fees (transferCollectedFees)
- pause/unpause (emergency)
- setTimelock during bootstrap
- claim referral earnings (if implemented as owner action)

## How to schedule & execute
1. Proposer calls `timelock.schedule(target, value, calldata, predecessor, salt, delay)`.
2. Anyone may call `timelock.execute(...)` after `delay` seconds (if executors = address(0)).
3. The target contract will receive the call from the TimelockController (msg.sender==timelock).

## Monitoring
- We publish upcoming scheduled actions in the UI.
- A bot posts new schedule events to Discord/Twitter.
- Users are encouraged to withdraw during the delay window if they disagree.

## Treasury & fees
- Fees are paid out when a scheduled action (e.g., harvest) is executed by the timelock — treasury receives fees immediately at execution time.
- Owner can transfer already-collected treasury balances without timelock.

## Security notes
- The timelock prevents silent changes and gives users an exit window.
- Founder retains control but cannot quietly change strategy/fees without time to react.
