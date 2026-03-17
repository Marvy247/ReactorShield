import { motion } from 'framer-motion';
import { type Pipeline } from '../hooks/usePipelines';
import { somniaTestnet } from '../context/Web3Context';

interface Props {
  pipeline: Pipeline;
  onToggle: (id: number) => void;
}

export function PipelineCard({ pipeline, onToggle }: Props) {
  const explorerBase = somniaTestnet.blockExplorers.default.url;
  const lastRun = pipeline.lastExecutedAt > 0n
    ? new Date(Number(pipeline.lastExecutedAt) * 1000).toLocaleString()
    : 'Never';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card-premium transition-all ${pipeline.isActive ? '' : 'opacity-60'}`}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h4 className="font-semibold text-text-main">{pipeline.label}</h4>
          <span className="text-xs text-text-pale">Pipeline #{pipeline.id}</span>
        </div>
        <button
          onClick={() => onToggle(pipeline.id)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            pipeline.isActive
              ? 'bg-accent-emerald/10 text-accent-emerald hover:bg-accent-emerald/20'
              : 'bg-app-hover text-text-pale hover:bg-app-border'
          }`}
        >
          {pipeline.isActive ? '● Active' : '○ Paused'}
        </button>
      </div>

      {/* Flow */}
      <div className="flex items-center gap-2 text-xs mb-4 overflow-hidden">
        <a href={`${explorerBase}/address/${pipeline.triggerContract}`} target="_blank" rel="noreferrer"
          className="font-mono text-accent-indigo hover:underline truncate max-w-[100px]">
          {pipeline.triggerContract.slice(0, 8)}…
        </a>
        <span className="text-text-pale shrink-0">emits</span>
        <span className="font-mono text-accent-gold truncate max-w-[80px]">{pipeline.eventTopic.slice(0, 10)}…</span>
        <span className="text-text-pale shrink-0">→</span>
        <a href={`${explorerBase}/address/${pipeline.actionContract}`} target="_blank" rel="noreferrer"
          className="font-mono text-accent-emerald hover:underline truncate max-w-[100px]">
          {pipeline.actionContract.slice(0, 8)}…
        </a>
      </div>

      <div className="flex items-center justify-between text-xs text-text-pale border-t border-app-border pt-3">
        <span>⚡ {pipeline.executionCount.toString()} executions</span>
        <span>Last: {lastRun}</span>
      </div>
    </motion.div>
  );
}
