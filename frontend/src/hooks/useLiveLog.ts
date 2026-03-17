import { useState, useEffect, useRef } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { CONTRACT_ADDRESSES } from '../utils/contracts';

export interface LogEntry {
  id: string;
  timestamp: number;
  topics: string[];
  data: string;
  simulationResults: string[];
}

export function useLiveLog() {
  const { sdk } = useWeb3();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isListening, setIsListening] = useState(false);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!sdk || !CONTRACT_ADDRESSES.ActionExecutor) return;

    let active = true;

    sdk.subscribe({
      ethCalls: [],
      eventContractSources: [CONTRACT_ADDRESSES.ActionExecutor],
      onData: (data) => {
        if (!active) return;
        const entry: LogEntry = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          topics: data.result.topics,
          data: data.result.data,
          simulationResults: data.result.simulationResults,
        };
        setLogs((prev) => [entry, ...prev].slice(0, 100));
      },
      onError: (err) => console.error('Reactivity subscription error:', err),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }).then((result: any) => {
      if (!active) { if (typeof result === 'function') result(); return; }
      unsubRef.current = typeof result === 'function' ? result : null;
      setIsListening(true);
    });

    return () => {
      active = false;
      unsubRef.current?.();
      setIsListening(false);
    };
  }, [sdk]);

  const clearLogs = () => setLogs([]);

  return { logs, isListening, clearLogs };
}
