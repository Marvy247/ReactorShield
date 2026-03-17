import { useState, useEffect, useRef, useCallback } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { CONTRACT_ADDRESSES, ACTION_EXECUTOR_ABI } from '../utils/contracts';
import { createPublicClient, http } from 'viem';
import { somniaTestnet } from '../context/Web3Context';

export interface LogEntry {
  id: string;
  timestamp: number;
  pipelineId: string;
  actionContract: string;
  success: boolean;
}

export function useLiveLog(onExecution?: () => void) {
  const { publicClient } = useWeb3();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isListening, setIsListening] = useState(false);
  const onExecutionRef = useRef(onExecution);
  onExecutionRef.current = onExecution;
  const unsubRef = useRef<(() => void) | null>(null);

  const clearLogs = useCallback(() => setLogs([]), []);

  useEffect(() => {
    if (!CONTRACT_ADDRESSES.ActionExecutor) return;

    // Use a dedicated polling client since WSS isn't available in browser
    const pollingClient = publicClient ?? createPublicClient({
      chain: somniaTestnet,
      transport: http('https://dream-rpc.somnia.network'),
      pollingInterval: 2000,
    });

    const unsub = pollingClient.watchContractEvent({
      address: CONTRACT_ADDRESSES.ActionExecutor,
      abi: ACTION_EXECUTOR_ABI,
      eventName: 'PipelineExecuted',
      onLogs: (newLogs) => {
        const entries: LogEntry[] = newLogs.map((log) => ({
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          pipelineId: (log as any).args?.pipelineId?.toString() ?? '?',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          actionContract: (log as any).args?.actionContract ?? '?',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          success: (log as any).args?.success ?? true,
        }));
        setLogs((prev) => [...entries, ...prev].slice(0, 100));
        onExecutionRef.current?.();
      },
    });

    unsubRef.current = unsub;
    setIsListening(true);

    return () => {
      unsub();
      setIsListening(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { logs, isListening, clearLogs };
}
