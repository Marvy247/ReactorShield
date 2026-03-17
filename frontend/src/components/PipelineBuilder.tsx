import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePipelines } from '../hooks/usePipelines';
import { CONTRACT_ADDRESSES } from '../utils/contracts';
import { keccak256, toBytes, toFunctionSelector, type Address } from 'viem';
import toast from 'react-hot-toast';

const TRIGGER_EVENTS = [
  { label: 'PriceUpdated', sig: 'PriceUpdated(address,uint256,uint256)' },
  { label: 'ThresholdBreached', sig: 'ThresholdBreached(address,uint256,string)' },
  { label: 'TokenTransferred', sig: 'TokenTransferred(address,address,uint256)' },
];

const ACTION_SELECTOR = toFunctionSelector('execute()');

export function PipelineBuilder({ onCreated }: { onCreated: () => void }) {
  const { createPipeline } = usePipelines();
  const [label, setLabel] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(TRIGGER_EVENTS[0]);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!label.trim()) { toast.error('Give your pipeline a name'); return; }
    if (!CONTRACT_ADDRESSES.MockTrigger || !CONTRACT_ADDRESSES.ActionLogger) {
      toast.error('Contract addresses not set — deploy ActionLogger first'); return;
    }
    setLoading(true);
    try {
      const topic = keccak256(toBytes(selectedEvent.sig));
      await createPipeline(
        CONTRACT_ADDRESSES.MockTrigger as Address,
        topic,
        CONTRACT_ADDRESSES.ActionLogger as Address,
        ACTION_SELECTOR,
        label.trim()
      );
      toast.success('Pipeline created on-chain!');
      setLabel('');
      onCreated();
    } catch (e: unknown) {
      toast.error((e as Error).message ?? 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl border border-app-border p-6 space-y-5"
    >
      <h3 className="font-display font-semibold text-lg text-text-main">Create Pipeline</h3>

      <div className="flex items-center gap-3 text-sm">
        <div className="flex-1 p-3 rounded-xl bg-accent-indigo/5 border border-accent-indigo/20 text-center">
          <div className="text-xs text-text-pale mb-1">TRIGGER</div>
          <div className="font-mono text-accent-indigo text-xs truncate">MockTrigger</div>
        </div>
        <div className="text-accent-indigo font-bold text-lg">→</div>
        <div className="flex-1 p-3 rounded-xl bg-accent-gold/5 border border-accent-gold/20 text-center">
          <div className="text-xs text-text-pale mb-1">EVENT</div>
          <select
            value={selectedEvent.sig}
            onChange={e => setSelectedEvent(TRIGGER_EVENTS.find(t => t.sig === e.target.value)!)}
            className="bg-transparent text-accent-gold text-xs font-mono w-full text-center focus:outline-none cursor-pointer"
          >
            {TRIGGER_EVENTS.map(t => (
              <option key={t.sig} value={t.sig}>{t.label}</option>
            ))}
          </select>
        </div>
        <div className="text-accent-indigo font-bold text-lg">→</div>
        <div className="flex-1 p-3 rounded-xl bg-accent-emerald/5 border border-accent-emerald/20 text-center">
          <div className="text-xs text-text-pale mb-1">ACTION</div>
          <div className="font-mono text-accent-emerald text-xs truncate">ActionLogger.execute()</div>
        </div>
      </div>

      <input
        className="input-premium"
        placeholder="Pipeline name (e.g. Price Alert Guard)"
        value={label}
        onChange={e => setLabel(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleCreate()}
      />

      <button onClick={handleCreate} disabled={loading} className="btn-primary w-full">
        {loading ? 'Deploying pipeline…' : '⚡ Create Pipeline On-Chain'}
      </button>
    </motion.div>
  );
}
