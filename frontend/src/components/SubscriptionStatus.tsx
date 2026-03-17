import { useEffect, useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { CONTRACT_ADDRESSES } from '../utils/contracts';
import { somniaTestnet } from '../context/Web3Context';

const SUBSCRIPTION_TX = '0xc83f46bf872ad2f91ebc3d61bc1cb315e114bd68c5112ff28f8f775652c3c3f3';

export function SubscriptionStatus() {
  const { publicClient } = useWeb3();
  const [blockNumber, setBlockNumber] = useState<string | null>(null);

  useEffect(() => {
    if (!publicClient) return;
    publicClient.getBlockNumber().then(n => setBlockNumber(n.toString()));
  }, [publicClient]);

  const explorerBase = somniaTestnet.blockExplorers.default.url;

  return (
    <div className="glass rounded-2xl border border-app-border p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="font-display font-semibold text-text-main">Reactivity Subscription</span>
        <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-accent-emerald/10 text-accent-emerald font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
          Active
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between items-center py-2 border-b border-app-border">
          <span className="text-text-pale">Watching</span>
          <a href={`${explorerBase}/address/${CONTRACT_ADDRESSES.MockTrigger}`} target="_blank" rel="noreferrer"
            className="font-mono text-accent-indigo hover:underline">
            MockTrigger ↗
          </a>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-app-border">
          <span className="text-text-pale">Handler</span>
          <a href={`${explorerBase}/address/${CONTRACT_ADDRESSES.ActionExecutor}`} target="_blank" rel="noreferrer"
            className="font-mono text-accent-indigo hover:underline">
            ActionExecutor ↗
          </a>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-app-border">
          <span className="text-text-pale">Type</span>
          <span className="font-mono text-text-dim">Guaranteed · Non-coalesced</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-app-border">
          <span className="text-text-pale">Precompile</span>
          <span className="font-mono text-text-dim">0x0100</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-app-border">
          <span className="text-text-pale">Setup Tx</span>
          <a href={`${explorerBase}/tx/${SUBSCRIPTION_TX}`} target="_blank" rel="noreferrer"
            className="font-mono text-accent-indigo hover:underline">
            {SUBSCRIPTION_TX.slice(0, 10)}… ↗
          </a>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-text-pale">Latest Block</span>
          <span className="font-mono text-text-dim">{blockNumber ?? '…'}</span>
        </div>
      </div>
    </div>
  );
}
