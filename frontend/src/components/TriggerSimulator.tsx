import { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { CONTRACT_ADDRESSES, MOCK_TRIGGER_ABI } from '../utils/contracts';
import { type Address } from 'viem';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const TRIGGERS = [
  {
    label: 'Price Updated',
    description: 'Simulate an oracle price change',
    emoji: '📈',
    fn: 'updatePrice',
    color: 'accent-indigo',
  },
  {
    label: 'Threshold Breached',
    description: 'Simulate a risk threshold breach',
    emoji: '⚠️',
    fn: 'breachThreshold',
    color: 'accent-gold',
  },
  {
    label: 'Token Transferred',
    description: 'Simulate a token transfer event',
    emoji: '💸',
    fn: 'transferToken',
    color: 'accent-emerald',
  },
];

export function TriggerSimulator() {
  const { walletClient, publicClient, address } = useWeb3();
  const [loading, setLoading] = useState<string | null>(null);

  const fire = async (fn: string) => {
    if (!walletClient || !publicClient || !address) { toast.error('Connect wallet first'); return; }
    if (!CONTRACT_ADDRESSES.MockTrigger) { toast.error('MockTrigger address not set'); return; }
    setLoading(fn);
    try {
      let args: unknown[];
      if (fn === 'updatePrice') args = [address, BigInt(Math.floor(Math.random() * 100000))];
      else if (fn === 'breachThreshold') args = [BigInt(Math.floor(Math.random() * 1000)), 'Demo breach'];
      else args = [address, BigInt(Math.floor(Math.random() * 1000))];

      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESSES.MockTrigger as Address,
        abi: MOCK_TRIGGER_ABI,
        functionName: fn as 'updatePrice' | 'breachThreshold' | 'transferToken',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        args: args as any,
        account: address,
        chain: walletClient.chain,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      toast.success(`Event fired! Watch the Live Log ⚡`);
    } catch (e: unknown) {
      toast.error((e as Error).message ?? 'Transaction failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="glass rounded-2xl border border-app-border p-6">
      <div className="mb-4">
        <h3 className="font-display font-semibold text-lg text-text-main">Trigger Simulator</h3>
        <p className="text-sm text-text-pale mt-1">Fire on-chain events to watch your pipelines react in real-time</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TRIGGERS.map((t) => (
          <motion.button
            key={t.fn}
            whileTap={{ scale: 0.97 }}
            onClick={() => fire(t.fn)}
            disabled={!!loading}
            className="p-4 rounded-xl border border-app-border hover:border-accent-indigo/30 hover:bg-app-hover transition-all text-left disabled:opacity-50"
          >
            <div className="text-2xl mb-2">{t.emoji}</div>
            <div className="font-semibold text-sm text-text-main mb-1">{t.label}</div>
            <div className="text-xs text-text-pale">{t.description}</div>
            {loading === t.fn && (
              <div className="mt-2 text-xs text-accent-indigo animate-pulse">Sending tx…</div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
