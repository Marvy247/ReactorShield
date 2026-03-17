import { motion, AnimatePresence } from 'framer-motion';
import { useLiveLog } from '../hooks/useLiveLog';

interface Props {
  onExecution?: () => void;
}

export function LiveLog({ onExecution }: Props) {
  const { logs, isListening, clearLogs } = useLiveLog(onExecution);

  return (
    <div className="glass rounded-2xl border border-app-border overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-app-border">
        <div className="flex items-center gap-3">
          <span className="font-display font-semibold text-text-main">Live Execution Log</span>
          <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${isListening ? 'bg-accent-emerald/10 text-accent-emerald' : 'bg-app-hover text-text-pale'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isListening ? 'bg-accent-emerald animate-pulse' : 'bg-text-pale'}`} />
            {isListening ? 'Listening via Reactivity SDK WebSocket' : 'Not connected'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-pale">{logs.length} executions</span>
          {logs.length > 0 && <button onClick={clearLogs} className="btn-ghost text-xs py-1.5 px-3">Clear</button>}
        </div>
      </div>

      <div className="h-80 overflow-y-auto p-4 space-y-2 bg-gray-950/[0.02]">
        <AnimatePresence initial={false}>
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-text-pale gap-2">
              <span className="text-3xl">⚡</span>
              <span className="font-medium">Waiting for pipeline executions…</span>
              <span className="text-xs opacity-60">Fire a trigger below to see it react here in real-time</span>
            </div>
          ) : (
            logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${log.success ? 'bg-accent-emerald/5 border-accent-emerald/20' : 'bg-red-50 border-red-200'}`}
              >
                <span className="text-lg shrink-0">{log.success ? '✅' : '❌'}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-text-main">Pipeline #{log.pipelineId}</span>
                    <span className="text-text-pale">executed</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-medium ${log.success ? 'bg-accent-emerald/10 text-accent-emerald' : 'bg-red-100 text-red-600'}`}>
                      {log.success ? 'success' : 'failed'}
                    </span>
                  </div>
                  <div className="text-xs text-text-dim mt-1 font-mono truncate">
                    action → {log.actionContract}
                  </div>
                </div>
                <span className="text-xs text-text-pale shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
