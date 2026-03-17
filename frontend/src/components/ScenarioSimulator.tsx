import { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { CONTRACT_ADDRESSES, LENDING_PROTOCOL_ABI, MOCK_ASSETS } from '../utils/contracts';
import { parseEther } from 'viem';

const SCENARIOS = [
  {
    label: 'Open Safe Position',
    description: 'ETH collateral, healthy health factor ~2.0',
    action: 'openPosition',
    args: () => [MOCK_ASSETS.ETH, parseEther('2'), parseEther('1')],
    color: 'emerald',
  },
  {
    label: 'Simulate Price Drop 30%',
    description: 'ETH drops → health factor falls to ~1.4',
    action: 'simulatePriceDrop',
    args: () => [MOCK_ASSETS.ETH, parseEther('0.7')],
    color: 'yellow',
  },
  {
    label: 'Simulate Price Crash 50%',
    description: 'ETH crashes → triggers LiquidationRisk → guard auto-protects',
    action: 'simulatePriceDrop',
    args: () => [MOCK_ASSETS.ETH, parseEther('0.5')],
    color: 'orange',
  },
  {
    label: 'Critical Crash 70%',
    description: 'Severe crash → immediate liquidation risk → reactive guard fires',
    action: 'simulatePriceDrop',
    args: () => [MOCK_ASSETS.ETH, parseEther('0.3')],
    color: 'red',
  },
] as const;

const COLOR_MAP: Record<string, string> = {
  emerald: 'border-emerald-700 hover:bg-emerald-900/30 text-emerald-300',
  yellow: 'border-yellow-700 hover:bg-yellow-900/30 text-yellow-300',
  orange: 'border-orange-700 hover:bg-orange-900/30 text-orange-300',
  red: 'border-red-700 hover:bg-red-900/30 text-red-300',
};

export function ScenarioSimulator({ onAction }: { onAction?: () => void }) {
  const { walletClient, address } = useWeb3();
  const [loading, setLoading] = useState<string | null>(null);
  const [lastTx, setLastTx] = useState<string | null>(null);

  async function run(scenario: typeof SCENARIOS[number]) {
    if (!walletClient || !address || !CONTRACT_ADDRESSES.MockLendingProtocol) return;
    setLoading(scenario.label);
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESSES.MockLendingProtocol,
        abi: LENDING_PROTOCOL_ABI,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        functionName: scenario.action as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        args: scenario.args() as any,
        account: address,
        chain: undefined,
      });
      setLastTx(hash);
      onAction?.();
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-4">
      <div>
        <h3 className="font-semibold text-white">Scenario Simulator</h3>
        <p className="text-xs text-zinc-500 mt-0.5">Fire on-chain events to trigger the reactive guard</p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {SCENARIOS.map((s) => (
          <button
            key={s.label}
            onClick={() => run(s)}
            disabled={!!loading || !address || !CONTRACT_ADDRESSES.MockLendingProtocol}
            className={`text-left px-4 py-3 rounded-lg border transition-colors disabled:opacity-40 ${COLOR_MAP[s.color]}`}
          >
            <div className="font-medium text-sm">{loading === s.label ? 'Sending…' : s.label}</div>
            <div className="text-xs opacity-60 mt-0.5">{s.description}</div>
          </button>
        ))}
      </div>

      {lastTx && (
        <a
          href={`https://shannon-explorer.somnia.network/tx/${lastTx}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-xs text-zinc-500 hover:text-zinc-300 font-mono truncate"
        >
          Last tx: {lastTx}
        </a>
      )}

      {!CONTRACT_ADDRESSES.MockLendingProtocol && (
        <p className="text-xs text-zinc-600">Deploy contracts and update addresses to enable simulator</p>
      )}
    </div>
  );
}
