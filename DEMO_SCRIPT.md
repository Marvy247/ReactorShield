# ReactChain — Demo Video Script

**Duration:** 2–3 minutes  
**Format:** Screen recording with voiceover

---

## [0:00–0:20] Hook

**Show:** Landing page

> "What if your smart contracts could react to each other automatically — no bots, no servers, no polling? That's ReactChain, built on Somnia Native Reactivity."

Point to the tagline and the three feature cards on the landing page.

---

## [0:20–0:45] Connect & Orient

**Show:** Click Connect Wallet → MetaMask auto-switches to Somnia Testnet → navigate to Dashboard

> "I'll connect MetaMask to Somnia Testnet."

Point to the three panels:
- Pipeline Builder
- Trigger Simulator
- Live Log — highlight the **"Listening via Reactivity SDK WebSocket"** badge

Point to the Subscription Status card:

> "This is the on-chain Reactivity subscription — registered at the precompile address 0x0100. Any event from MockTrigger will invoke our ActionExecutor handler directly in the EVM, executed by Somnia validators."

---

## [0:45–1:15] Create a Pipeline

**Show:** Pipeline Builder

> "I'll create a pipeline. Trigger: MockTrigger. Event: PriceUpdated. Action: ActionLogger.execute() — a real on-chain contract that permanently records each reaction."

- Type pipeline name: **"Price Alert Guard"**
- Click **Create Pipeline On-Chain**
- Show MetaMask popup → confirm
- Show the Pipeline Card appear with **0 executions**

---

## [1:15–1:50] Fire the Trigger — The Money Shot

**Show:** Trigger Simulator

> "Now I'll simulate a price update. Watch the Live Log."

- Click **Price Updated**
- Confirm the MetaMask tx
- Within seconds — Live Log lights up with: `Pipeline #0 executed ✅`

> "Sub-second. Trustless. No backend."

- Show the Pipeline Card **execution count tick up automatically**

> "That reaction was triggered by Somnia validators invoking our Solidity handler on-chain. The frontend received it via WebSocket — zero polling."

---

## [1:50–2:20] Chain Reaction — Second Pipeline

**Show:** Pipeline Builder again

> "Let me show cross-contract chaining. I'll create a second pipeline on ThresholdBreached."

- Create pipeline: **"Risk Guard"** → ThresholdBreached
- Click **Threshold Breached** in the Trigger Simulator
- Show **both** pipeline cards update simultaneously
- Show two entries in the Live Log firing back to back

---

## [2:20–2:40] On-Chain Proof

**Show:** Somnia Testnet Explorer

> "Everything is verifiable on-chain."

- Open ActionLogger on the explorer — show the permanent log entries written on-chain
- Show the Reactivity subscription transaction
- Show ActionExecutor contract — point out it's a `SomniaEventHandler`

---

## [2:40–3:00] Close

**Show:** Landing page / Dashboard

> "ReactChain is public infrastructure — any protocol on Somnia can plug in a trigger and an action. DeFi guards, cross-contract orchestration, on-chain alerts — all trustless, all reactive, all sub-second."

> "This is what Somnia Reactivity makes possible."

---

## Recording Checklist

- [ ] Browser zoom at 110% for readability
- [ ] MetaMask already connected before recording
- [ ] At least one pipeline pre-created to show execution count incrementing
- [ ] Somnia explorer tabs pre-opened for ActionLogger and subscription tx
- [ ] Microphone tested, no background noise
