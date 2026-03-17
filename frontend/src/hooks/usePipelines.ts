import { useState, useCallback } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { CONTRACT_ADDRESSES, PIPELINE_REGISTRY_ABI } from '../utils/contracts';
import { type Address } from 'viem';

export interface Pipeline {
  id: number;
  owner: Address;
  triggerContract: Address;
  eventTopic: string;
  actionContract: Address;
  actionSelector: string;
  label: string;
  isActive: boolean;
  executionCount: bigint;
  lastExecutedAt: bigint;
}

export function usePipelines() {
  const { publicClient, walletClient, address } = useWeb3();
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPipelines = useCallback(async () => {
    if (!publicClient || !address || !CONTRACT_ADDRESSES.PipelineRegistry) return;
    setLoading(true);
    try {
      const ids = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.PipelineRegistry,
        abi: PIPELINE_REGISTRY_ABI,
        functionName: 'getOwnerPipelines',
        args: [address],
      }) as bigint[];

      const results = await Promise.all(
        ids.map(async (id) => {
          const p = await publicClient.readContract({
            address: CONTRACT_ADDRESSES.PipelineRegistry,
            abi: PIPELINE_REGISTRY_ABI,
            functionName: 'getPipeline',
            args: [id],
          }) as Pipeline;
          return { ...p, id: Number(id) };
        })
      );
      setPipelines(results);
    } finally {
      setLoading(false);
    }
  }, [publicClient, address]);

  const createPipeline = useCallback(async (
    triggerContract: Address,
    eventTopic: `0x${string}`,
    actionContract: Address,
    actionSelector: `0x${string}`,
    label: string
  ) => {
    if (!walletClient || !publicClient || !address) return;
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESSES.PipelineRegistry,
      abi: PIPELINE_REGISTRY_ABI,
      functionName: 'createPipeline',
      args: [triggerContract, eventTopic, actionContract, actionSelector, label],
      account: address,
      chain: walletClient.chain,
    });
    await publicClient.waitForTransactionReceipt({ hash });
    await fetchPipelines();
    return hash;
  }, [walletClient, publicClient, address, fetchPipelines]);

  const togglePipeline = useCallback(async (id: number) => {
    if (!walletClient || !publicClient || !address) return;
    const hash = await walletClient.writeContract({
      address: CONTRACT_ADDRESSES.PipelineRegistry,
      abi: PIPELINE_REGISTRY_ABI,
      functionName: 'togglePipeline',
      args: [BigInt(id)],
      account: address,
      chain: walletClient.chain,
    });
    await publicClient.waitForTransactionReceipt({ hash });
    await fetchPipelines();
  }, [walletClient, publicClient, address, fetchPipelines]);

  return { pipelines, loading, fetchPipelines, createPipeline, togglePipeline };
}
