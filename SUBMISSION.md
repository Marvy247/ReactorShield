# ReactChain — DoraHacks Submission

## Project Name
ReactChain

## Tagline
On-Chain Reactive Automation Hub — "Zapier for Somnia"

## Description

ReactChain is a trustless automation protocol that lets users compose reactive pipelines entirely on-chain. When a contract emits an event, a chain reaction executes automatically — no bots, no off-chain servers, no polling. Just Somnia Native Reactivity.

Users create pipelines with a visual builder: pick a trigger contract, select an event, choose an action contract. The moment that event fires on-chain, Somnia validators invoke the `ActionExecutor` handler, which reads active pipelines from `PipelineRegistry` and calls `ActionLogger.execute()` atomically. The frontend streams `PipelineExecuted` events in real-time via the Reactivity SDK WebSocket — zero polling, sub-second updates.

Think of it as **Zapier for Somnia**: public infrastructure that any developer or protocol can build on top of.

---

## How Reactivity Is Used

ReactChain uses **both layers** of the Somnia Reactivity SDK:

### 1. On-Chain — Solidity Handler

`ActionExecutor` inherits `SomniaEventHandler`. Validators invoke `_onEvent()` directly in the EVM when `MockTrigger` emits any event. It scans `PipelineRegistry` for matching active pipelines and calls their action contracts atomically.

```solidity
import { SomniaEventHandler } from "@somnia-chain/reactivity-contracts/contracts/SomniaEventHandler.sol";

contract ActionExecutor is SomniaEventHandler {
    function _onEvent(
        address emitter,
        bytes32[] calldata eventTopics,
        bytes calldata data
    ) internal override {
        // Scan PipelineRegistry for active pipelines matching emitter + topic
        // Call ActionLogger.execute() atomically for each match
        // Emit PipelineExecuted with success/fail status
    }
}
```

Subscription created via TypeScript SDK:

```ts
await sdk.createSoliditySubscription({
  emitter: MOCK_TRIGGER_ADDRESS,
  handlerContractAddress: ACTION_EXECUTOR_ADDRESS,
  priorityFeePerGas: parseGwei('2'),
  maxFeePerGas: parseGwei('10'),
  gasLimit: 2_000_000n,
  isGuaranteed: true,
  isCoalesced: false,
});
```

### 2. Off-Chain — WebSocket Subscription

The frontend uses `sdk.subscribe()` to stream `PipelineExecuted` events in real-time — zero polling, pure push:

```ts
sdk.subscribe({
  ethCalls: [],
  eventContractSources: [ACTION_EXECUTOR_ADDRESS],
  onData: (data: SubscriptionCallback) => {
    // Decode PipelineExecuted → update Live Log instantly
  },
});
```

---

## Deployed Contracts — Somnia Testnet

| Contract | Address |
|---|---|
| `PipelineRegistry` | [`0xd8b4875b61130D651409d26C47D49f57BEbC1780`](https://shannon-explorer.somnia.network/address/0xd8b4875b61130D651409d26C47D49f57BEbC1780) |
| `ActionExecutor` | [`0x391926D40EF9d7e94f5656c4d0A8698714ff20Af`](https://shannon-explorer.somnia.network/address/0x391926D40EF9d7e94f5656c4d0A8698714ff20Af) |
| `MockTrigger` | [`0xaA5685419dBd36d93dD4627da89B8f94c39399C4`](https://shannon-explorer.somnia.network/address/0xaA5685419dBd36d93dD4627da89B8f94c39399C4) |
| `ActionLogger` | [`0x95c033E817023e2B1C4e6e55F70d488FeC39fd24`](https://shannon-explorer.somnia.network/address/0x95c033E817023e2B1C4e6e55F70d488FeC39fd24) |

**Reactivity Subscription Tx:** [`0xc83f46bf...`](https://shannon-explorer.somnia.network/tx/0xc83f46bf872ad2f91ebc3d61bc1cb315e114bd68c5112ff28f8f775652c3c3f3)

---

## Links

- **GitHub:** <!-- add repo URL -->
- **Demo Video:** <!-- add video URL -->
- **Live App:** <!-- add deployed URL -->
