// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/// @title PriceOracle — Mock price oracle that emits price drops to trigger health factor recalculation
contract PriceOracle {
    mapping(address => uint256) public prices;

    event PriceUpdated(address indexed asset, uint256 oldPrice, uint256 newPrice);
    event PriceCrashed(address indexed asset, uint256 oldPrice, uint256 newPrice, uint256 dropPercent);

    function setPrice(address asset, uint256 price) external {
        uint256 old = prices[asset];
        prices[asset] = price;
        emit PriceUpdated(asset, old, price);

        if (old > 0 && price < old) {
            uint256 drop = ((old - price) * 100) / old;
            if (drop >= 5) {
                emit PriceCrashed(asset, old, price, drop);
            }
        }
    }

    function getPrice(address asset) external view returns (uint256) {
        return prices[asset];
    }
}
