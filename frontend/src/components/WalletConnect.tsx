import { useWeb3 } from '../context/Web3Context';

export function WalletConnect() {
  const { address, connect, disconnect, isConnecting } = useWeb3();

  if (address) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-emerald-400 font-mono">{address.slice(0, 6)}…{address.slice(-4)}</span>
        <button onClick={disconnect} className="px-3 py-1.5 text-sm rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={isConnecting}
      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors disabled:opacity-50"
    >
      {isConnecting ? 'Connecting…' : 'Connect Wallet'}
    </button>
  );
}
