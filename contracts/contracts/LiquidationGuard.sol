// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import { SomniaEventHandler } from "@somnia-chain/reactivity-contracts/contracts/SomniaEventHandler.sol";
import "./MockLendingProtocol.sol";

/// @title LiquidationGuard — Reactive on-chain guardian that auto-protects positions
/// @notice Extends SomniaEventHandler — invoked by Somnia validators when LiquidationRisk fires
contract LiquidationGuard is SomniaEventHandler {
    MockLendingProtocol public lendingProtocol;

    // keccak256("LiquidationRisk(uint256,address,uint256,uint256)")
    bytes32 public constant LIQUIDATION_RISK_TOPIC =
        keccak256("LiquidationRisk(uint256,address,uint256,uint256)");

    // keccak256("HealthFactorUpdated(uint256,address,uint256,uint256,uint256)")
    bytes32 public constant HEALTH_FACTOR_TOPIC =
        keccak256("HealthFactorUpdated(uint256,address,uint256,uint256,uint256)");

    event GuardTriggered(uint256 indexed positionId, address indexed owner, uint256 healthFactor, string action);
    event GuardFailed(uint256 indexed positionId, string reason);

    constructor(address _lendingProtocol) {
        lendingProtocol = MockLendingProtocol(_lendingProtocol);
    }

    /// @notice Called by Somnia Reactivity validators when MockLendingProtocol emits an event
    function _onEvent(
        address emitter,
        bytes32[] calldata eventTopics,
        bytes calldata data
    ) internal override {
        if (eventTopics.length == 0) return;
        bytes32 topic0 = eventTopics[0];

        if (topic0 == LIQUIDATION_RISK_TOPIC) {
            _handleLiquidationRisk(eventTopics, data);
        } else if (topic0 == HEALTH_FACTOR_TOPIC) {
            _handleHealthFactorUpdate(eventTopics, data);
        }
    }

    function _handleLiquidationRisk(bytes32[] calldata eventTopics, bytes calldata data) internal {
        // LiquidationRisk(uint256 indexed positionId, address indexed owner, uint256 healthFactor, uint256 shortfall)
        uint256 positionId = uint256(eventTopics[1]);
        (uint256 healthFactor,) = abi.decode(data, (uint256, uint256));

        // Auto-protect: add collateral equivalent to 20% of current collateral
        try lendingProtocol.positions(positionId) returns (
            address owner, address, uint256 collateralAmount, uint256, bool isOpen
        ) {
            if (!isOpen) return;
            uint256 topUp = collateralAmount / 5; // 20% top-up
            lendingProtocol.addCollateral(positionId, topUp);
            emit GuardTriggered(positionId, owner, healthFactor, "AUTO_COLLATERAL_TOPUP");
        } catch {
            emit GuardFailed(positionId, "Position read failed");
        }
    }

    function _handleHealthFactorUpdate(bytes32[] calldata eventTopics, bytes calldata data) internal {
        uint256 positionId = uint256(eventTopics[1]);
        (uint256 healthFactor,,) = abi.decode(data, (uint256, uint256, uint256));

        // If critically low (< 1.15) but not yet liquidatable, do partial debt repay
        if (healthFactor < 1.15e18 && healthFactor > 1.0e18) {
            try lendingProtocol.positions(positionId) returns (
                address owner, address, uint256, uint256 debtAmount, bool isOpen
            ) {
                if (!isOpen) return;
                uint256 repayAmount = debtAmount / 10; // repay 10% of debt
                lendingProtocol.repayDebt(positionId, repayAmount);
                emit GuardTriggered(positionId, owner, healthFactor, "AUTO_PARTIAL_REPAY");
            } catch {
                emit GuardFailed(positionId, "Repay failed");
            }
        }
    }
}
