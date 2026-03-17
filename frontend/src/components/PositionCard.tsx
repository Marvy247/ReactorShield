import { type Position } from '../hooks/usePositions';

const RISK_COLORS: Record<Position['riskLevel'], string> = {
  safe: 'text-emerald-400 border-emerald-800 bg-emerald-950/40',
  warning: 'text-yellow-400 border-yellow-800 bg-yellow-950/40',
  critical: 'text-orange-400 border-orange-800 bg-orange-950/40',
  liquidatable: 'text-red-400 border-red-800 bg-red-950/40',
};

const RISK_LABELS: Record<Position['riskLevel'], string> = {
  safe: 'Safe',
  warning: 'Warning',
  critical: 'Critical',
  liquidatable: 'Liquidatable',
};

function HealthBar({ hf }: { hf: number }) {
  const pct = Math.min((hf / 2.5) * 100, 100);
  const color = hf >= 1.5 ? 'bg-emerald-500' : hf >= 1.15 ? 'bg-yellow-500' : hf >= 1.0 ? 'bg-orange-500' : 'bg-red-500';
  return (
    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function PositionCard({ position }: { position: Position }) {
  const colorClass = RISK_COLORS[position.riskLevel];
  const hfDisplay = position.healthFactor >= 99 ? '∞' : position.healthFactor.toFixed(2);

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${colorClass}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">{position.assetSymbol}</span>
          <span className="text-xs px-2 py-0.5 rounded-full border border-current opacity-70">#{position.id}</span>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full border border-current`}>
          {RISK_LABELS[position.riskLevel]}
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-zinc-400">
          <span>Health Factor</span>
          <span className="font-mono font-bold text-base" style={{ color: 'inherit' }}>{hfDisplay}</span>
        </div>
        <HealthBar hf={position.healthFactor} />
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
        <div>
          <div className="text-zinc-500">Collateral</div>
          <div className="font-mono text-zinc-200">{(Number(position.collateralAmount) / 1e18).toFixed(4)} {position.assetSymbol}</div>
        </div>
        <div>
          <div className="text-zinc-500">Debt</div>
          <div className="font-mono text-zinc-200">{(Number(position.debtAmount) / 1e18).toFixed(4)} USD</div>
        </div>
      </div>

      {position.riskLevel !== 'safe' && (
        <div className="text-xs opacity-70 flex items-center gap-1">
          <span>🛡️</span>
          <span>ReactorShield guard active — auto-protection enabled</span>
        </div>
      )}
    </div>
  );
}
