export const CONTRACT_ADDRESSES = {
  PipelineRegistry: '0xd8b4875b61130D651409d26C47D49f57BEbC1780' as `0x${string}`,
  ActionExecutor: '0x391926D40EF9d7e94f5656c4d0A8698714ff20Af' as `0x${string}`,
  MockTrigger: '0xaA5685419dBd36d93dD4627da89B8f94c39399C4' as `0x${string}`,
  ActionLogger: '0x95c033E817023e2B1C4e6e55F70d488FeC39fd24' as `0x${string}`,
};

export const PIPELINE_REGISTRY_ABI = [
  { name: 'pipelineCount', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'createPipeline', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'triggerContract', type: 'address' }, { name: 'eventTopic', type: 'bytes32' }, { name: 'actionContract', type: 'address' }, { name: 'actionSelector', type: 'bytes4' }, { name: 'label', type: 'string' }], outputs: [{ name: 'id', type: 'uint256' }] },
  { name: 'togglePipeline', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'id', type: 'uint256' }], outputs: [] },
  { name: 'getPipeline', type: 'function', stateMutability: 'view', inputs: [{ name: 'id', type: 'uint256' }], outputs: [{ name: '', type: 'tuple', components: [{ name: 'owner', type: 'address' }, { name: 'triggerContract', type: 'address' }, { name: 'eventTopic', type: 'bytes32' }, { name: 'actionContract', type: 'address' }, { name: 'actionSelector', type: 'bytes4' }, { name: 'label', type: 'string' }, { name: 'isActive', type: 'bool' }, { name: 'executionCount', type: 'uint256' }, { name: 'lastExecutedAt', type: 'uint256' }] }] },
  { name: 'getOwnerPipelines', type: 'function', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }], outputs: [{ type: 'uint256[]' }] },
  { name: 'PipelineCreated', type: 'event', inputs: [{ name: 'id', type: 'uint256', indexed: true }, { name: 'owner', type: 'address', indexed: true }, { name: 'triggerContract', type: 'address', indexed: false }, { name: 'eventTopic', type: 'bytes32', indexed: false }, { name: 'actionContract', type: 'address', indexed: false }] },
  { name: 'PipelineToggled', type: 'event', inputs: [{ name: 'id', type: 'uint256', indexed: true }, { name: 'isActive', type: 'bool', indexed: false }] },
  { name: 'PipelineExecutionRecorded', type: 'event', inputs: [{ name: 'id', type: 'uint256', indexed: true }, { name: 'executionCount', type: 'uint256', indexed: false }] },
] as const;

export const ACTION_EXECUTOR_ABI = [
  { name: 'PipelineExecuted', type: 'event', inputs: [{ name: 'pipelineId', type: 'uint256', indexed: true }, { name: 'triggerContract', type: 'address', indexed: true }, { name: 'actionContract', type: 'address', indexed: true }, { name: 'actionSelector', type: 'bytes4', indexed: false }, { name: 'success', type: 'bool', indexed: false }] },
] as const;

export const MOCK_TRIGGER_ABI = [
  { name: 'updatePrice', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'asset', type: 'address' }, { name: 'newPrice', type: 'uint256' }], outputs: [] },
  { name: 'breachThreshold', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'value', type: 'uint256' }, { name: 'reason', type: 'string' }], outputs: [] },
  { name: 'transferToken', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [] },
  { name: 'PriceUpdated', type: 'event', inputs: [{ name: 'asset', type: 'address', indexed: true }, { name: 'oldPrice', type: 'uint256', indexed: false }, { name: 'newPrice', type: 'uint256', indexed: false }] },
  { name: 'ThresholdBreached', type: 'event', inputs: [{ name: 'account', type: 'address', indexed: true }, { name: 'value', type: 'uint256', indexed: false }, { name: 'reason', type: 'string', indexed: false }] },
  { name: 'TokenTransferred', type: 'event', inputs: [{ name: 'from', type: 'address', indexed: true }, { name: 'to', type: 'address', indexed: true }, { name: 'amount', type: 'uint256', indexed: false }] },
] as const;

export const ACTION_LOGGER_ABI = [
  { name: 'execute', type: 'function', stateMutability: 'nonpayable', inputs: [], outputs: [] },
  { name: 'getLogCount', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { name: 'ActionTriggered', type: 'event', inputs: [{ name: 'caller', type: 'address', indexed: true }, { name: 'count', type: 'uint256', indexed: false }, { name: 'timestamp', type: 'uint256', indexed: false }] },
] as const;

// Human-readable event name lookup by topic0
export const TOPIC_NAMES: Record<string, string> = {
  '0xd0b6e7d0470b0a332b5b3f7f0c7e1b2e3c4d5e6f': 'PriceUpdated',
};

// Resolved at runtime — use keccak256(toBytes(sig)) from viem
export const EVENT_SIGS: Record<string, string> = {
  'PriceUpdated(address,uint256,uint256)': 'PriceUpdated',
  'ThresholdBreached(address,uint256,string)': 'ThresholdBreached',
  'TokenTransferred(address,address,uint256)': 'TokenTransferred',
};
