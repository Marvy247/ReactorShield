import { SDK } from '@somnia-chain/reactivity';
import { createPublicClient, createWalletClient, http, defineChain } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import * as dotenv from 'dotenv';
dotenv.config();

const somnia = defineChain({
  id: 50312,
  name: 'Somnia Testnet',
  nativeCurrency: { name: 'STT', symbol: 'STT', decimals: 18 },
  rpcUrls: { default: { http: ['https://dream-rpc.somnia.network'] } },
});

async function main() {
  const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);
  const pub = createPublicClient({ chain: somnia, transport: http() });
  const wal = createWalletClient({ account, chain: somnia, transport: http() });
  const sdk = new SDK({ public: pub, wallet: wal });

  for (let i = 1n; i <= 10n; i++) {
    try {
      const info = await sdk.getSubscriptionInfo(i);
      console.log(`Sub #${i}:`, JSON.stringify(info, (_, v) => typeof v === 'bigint' ? v.toString() : v));
    } catch { /* skip */ }
  }
}
main().catch(console.error);
