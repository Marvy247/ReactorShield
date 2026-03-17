import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { createPublicClient, createWalletClient, custom, http, defineChain, type PublicClient, type WalletClient, type Address } from 'viem';
import { SDK } from '@somnia-chain/reactivity';

export const somniaTestnet = defineChain({
  id: 50312,
  name: 'Somnia Testnet',
  nativeCurrency: { name: 'Somnia Token', symbol: 'STT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://dream-rpc.somnia.network'], webSocket: ['wss://dream-rpc.somnia.network'] },
  },
  blockExplorers: {
    default: { name: 'Somnia Explorer', url: 'https://shannon-explorer.somnia.network' },
  },
});

interface Web3ContextType {
  address: Address | null;
  publicClient: PublicClient | null;
  walletClient: WalletClient | null;
  sdk: SDK | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  isConnecting: boolean;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<Address | null>(null);
  const [publicClient, setPublicClient] = useState<PublicClient | null>(null);
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const [sdk, setSdk] = useState<SDK | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(async () => {
    if (!window.ethereum) { alert('MetaMask not found'); return; }
    setIsConnecting(true);
    try {
      const [acc] = await window.ethereum.request({ method: 'eth_requestAccounts' }) as Address[];

      // Switch to Somnia testnet
      try {
        await window.ethereum.request('wallet_switchEthereumChain', [{ chainId: '0xC488' }]);
      } catch {
        await window.ethereum.request('wallet_addEthereumChain', [{
          chainId: '0xC488',
          chainName: 'Somnia Testnet',
          nativeCurrency: { name: 'STT', symbol: 'STT', decimals: 18 },
          rpcUrls: ['https://dream-rpc.somnia.network'],
          blockExplorerUrls: ['https://shannon-explorer.somnia.network'],
        }]);
      }

      const pub = createPublicClient({ chain: somniaTestnet, transport: http() });
      const wal = createWalletClient({ account: acc, chain: somniaTestnet, transport: custom(window.ethereum) });
      const reactivitySdk = new SDK({ public: pub, wallet: wal });

      setAddress(acc);
      setPublicClient(pub);
      setWalletClient(wal);
      setSdk(reactivitySdk);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setPublicClient(null);
    setWalletClient(null);
    setSdk(null);
  }, []);

  return (
    <Web3Context.Provider value={{ address, publicClient, walletClient, sdk, connect, disconnect, isConnecting }}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error('useWeb3 must be used within Web3Provider');
  return ctx;
}
