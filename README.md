# ReactChain — On-Chain Reactive Automation Hub

> "Zapier for Somnia" — compose trustless automation pipelines that react to on-chain events in real-time, powered by Somnia Native Reactivity.

Built for the **Somnia Reactivity Mini Hackathon** · Deployed on Somnia Testnet

---

## What It Does

ReactChain lets users create **reactive automation pipelines** entirely on-chain:

```
[Trigger Contract emits event] → [Reactivity SDK fires] → [Action executes on-chain]
```

No bots. No off-chain servers. No polling. Just Somnia Reactivity.

---

## How Reactivity Is Used

ReactChain uses **both layers** of the Somnia Reactivity SDK:

### 1. On-Chain (Solidity Handler)

`ActionExecutor` inherits from `SomniaEventHandler` and is registered as a Reactivity subscriber. When a watched contract emits an event, Somnia validators invoke `_onEvent` directly in the EVM:

```solidity
import { SomniaEventHandler } from "@somnia-chain/reactivity-contracts/contracts/SomniaEventHandler.sol";

contract ActionExecutor is SomniaEventHandler {
    function _onEvent(
        address emitter,
        bytes32[] calldata eventTopics,
        bytes calldata data
    ) internal override {
        // Scan active pipelines matching emitter + topic
        // Execute their registered action contracts atomically
        // Record execution count on PipelineRegistry
    }
}
```

The subscription is created via the TypeScript SDK:

```ts
import { SDK } from '@somnia-chain/reactivity';
import { parseGwei } from 'viem';

await sdk.createSoliditySubscription({
  emitter: MOCK_TRIGGER_ADDRESS,          // watch this contract
  handlerContractAddress: ACTION_EXECUTOR_ADDRESS,
  priorityFeePerGas: parseGwei('2'),
  maxFeePerGas: parseGwei('10'),
  gasLimit: 2_000_000n,
  isGuaranteed: true,   // guaranteed delivery
  isCoalesced: false,   // one invocation per event
});
```

### 2. Off-Chain (WebSocket Subscription)

The frontend uses `sdk.subscribe()` to stream `PipelineExecuted` events in real-time to the Live Log — zero polling, pure push:

```ts
import { SDK, type SubscriptionCallback } from '@somnia-chain/reactivity';

sdk.subscribe({
  ethCalls: [],
  eventContractSources: [ACTION_EXECUTOR_ADDRESS],
  onData: (data: SubscriptionCallback) => {
    // data.result.topics — event topics
    // data.result.data   — encoded event data
    // data.result.simulationResults — eth_call results
    appendToLiveLog(data);
  },
});
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Somnia Testnet                        │
│                                                         │
│  MockTrigger ──emits event──► Reactivity Precompile     │
│       (0x0100)                        │                 │
│                                       ▼                 │
│                              ActionExecutor             │
│                           (SomniaEventHandler)          │
│                                       │                 │
│                         reads pipelines from            │
│                                       ▼                 │
│                           PipelineRegistry              │
│                         (stores pipeline configs)       │
└─────────────────────────────────────────────────────────┘
                                        │
                          WebSocket (Reactivity SDK)
                                        │
                                        ▼
                              React Frontend
                           (Live Log, Dashboard)
```

## Smart Contracts

| Contract | Description |
|---|---|
| `PipelineRegistry` | Stores user pipelines: trigger contract + event topic → action contract + selector |
| `ActionExecutor` | `SomniaEventHandler` — invoked by validators, executes pipeline actions |
| `MockTrigger` | Demo event emitter with `PriceUpdated`, `ThresholdBreached`, `TokenTransferred` |

### Deployed Addresses (Somnia Testnet)

| Contract | Address |
|---|---|
| PipelineRegistry | `TBD` |
| ActionExecutor | `TBD` |
| MockTrigger | `TBD` |

---

## Running Locally

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Add deployed contract addresses to `frontend/src/utils/contracts.ts`:

```ts
export const CONTRACT_ADDRESSES = {
  PipelineRegistry: '0x...',
  ActionExecutor: '0x...',
  MockTrigger: '0x...',
};
```

### Contracts

```bash
cd contracts
npm install
npx hardhat compile
```

Deploy via Remix IDE (recommended) or:

```bash
npx hardhat run scripts/deploy.ts --network somniaTestnet
```

---

## Demo Flow

1. Connect MetaMask to Somnia Testnet
2. Create a pipeline: `MockTrigger → PriceUpdated → recordExecution`
3. Click "Price Updated" in the Trigger Simulator
4. Watch the Live Log update in real-time via Reactivity SDK WebSocket
5. See execution count increment on the Pipeline Card

---

## Tech Stack

- **Somnia Reactivity SDK** (`@somnia-chain/reactivity`) — WebSocket subscriptions + Solidity handler invocations
- **Solidity 0.8.30** — `SomniaEventHandler`, `PipelineRegistry`, `MockTrigger`
- **React + Vite + TypeScript** — Frontend
- **viem** — Contract interactions
- **Framer Motion** — Animations
- **Tailwind CSS v4** — Styling

---

## Links

- [Somnia Reactivity Docs](https://docs.somnia.network/developer/reactivity)
- [Somnia Testnet Explorer](https://shannon-explorer.somnia.network)
- [Somnia Testnet Faucet](https://docs.somnia.network/developer/network-info)
