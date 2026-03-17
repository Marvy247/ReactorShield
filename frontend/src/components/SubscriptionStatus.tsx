import { CONTRACT_ADDRESSES } from '../utils/contracts';

export function SubscriptionStatus() {
  const guardAddr = CONTRACT_ADDRESSES.LiquidationGuard;
  const lendingAddr = CONTRACT_ADDRESSES.MockLendingProtocol;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-3">
      <h3 className="font-semibold text-white">Reactivity Subscription</h3>
      <div className="space-y-2 text-sm">
        <Row label="Emitter" value={lendingAddr || 'Not deployed'} addr={lendingAddr} />
        <Row label="Handler" value={guardAddr || 'Not deployed'} addr={guardAddr} />
        <Row label="Trigger" value="LiquidationRisk + HealthFactorUpdated" />
        <Row label="Action" value="Auto collateral top-up / partial repay" />
        <Row label="Gas Limit" value="5,000,000" />
        <Row label="Guaranteed" value="Yes" />
      </div>
      <p className="text-xs text-zinc-600">
        Powered by Somnia Native Reactivity — validators invoke LiquidationGuard atomically on-chain
      </p>
    </div>
  );
}

function Row({ label, value, addr }: { label: string; value: string; addr?: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-zinc-500 shrink-0">{label}</span>
      {addr ? (
        <a
          href={`https://shannon-explorer.somnia.network/address/${addr}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs text-zinc-300 hover:text-white truncate"
        >
          {value}
        </a>
      ) : (
        <span className="font-mono text-xs text-zinc-300 truncate">{value}</span>
      )}
    </div>
  );
}
