import { motion, AnimatePresence } from 'framer-motion';
import { useLiveLog } from '../hooks/useLiveLog';

export function LiveLog() {
  const { logs, isListening, clearLogs } = useLiveLog();

  return (
    <div className="glass rounded-2xl border border-app-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-app-border">
        <div className="flex items-center gap-3">
          <span className="font-display font-semibold text-text-main">Live Execution Log</span>
          <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${isListening ? 'bg-accent-emerald/10 text-accent-emerald' : 'bg-app-hover text-text-pale'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isListening ? 'bg-accent-emerald animate-pulse' : 'bg-text-pale'}`} />
            {isListening ? 'Listening via Reactivity SDK' : 'Not connected'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-pale">{logs.length} events</span>
          {logs.length > 0 && (
            <button onClick={clearLogs} className="btn-ghost text-xs py-1.5 px-3">Clear</button>
          )}
        </div>
      </div>

      {/* Log entries */}
      <div className="h-80 overflow-y-auto font-mono text-xs p-4 space-y-2 bg-gray-950/[0.02]">
        <AnimatePresence initial={false}>
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-text-pale gap-2">
              <span className="text-3xl">⚡</span>
              <span>Waiting for pipeline executions…</span>
              <span className="text-xs opacity-60">Trigger an event to see it fire here in real-time</span>
            </div>
          ) : (
            logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className="flex gap-3 p-3 rounded-xl bg-accent-indigo/5 border border-accent-indigo/10"
              >
                <span className="text-accent-emerald shrink-0">▶</span>
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-accent-indigo font-semibold">PipelineExecuted</span>
                    <span className="text-text-pale">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-text-dim truncate">topic[0]: {log.topics[0] ?? '—'}</div>
                  {log.topics[1] && <div className="text-text-pale truncate">pipelineId: {BigInt(log.topics[1]).toString()}</div>}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
