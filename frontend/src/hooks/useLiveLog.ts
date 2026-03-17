import { useState, useEffect, useRef, useCallback } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { CONTRACT_ADDRESSES, LIQUIDATION_GUARD_ABI, LENDING_PROTOCOL_ABI } from '../utils/contracts';
import { createPublicClient, http } from 'viem';
import { somniaTestnet } from '../context/Web3Context';

export interface GuardEvent {
  id: string;
  timestamp: number;
  positionId: string;
  owner: string;
  type: 'GuardTriggered' | 'GuardFailed' | 'LiquidationRisk' | 'PositionProtected';
  action?: string;
  healthFactor?: number;
  reason?: string;
}

export function useLiveLog(onExecution?: () => void) {
  const { publicClient } = useWeb3();
  const [logs, setLogs] = useState<GuardEvent[]>([]);
  const [isListening, setIsListening] = useState(false);
  const onExecutionRef = useRef(onExecution);
  onExecutionRef.current = onExecution;

  const clearLogs = useCallback(() => setLogs([]), []);

  const addLog = useCallback((entry: GuardEvent) => {
    setLogs(prev => [entry, ...prev].slice(0, 100));
    onExecutionRef.current?.();
  }, []);

  useEffect(() => {
    if (!CONTRACT_ADDRESSES.LiquidationGuard && !CONTRACT_ADDRESSES.MockLendingProtocol) return;

    const client = publicClient ?? createPublicClient({
      chain: somniaTestnet,
      transport: http('https://dream-rpc.somnia.network'),
      pollingInterval: 2000,
    });

    const unsubs: Array<() => void> = [];

    if (CONTRACT_ADDRESSES.LiquidationGuard) {
      unsubs.push(client.watchContractEvent({
        address: CONTRACT_ADDRESSES.LiquidationGuard,
        abi: LIQUIDATION_GUARD_ABI,
        eventName: 'GuardTriggered',
        onLogs: (newLogs) => newLogs.forEach((log: any) => addLog({
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          positionId: log.args?.positionId?.toString() ?? '?',
          owner: log.args?.owner ?? '?',
          type: 'GuardTriggered',
          action: log.args?.action,
          healthFactor: log.args?.healthFactor ? Number(log.args.healthFactor) / 1e18 : undefined,
        })),
      }));

      unsubs.push(client.watchContractEvent({
        address: CONTRACT_ADDRESSES.LiquidationGuard,
        abi: LIQUIDATION_GUARD_ABI,
        eventName: 'GuardFailed',
        onLogs: (newLogs) => newLogs.forEach((log: any) => addLog({
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          positionId: log.args?.positionId?.toString() ?? '?',
          owner: '?',
          type: 'GuardFailed',
          reason: log.args?.reason,
        })),
      }));
    }

    if (CONTRACT_ADDRESSES.MockLendingProtocol) {
      unsubs.push(client.watchContractEvent({
        address: CONTRACT_ADDRESSES.MockLendingProtocol,
        abi: LENDING_PROTOCOL_ABI,
        eventName: 'LiquidationRisk',
        onLogs: (newLogs) => newLogs.forEach((log: any) => addLog({
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          positionId: log.args?.positionId?.toString() ?? '?',
          owner: log.args?.owner ?? '?',
          type: 'LiquidationRisk',
          healthFactor: log.args?.healthFactor ? Number(log.args.healthFactor) / 1e18 : undefined,
        })),
      }));

      unsubs.push(client.watchContractEvent({
        address: CONTRACT_ADDRESSES.MockLendingProtocol,
        abi: LENDING_PROTOCOL_ABI,
        eventName: 'PositionProtected',
        onLogs: (newLogs) => newLogs.forEach((log: any) => addLog({
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          positionId: log.args?.positionId?.toString() ?? '?',
          owner: log.args?.owner ?? '?',
          type: 'PositionProtected',
          healthFactor: log.args?.newHealthFactor ? Number(log.args.newHealthFactor) / 1e18 : undefined,
        })),
      }));
    }

    setIsListening(true);
    return () => {
      unsubs.forEach(u => u());
      setIsListening(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { logs, isListening, clearLogs };
}
