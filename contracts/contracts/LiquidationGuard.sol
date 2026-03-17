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

    constructor(address _lendingProtocol) {
        lendingProtocol = MockLendingProtocol(_lendingProtocol);
    }

    /// @notice Called by Somnia Reactivity validators when MockLendingProtocol emits an event
    function _onEvent(
        address, /* emitter */
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
        // eventTopics: [0]=topic0, [1]=positionId, [2]=owner
        if (eventTopics.length < 3) return;
        uint256 positionId = uint256(eventTopics[1]);
        address owner = address(uint160(uint256(eventTopics[2])));
        (uint256 healthFactor,) = abi.decode(data, (uint256, uint256));

        (,, uint256 collateralAmount,, bool isOpen) = lendingProtocol.positions(positionId);
        if (!isOpen) return;
        uint256 topUp = collateralAmount / 5; // 20% top-up
        lendingProtocol.addCollateral(positionId, topUp);
        emit GuardTriggered(positionId, owner, healthFactor, "AUTO_COLLATERAL_TOPUP");
    }

    function _handleHealthFactorUpdate(bytes32[] calldata eventTopics, bytes calldata data) internal {
        // HealthFactorUpdated(uint256 indexed positionId, address indexed owner, uint256 healthFactor, uint256 collateral, uint256 debt)
        if (eventTopics.length < 3) return;
        uint256 positionId = uint256(eventTopics[1]);
        address owner = address(uint160(uint256(eventTopics[2])));
        (uint256 healthFactor,,) = abi.decode(data, (uint256, uint256, uint256));

        // Act when critically low (< 1.15) but not yet at liquidation threshold
        if (healthFactor < 1.15e18 && healthFactor > 1.0e18) {
            (,,, uint256 debtAmount, bool isOpen) = lendingProtocol.positions(positionId);
            if (!isOpen) return;
            uint256 repayAmount = debtAmount / 10; // repay 10%
            lendingProtocol.repayDebt(positionId, repayAmount);
            emit GuardTriggered(positionId, owner, healthFactor, "AUTO_PARTIAL_REPAY");
        }
    }
}
