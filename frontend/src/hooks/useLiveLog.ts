import { useState, useEffect, useRef, useCallback } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { CONTRACT_ADDRESSES } from '../utils/contracts';
import { keccak256, toBytes, decodeAbiParameters, parseAbiParameters } from 'viem';

export interface LogEntry {
  id: string;
  timestamp: number;
  pipelineId: string;
  triggerName: string;
  actionContract: string;
  success: boolean;
}

// topic0 → human name
const TOPIC_MAP: Record<string, string> = {
  [keccak256(toBytes('PriceUpdated(address,uint256,uint256)'))]: 'PriceUpdated',
  [keccak256(toBytes('ThresholdBreached(address,uint256,string)'))]: 'ThresholdBreached',
  [keccak256(toBytes('TokenTransferred(address,address,uint256)'))]: 'TokenTransferred',
};

// PipelineExecuted(uint256 indexed pipelineId, address indexed triggerContract, address indexed actionContract, bytes4 actionSelector, bool success)
const PIPELINE_EXECUTED_TOPIC = keccak256(toBytes('PipelineExecuted(uint256,address,address,bytes4,bool)'));

export function useLiveLog(onExecution?: () => void) {
  const { sdk } = useWeb3();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isListening, setIsListening] = useState(false);
  const unsubRef = useRef<(() => void) | null>(null);
  const onExecutionRef = useRef(onExecution);
  onExecutionRef.current = onExecution;

  const clearLogs = useCallback(() => setLogs([]), []);

  useEffect(() => {
    if (!sdk || !CONTRACT_ADDRESSES.ActionExecutor) return;
    let active = true;

    sdk.subscribe({
      ethCalls: [],
      eventContractSources: [CONTRACT_ADDRESSES.ActionExecutor],
      onData: (data) => {
        if (!active) return;
        const topics = data.result.topics as string[];
        const rawData = data.result.data as `0x${string}`;

        // Only process PipelineExecuted events
        if (topics[0]?.toLowerCase() !== PIPELINE_EXECUTED_TOPIC.toLowerCase()) return;

        // Decode non-indexed params: (bytes4 actionSelector, bool success)
        let success = true;
        try {
          const decoded = decodeAbiParameters(parseAbiParameters('bytes4, bool'), rawData);
          success = decoded[1];
        } catch { /* fallback */ }

        const pipelineId = topics[1] ? BigInt(topics[1]).toString() : '?';
        const actionContract = topics[3] ? `0x${topics[3].slice(26)}` : '?';

        // Try to find which trigger event fired by checking recent logs — use topic[2] (triggerContract)
        const triggerName = TOPIC_MAP[topics[0]] ?? 'Event';

        const entry: LogEntry = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          pipelineId,
          triggerName,
          actionContract,
          success,
        };

        setLogs((prev) => [entry, ...prev].slice(0, 100));
        onExecutionRef.current?.();
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

  return { logs, isListening, clearLogs };
}
