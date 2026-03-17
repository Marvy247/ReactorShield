// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import "./PriceOracle.sol";

/// @title MockLendingProtocol — Simulates a DeFi lending protocol with health factor tracking
contract MockLendingProtocol {
    PriceOracle public oracle;

    struct Position {
        address owner;
        address collateralAsset;
        uint256 collateralAmount;  // in wei
        uint256 debtAmount;        // in wei (USD-denominated, 18 decimals)
        bool isOpen;
    }

    mapping(uint256 => Position) public positions;
    mapping(address => uint256[]) public userPositions;
    uint256 public positionCount;

    // Health factor = (collateral * price * 0.8) / debt  (scaled by 1e18)
    // Below 1.0e18 = liquidatable
    uint256 public constant LIQUIDATION_THRESHOLD = 80; // 80%
    uint256 public constant CRITICAL_HEALTH = 1.1e18;   // warn at 1.1
    uint256 public constant LIQUIDATION_HEALTH = 1.0e18; // liquidate at 1.0

    event PositionOpened(uint256 indexed positionId, address indexed owner, address collateralAsset, uint256 collateral, uint256 debt);
    event HealthFactorUpdated(uint256 indexed positionId, address indexed owner, uint256 healthFactor, uint256 collateral, uint256 debt);
    event LiquidationRisk(uint256 indexed positionId, address indexed owner, uint256 healthFactor, uint256 shortfall);
    event PositionProtected(uint256 indexed positionId, address indexed owner, uint256 newHealthFactor);
    event CollateralAdded(uint256 indexed positionId, uint256 amount, uint256 newHealthFactor);
    event DebtRepaid(uint256 indexed positionId, uint256 amount, uint256 newHealthFactor);

    constructor(address _oracle) {
        oracle = PriceOracle(_oracle);
    }

    function openPosition(address collateralAsset, uint256 collateralAmount, uint256 debtAmount) external returns (uint256 id) {
        require(collateralAmount > 0 && debtAmount > 0, "Invalid amounts");
        id = positionCount++;
        positions[id] = Position(msg.sender, collateralAsset, collateralAmount, debtAmount, true);
        userPositions[msg.sender].push(id);
        emit PositionOpened(id, msg.sender, collateralAsset, collateralAmount, debtAmount);
        _emitHealthFactor(id);
    }

    function refreshHealthFactor(uint256 positionId) external {
        _emitHealthFactor(positionId);
    }

    function simulatePriceDrop(address asset, uint256 newPrice) external {
        oracle.setPrice(asset, newPrice);
        // Re-emit health factors for all positions using this asset
        for (uint256 i = 0; i < positionCount; i++) {
            if (positions[i].isOpen && positions[i].collateralAsset == asset) {
                _emitHealthFactor(i);
            }
        }
    }

    function addCollateral(uint256 positionId, uint256 amount) external {
        Position storage p = positions[positionId];
        require(p.isOpen, "Position closed");
        p.collateralAmount += amount;
        uint256 hf = _healthFactor(positionId);
        emit CollateralAdded(positionId, amount, hf);
        emit PositionProtected(positionId, p.owner, hf);
    }

    function repayDebt(uint256 positionId, uint256 amount) external {
        Position storage p = positions[positionId];
        require(p.isOpen, "Position closed");
        p.debtAmount = p.debtAmount > amount ? p.debtAmount - amount : 0;
        uint256 hf = _healthFactor(positionId);
        emit DebtRepaid(positionId, amount, hf);
        emit PositionProtected(positionId, p.owner, hf);
    }

    function getHealthFactor(uint256 positionId) external view returns (uint256) {
        return _healthFactor(positionId);
    }

    function getUserPositions(address user) external view returns (uint256[] memory) {
        return userPositions[user];
    }

    function _healthFactor(uint256 positionId) internal view returns (uint256) {
        Position storage p = positions[positionId];
        if (!p.isOpen || p.debtAmount == 0) return type(uint256).max;
        uint256 price = oracle.getPrice(p.collateralAsset);
        if (price == 0) return type(uint256).max;
        // collateralValueUSD = collateralAmount * price / 1e18 (price is 18-decimal)
        // healthFactor = (collateralValueUSD * threshold%) / debtAmount, scaled 1e18
        uint256 collateralValueUSD = (p.collateralAmount * price) / 1e18;
        uint256 adjustedCollateral = (collateralValueUSD * LIQUIDATION_THRESHOLD) / 100;
        return (adjustedCollateral * 1e18) / p.debtAmount;
    }

    function _emitHealthFactor(uint256 positionId) internal {
        Position storage p = positions[positionId];
        if (!p.isOpen) return;
        uint256 hf = _healthFactor(positionId);
        emit HealthFactorUpdated(positionId, p.owner, hf, p.collateralAmount, p.debtAmount);
        if (hf <= LIQUIDATION_HEALTH) {
            uint256 price = oracle.getPrice(p.collateralAsset);
            uint256 collateralValueUSD = price > 0 ? (p.collateralAmount * price) / 1e18 : 0;
            uint256 adjustedCollateral = (collateralValueUSD * LIQUIDATION_THRESHOLD) / 100;
            uint256 shortfall = p.debtAmount > adjustedCollateral ? p.debtAmount - adjustedCollateral : 0;
            emit LiquidationRisk(positionId, p.owner, hf, shortfall);
        }
    }
}
