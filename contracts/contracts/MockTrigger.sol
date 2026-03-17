// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title MockTrigger
/// @notice Demo contract for firing events to trigger reactive pipelines in the demo video
contract MockTrigger {
    event PriceUpdated(address indexed asset, uint256 oldPrice, uint256 newPrice);
    event ThresholdBreached(address indexed account, uint256 value, string reason);
    event TokenTransferred(address indexed from, address indexed to, uint256 amount);

    mapping(address => uint256) public prices;

    function updatePrice(address asset, uint256 newPrice) external {
        uint256 old = prices[asset];
        prices[asset] = newPrice;
        emit PriceUpdated(asset, old, newPrice);
    }

    function breachThreshold(uint256 value, string calldata reason) external {
        emit ThresholdBreached(msg.sender, value, reason);
    }

    function transferToken(address to, uint256 amount) external {
        emit TokenTransferred(msg.sender, to, amount);
    }
}
