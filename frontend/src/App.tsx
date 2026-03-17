import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';
import { Toaster } from 'react-hot-toast';
import { Web3Provider } from './context/Web3Context';
import { WalletConnect } from './components/WalletConnect';
import { PipelineBuilder } from './components/PipelineBuilder';
import { PipelineCard } from './components/PipelineCard';
import { LiveLog } from './components/LiveLog';
import { TriggerSimulator } from './components/TriggerSimulator';
import { usePipelines } from './hooks/usePipelines';
import { useWeb3 } from './context/Web3Context';
import { useEffect } from 'react';

const navLinks = [
  { path: '/dashboard', label: 'Dashboard', icon: '⚡' },
  { path: '/about', label: 'How It Works', icon: '📖' },
];

function Navigation() {
  const location = useLocation();
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
      <div className="glass rounded-2xl px-6 py-4 border border-app-border shadow-floating flex items-center justify-between">
        <Link to="/" className="flex items-center group">
          <span className="font-display font-bold text-xl tracking-tight text-text-main group-hover:text-accent-indigo transition-colors">
            React<span className="text-accent-indigo">Chain</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link key={link.path} to={link.path}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive ? 'bg-accent-indigo text-white shadow-premium' : 'text-text-dim hover:text-accent-indigo hover:bg-app-hover'}`}>
                {link.icon} {link.label}
              </Link>
            );
          })}
        </div>
        <WalletConnect />
      </div>
    </nav>
  );
}

function LandingPage() {
  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-indigo/10 text-accent-indigo text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-accent-indigo animate-pulse" />
            Built on Somnia Reactivity — Testnet
          </div>
          <h1 className="font-serif font-bold text-6xl md:text-7xl tracking-tighter text-text-main mb-6">
            On-Chain Automation,
            <br />
            <span className="italic text-accent-indigo">Truly Reactive</span>
          </h1>
          <p className="text-xl text-text-dim max-w-2xl mx-auto mb-10">
            Create trustless automation pipelines that react to on-chain events in real-time — no bots, no off-chain servers, no polling. Just Somnia Reactivity.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/dashboard" className="btn-primary">Launch App →</Link>
            <a href="https://docs.somnia.network/developer/reactivity" target="_blank" rel="noreferrer" className="btn-secondary">Read Docs</a>
          </div>
        </motion.div>

        {/* Feature grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: '⚡', title: 'Sub-Second Reactions', desc: 'Somnia\'s 1M+ TPS means your pipelines fire before you blink. No lag, no missed events.' },
            { icon: '🔗', title: 'Cross-Contract Chaining', desc: 'One event triggers another contract, which can trigger another. Compose complex automation on-chain.' },
            { icon: '🛡️', title: 'Fully Trustless', desc: 'No keepers, no bots, no centralized servers. Validators execute your handlers directly on-chain.' },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="card-premium text-center">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-text-dim text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* How it works */}
        <div className="glass rounded-3xl border border-app-border p-10 text-center">
          <h2 className="font-serif font-bold text-3xl mb-8">How a Pipeline Works</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            {[
              { step: '1', label: 'Contract emits event', sub: 'Any on-chain event on Somnia' },
              { step: '→', label: '', sub: '' },
              { step: '2', label: 'Reactivity SDK fires', sub: 'Validators invoke your handler' },
              { step: '→', label: '', sub: '' },
              { step: '3', label: 'Action executes', sub: 'On-chain, atomic, trustless' },
            ].map((s, i) => s.step === '→' ? (
              <span key={i} className="text-2xl text-accent-indigo font-bold hidden md:block">→</span>
            ) : (
              <div key={i} className="flex-1 p-5 rounded-2xl bg-accent-indigo/5 border border-accent-indigo/10">
                <div className="text-2xl font-bold text-accent-indigo mb-2">{s.step}</div>
                <div className="font-semibold text-text-main text-sm">{s.label}</div>
                <div className="text-xs text-text-pale mt-1">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { address } = useWeb3();
  const { pipelines, loading, fetchPipelines, togglePipeline } = usePipelines();

  useEffect(() => { if (address) fetchPipelines(); }, [address, fetchPipelines]);

  return (
    <div className="space-y-8">
      {!address ? (
        <div className="glass rounded-2xl border border-app-border p-12 text-center">
          <div className="text-5xl mb-4">🔌</div>
          <h3 className="font-serif font-bold text-2xl mb-2">Connect your wallet</h3>
          <p className="text-text-dim">Connect to Somnia Testnet to create and manage your reactive pipelines</p>
        </div>
      ) : (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            <PipelineBuilder onCreated={fetchPipelines} />
            <TriggerSimulator />
          </div>

          <LiveLog />

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-lg">Your Pipelines</h3>
              <button onClick={fetchPipelines} className="btn-ghost text-sm">↻ Refresh</button>
            </div>
            {loading ? (
              <div className="text-center py-12 text-text-pale">Loading pipelines…</div>
            ) : pipelines.length === 0 ? (
              <div className="glass rounded-2xl border border-app-border p-10 text-center text-text-pale">
                No pipelines yet — create your first one above
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {pipelines.map(p => (
                  <PipelineCard key={p.id} pipeline={p} onToggle={togglePipeline} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function About() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="glass rounded-2xl border border-app-border p-8">
        <h2 className="font-serif font-bold text-3xl mb-4">What is ReactChain?</h2>
        <p className="text-text-dim leading-relaxed mb-4">
          ReactChain is a visual on-chain automation protocol built on Somnia's native Reactivity SDK. It lets you compose reactive pipelines — "when contract X emits event Y, call function Z on contract W" — entirely on-chain, with no off-chain infrastructure.
        </p>
        <p className="text-text-dim leading-relaxed">
          Think of it as Zapier for Somnia: a public good that any developer or user can use to automate on-chain logic, powered by Somnia's sub-second finality and 1M+ TPS.
        </p>
      </div>
      <div className="glass rounded-2xl border border-app-border p-8">
        <h2 className="font-serif font-bold text-2xl mb-4">Reactivity SDK Integration</h2>
        <p className="text-text-dim mb-4">ReactChain uses both layers of the Somnia Reactivity SDK:</p>
        <ul className="space-y-3 text-sm text-text-dim">
          <li className="flex gap-3"><span className="text-accent-indigo font-bold shrink-0">On-chain</span><span><code className="bg-app-hover px-1.5 py-0.5 rounded text-xs">ActionExecutor</code> inherits <code className="bg-app-hover px-1.5 py-0.5 rounded text-xs">SomniaEventHandler</code> and is invoked by validators when subscribed events fire. It reads active pipelines from <code className="bg-app-hover px-1.5 py-0.5 rounded text-xs">PipelineRegistry</code> and executes their actions atomically.</span></li>
          <li className="flex gap-3"><span className="text-accent-indigo font-bold shrink-0">Off-chain</span><span>The frontend uses <code className="bg-app-hover px-1.5 py-0.5 rounded text-xs">sdk.subscribe()</code> with a WebSocket connection to stream <code className="bg-app-hover px-1.5 py-0.5 rounded text-xs">PipelineExecuted</code> events in real-time to the Live Log — zero polling.</span></li>
        </ul>
      </div>
      <div className="glass rounded-2xl border border-app-border p-8">
        <h2 className="font-serif font-bold text-2xl mb-4">Contracts on Somnia Testnet</h2>
        <div className="space-y-2 font-mono text-sm">
          {[
            { name: 'PipelineRegistry', desc: 'Stores pipeline configs' },
            { name: 'ActionExecutor', desc: 'SomniaEventHandler — executes actions' },
            { name: 'MockTrigger', desc: 'Demo event emitter' },
          ].map(c => (
            <div key={c.name} className="flex items-center justify-between p-3 bg-app-hover rounded-xl">
              <span className="text-accent-indigo">{c.name}</span>
              <span className="text-text-pale text-xs">{c.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="pt-44 pb-24 px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">{children}</div>
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<PageWrapper><Dashboard /></PageWrapper>} />
        <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Web3Provider>
      <BrowserRouter>
        <Analytics />
        <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'Outfit, sans-serif' } }} />
        <div className="min-h-screen bg-app-bg grid-subtle selection:bg-accent-indigo/10 selection:text-accent-indigo">
          <Navigation />
          <main className="relative"><AnimatedRoutes /></main>
          <footer className="border-t border-app-border py-12 px-6 bg-white">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
              <span className="font-display font-bold text-xl tracking-tight">
                React<span className="text-accent-indigo">Chain</span>
              </span>
              <p className="text-sm text-text-pale">On-Chain Reactive Automation · Built on Somnia Testnet</p>
              <a href="https://docs.somnia.network/developer/reactivity" target="_blank" rel="noreferrer"
                className="text-sm text-accent-indigo hover:underline">Somnia Reactivity Docs ↗</a>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </Web3Provider>
  );
}

export default App;
