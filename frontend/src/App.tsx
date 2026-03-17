import { Web3Provider } from './context/Web3Context';
import { WalletConnect } from './components/WalletConnect';
import { PositionCard } from './components/PositionCard';
import { ScenarioSimulator } from './components/ScenarioSimulator';
import { LiveLog } from './components/LiveLog';
import { SubscriptionStatus } from './components/SubscriptionStatus';
import { usePositions } from './hooks/usePositions';
import { useLiveLog } from './hooks/useLiveLog';
import { useWeb3 } from './context/Web3Context';

function Dashboard() {
  const { address } = useWeb3();
  const { logs, isListening, clearLogs } = useLiveLog();
  const { positions, loading } = usePositions();

  const atRisk = positions.filter(p => p.riskLevel !== 'safe').length;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛡️</span>
          <div>
            <h1 className="font-bold text-lg leading-none">ReactorShield</h1>
            <p className="text-xs text-zinc-500">Predictive On-Chain DeFi Guardian</p>
          </div>
        </div>
        <WalletConnect />
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Stats bar */}
        {address && (
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Positions" value={positions.length.toString()} sub="open" />
            <StatCard label="At Risk" value={atRisk.toString()} sub="need attention" accent={atRisk > 0 ? 'orange' : undefined} />
            <StatCard label="Guard Events" value={logs.length.toString()} sub="total" />
          </div>
        )}

        {!address && <Landing />}

        {address && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: positions */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="font-semibold text-zinc-300">Your Positions</h2>
              {loading && positions.length === 0 && (
                <div className="text-zinc-600 text-sm">Loading positions…</div>
              )}
              {!loading && positions.length === 0 && (
                <div className="rounded-xl border border-zinc-800 p-8 text-center text-zinc-600 text-sm">
                  No open positions — use the simulator to open one
                </div>
              )}
              {positions.map(p => <PositionCard key={p.id} position={p} />)}
            </div>

            {/* Right: controls + log */}
            <div className="space-y-4">
              <ScenarioSimulator />
              <SubscriptionStatus />
            </div>
          </div>
        )}

        {address && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-zinc-300">Live Guard Feed</h2>
              {logs.length > 0 && (
                <button onClick={clearLogs} className="text-xs text-zinc-600 hover:text-zinc-400">Clear</button>
              )}
            </div>
            <LiveLog logs={logs} isListening={isListening} />
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: string }) {
  const color = accent === 'orange' ? 'text-orange-400' : 'text-white';
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-zinc-400">{label}</div>
      <div className="text-xs text-zinc-600">{sub}</div>
    </div>
  );
}

function Landing() {
  return (
    <div className="text-center py-16 space-y-4">
      <div className="text-5xl">🛡️</div>
      <h2 className="text-3xl font-bold">ReactorShield</h2>
      <p className="text-zinc-400 max-w-lg mx-auto">
        Trustless DeFi liquidation guardian powered by Somnia Native Reactivity.
        When your health factor drops, the on-chain guard fires automatically — no bots, no polling.
      </p>
      <div className="flex justify-center gap-6 text-sm text-zinc-500 pt-2">
        <span>⚡ Sub-second reaction</span>
        <span>🔒 Fully on-chain</span>
        <span>🤖 Zero manual intervention</span>
      </div>
      <p className="text-zinc-600 text-sm pt-4">Connect your wallet to get started</p>
    </div>
  );
}

export default function App() {
  return (
    <Web3Provider>
      <Dashboard />
    </Web3Provider>
  );
}
