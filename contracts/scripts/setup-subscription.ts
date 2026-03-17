import { SDK } from '@somnia-chain/reactivity';
import { createPublicClient, createWalletClient, http, defineChain, parseGwei } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import * as dotenv from 'dotenv';

dotenv.config();

// Update these after deploying on Remix
const MOCK_LENDING_ADDRESS = process.env.MOCK_LENDING_ADDRESS || '';
const LIQUIDATION_GUARD_ADDRESS = process.env.LIQUIDATION_GUARD_ADDRESS || '';

const somniaTestnet = defineChain({
  id: 50312,
  name: 'Somnia Testnet',
  nativeCurrency: { name: 'Somnia Token', symbol: 'STT', decimals: 18 },
  rpcUrls: { default: { http: ['https://dream-rpc.somnia.network'] } },
});

async function main() {
  if (!MOCK_LENDING_ADDRESS || !LIQUIDATION_GUARD_ADDRESS) {
    console.error('Set MOCK_LENDING_ADDRESS and LIQUIDATION_GUARD_ADDRESS in .env');
    process.exit(1);
  }

  const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);
  const publicClient = createPublicClient({ chain: somniaTestnet, transport: http() });
  const walletClient = createWalletClient({ account, chain: somniaTestnet, transport: http() });
  const sdk = new SDK({ public: publicClient, wallet: walletClient });

  console.log('Creating Reactivity subscription...');
  console.log('  Emitter:  MockLendingProtocol', MOCK_LENDING_ADDRESS);
  console.log('  Handler:  LiquidationGuard', LIQUIDATION_GUARD_ADDRESS);

  const result = await sdk.createSoliditySubscription({
    emitter: MOCK_LENDING_ADDRESS as `0x${string}`,
    handlerContractAddress: LIQUIDATION_GUARD_ADDRESS as `0x${string}`,
    priorityFeePerGas: parseGwei('2'),
    maxFeePerGas: parseGwei('10'),
    gasLimit: 5_000_000n,
    isGuaranteed: true,
    isCoalesced: false,
  });

  if (result instanceof Error) {
    console.error('Failed:', result.message);
    process.exit(1);
  }

  console.log('✅ Subscription created! Tx hash:', result);
}

main().catch(console.error);
