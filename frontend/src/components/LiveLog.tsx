import { type GuardEvent } from '../hooks/useLiveLog';

const TYPE_CONFIG: Record<GuardEvent['type'], { icon: string; label: string; color: string }> = {
  GuardTriggered: { icon: '🛡️', label: 'Guard Triggered', color: 'text-emerald-400' },
  GuardFailed:    { icon: '❌', label: 'Guard Failed',    color: 'text-red-400' },
  LiquidationRisk:{ icon: '⚠️', label: 'Liquidation Risk', color: 'text-orange-400' },
  PositionProtected: { icon: '✅', label: 'Position Protected', color: 'text-emerald-300' },
};

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  return `${Math.floor(s / 60)}m ago`;
}

export function LiveLog({ logs, isListening }: { logs: GuardEvent[]; isListening: boolean }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white">Reactive Guard Log</h3>
        <div className="flex items-center gap-1.5 text-xs">
          <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
          <span className="text-zinc-400">{isListening ? 'Listening' : 'Offline'}</span>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-8 text-zinc-600 text-sm">
          No events yet — fire a scenario to see the guard react
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {logs.map((log) => {
            const cfg = TYPE_CONFIG[log.type];
            return (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 text-sm">
                <span className="text-base mt-0.5">{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${cfg.color}`}>{cfg.label}</span>
                    <span className="text-zinc-600 text-xs">Position #{log.positionId}</span>
                  </div>
                  {log.action && <div className="text-xs text-zinc-400 mt-0.5">Action: <span className="font-mono text-zinc-300">{log.action}</span></div>}
                  {log.healthFactor !== undefined && (
                    <div className="text-xs text-zinc-400 mt-0.5">HF: <span className="font-mono text-zinc-300">{log.healthFactor.toFixed(3)}</span></div>
                  )}
                  {log.reason && <div className="text-xs text-red-400 mt-0.5">{log.reason}</div>}
                </div>
                <span className="text-xs text-zinc-600 shrink-0">{timeAgo(log.timestamp)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
