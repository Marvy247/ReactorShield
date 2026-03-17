import { useWeb3 } from '../context/Web3Context';
import { somniaTestnet } from '../context/Web3Context';

export function WalletConnect() {
  const { address, connect, disconnect, isConnecting } = useWeb3();

  return address ? (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-4 py-2 glass rounded-xl border border-app-border">
        <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
        <span className="text-sm font-mono text-text-dim">
          {address.slice(0, 6)}…{address.slice(-4)}
        </span>
        <a
          href={`${somniaTestnet.blockExplorers.default.url}/address/${address}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-accent-indigo hover:underline"
        >
          ↗
        </a>
      </div>
      <button onClick={disconnect} className="btn-ghost text-sm">Disconnect</button>
    </div>
  ) : (
    <button onClick={connect} disabled={isConnecting} className="btn-primary text-sm py-2.5 px-6">
      {isConnecting ? 'Connecting…' : 'Connect Wallet'}
    </button>
  );
}
