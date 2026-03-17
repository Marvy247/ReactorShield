import { useState, useEffect, useRef, useCallback } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { CONTRACT_ADDRESSES, LENDING_PROTOCOL_ABI, MOCK_ASSETS } from '../utils/contracts';
import { createPublicClient, http, formatUnits } from 'viem';
import { somniaTestnet } from '../context/Web3Context';

export interface Position {
  id: number;
  owner: `0x${string}`;
  collateralAsset: `0x${string}`;
  assetSymbol: string;
  collateralAmount: bigint;
  debtAmount: bigint;
  healthFactor: number; // float
  isOpen: boolean;
  riskLevel: 'safe' | 'warning' | 'critical' | 'liquidatable';
}

function assetSymbol(addr: `0x${string}`): string {
  const map: Record<string, string> = {
    [MOCK_ASSETS.ETH]: 'ETH',
    [MOCK_ASSETS.BTC]: 'BTC',
    [MOCK_ASSETS.LINK]: 'LINK',
  };
  return map[addr.toLowerCase()] ?? addr.slice(0, 6);
}

function riskLevel(hf: number): Position['riskLevel'] {
  if (hf >= 1.5) return 'safe';
  if (hf >= 1.15) return 'warning';
  if (hf >= 1.0) return 'critical';
  return 'liquidatable';
}

export function usePositions(onUpdate?: () => void) {
  const { publicClient, address } = useWeb3();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const fetchPositions = useCallback(async () => {
    if (!CONTRACT_ADDRESSES.MockLendingProtocol || !address) return;
    const client = publicClient ?? createPublicClient({ chain: somniaTestnet, transport: http('https://dream-rpc.somnia.network') });
    setLoading(true);
    try {
      const ids = await client.readContract({
        address: CONTRACT_ADDRESSES.MockLendingProtocol,
        abi: LENDING_PROTOCOL_ABI,
        functionName: 'getUserPositions',
        args: [address],
      }) as bigint[];

      const results = await Promise.all(ids.map(async (id) => {
        const [pos, hfRaw] = await Promise.all([
          client.readContract({ address: CONTRACT_ADDRESSES.MockLendingProtocol, abi: LENDING_PROTOCOL_ABI, functionName: 'positions', args: [id] }),
          client.readContract({ address: CONTRACT_ADDRESSES.MockLendingProtocol, abi: LENDING_PROTOCOL_ABI, functionName: 'getHealthFactor', args: [id] }),
        ]) as [readonly [string, string, bigint, bigint, boolean], bigint];

        const hf = Number(formatUnits(hfRaw === BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff') ? BigInt('2000000000000000000') : hfRaw, 18));
        const asset = pos[1] as `0x${string}`;
        return {
          id: Number(id),
          owner: pos[0] as `0x${string}`,
          collateralAsset: asset,
          assetSymbol: assetSymbol(asset),
          collateralAmount: pos[2],
          debtAmount: pos[3],
          healthFactor: hf,
          isOpen: pos[4],
          riskLevel: riskLevel(hf),
        } satisfies Position;
      }));

      setPositions(results.filter(p => p.isOpen));
    } finally {
      setLoading(false);
    }
  }, [publicClient, address]);

  // Poll every 3s for live updates
  useEffect(() => {
    if (!address || !CONTRACT_ADDRESSES.MockLendingProtocol) return;
    fetchPositions();
    const interval = setInterval(() => {
      fetchPositions();
      onUpdateRef.current?.();
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchPositions, address]);

  return { positions, loading, refetch: fetchPositions };
}
