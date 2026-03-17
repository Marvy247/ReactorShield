// Update these after deploying on Remix IDE
export const CONTRACT_ADDRESSES = {
  PriceOracle: '' as `0x${string}`,
  MockLendingProtocol: '' as `0x${string}`,
  LiquidationGuard: '' as `0x${string}`,
};

export const PRICE_ORACLE_ABI = [
  { name: 'setPrice', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'asset', type: 'address' }, { name: 'price', type: 'uint256' }], outputs: [] },
  { name: 'getPrice', type: 'function', stateMutability: 'view', inputs: [{ name: 'asset', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'PriceUpdated', type: 'event', inputs: [{ name: 'asset', type: 'address', indexed: true }, { name: 'oldPrice', type: 'uint256', indexed: false }, { name: 'newPrice', type: 'uint256', indexed: false }] },
  { name: 'PriceCrashed', type: 'event', inputs: [{ name: 'asset', type: 'address', indexed: true }, { name: 'oldPrice', type: 'uint256', indexed: false }, { name: 'newPrice', type: 'uint256', indexed: false }, { name: 'dropPercent', type: 'uint256', indexed: false }] },
] as const;

export const LENDING_PROTOCOL_ABI = [
  { name: 'positionCount', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'positions', type: 'function', stateMutability: 'view', inputs: [{ name: 'id', type: 'uint256' }], outputs: [{ name: 'owner', type: 'address' }, { name: 'collateralAsset', type: 'address' }, { name: 'collateralAmount', type: 'uint256' }, { name: 'debtAmount', type: 'uint256' }, { name: 'isOpen', type: 'bool' }] },
  { name: 'openPosition', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'collateralAsset', type: 'address' }, { name: 'collateralAmount', type: 'uint256' }, { name: 'debtAmount', type: 'uint256' }], outputs: [{ name: 'id', type: 'uint256' }] },
  { name: 'simulatePriceDrop', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'asset', type: 'address' }, { name: 'newPrice', type: 'uint256' }], outputs: [] },
  { name: 'addCollateral', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'positionId', type: 'uint256' }, { name: 'amount', type: 'uint256' }], outputs: [] },
  { name: 'repayDebt', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'positionId', type: 'uint256' }, { name: 'amount', type: 'uint256' }], outputs: [] },
  { name: 'getHealthFactor', type: 'function', stateMutability: 'view', inputs: [{ name: 'positionId', type: 'uint256' }], outputs: [{ type: 'uint256' }] },
  { name: 'getUserPositions', type: 'function', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ type: 'uint256[]' }] },
  { name: 'PositionOpened', type: 'event', inputs: [{ name: 'positionId', type: 'uint256', indexed: true }, { name: 'owner', type: 'address', indexed: true }, { name: 'collateralAsset', type: 'address', indexed: false }, { name: 'collateral', type: 'uint256', indexed: false }, { name: 'debt', type: 'uint256', indexed: false }] },
  { name: 'HealthFactorUpdated', type: 'event', inputs: [{ name: 'positionId', type: 'uint256', indexed: true }, { name: 'owner', type: 'address', indexed: true }, { name: 'healthFactor', type: 'uint256', indexed: false }, { name: 'collateral', type: 'uint256', indexed: false }, { name: 'debt', type: 'uint256', indexed: false }] },
  { name: 'LiquidationRisk', type: 'event', inputs: [{ name: 'positionId', type: 'uint256', indexed: true }, { name: 'owner', type: 'address', indexed: true }, { name: 'healthFactor', type: 'uint256', indexed: false }, { name: 'shortfall', type: 'uint256', indexed: false }] },
  { name: 'PositionProtected', type: 'event', inputs: [{ name: 'positionId', type: 'uint256', indexed: true }, { name: 'owner', type: 'address', indexed: true }, { name: 'newHealthFactor', type: 'uint256', indexed: false }] },
] as const;

export const LIQUIDATION_GUARD_ABI = [
  { name: 'GuardTriggered', type: 'event', inputs: [{ name: 'positionId', type: 'uint256', indexed: true }, { name: 'owner', type: 'address', indexed: true }, { name: 'healthFactor', type: 'uint256', indexed: false }, { name: 'action', type: 'string', indexed: false }] },
  { name: 'GuardFailed', type: 'event', inputs: [{ name: 'positionId', type: 'uint256', indexed: true }, { name: 'reason', type: 'string', indexed: false }] },
] as const;

// Mock asset addresses for demo (deterministic)
export const MOCK_ASSETS = {
  ETH:  '0x0000000000000000000000000000000000000001' as `0x${string}`,
  BTC:  '0x0000000000000000000000000000000000000002' as `0x${string}`,
  LINK: '0x0000000000000000000000000000000000000003' as `0x${string}`,
};
