import { SDK } from '@somnia-chain/reactivity';
import { createPublicClient, createWalletClient, http, defineChain, parseGwei } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import * as dotenv from 'dotenv';

dotenv.config();

const MOCK_TRIGGER_ADDRESS = '0xaA5685419dBd36d93dD4627da89B8f94c39399C4';
const ACTION_EXECUTOR_ADDRESS = '0x391926D40EF9d7e94f5656c4d0A8698714ff20Af';

const somniaTestnet = defineChain({
  id: 50312,
  name: 'Somnia Testnet',
  nativeCurrency: { name: 'Somnia Token', symbol: 'STT', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://dream-rpc.somnia.network'] },
  },
});

async function main() {
  const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);

  const publicClient = createPublicClient({ chain: somniaTestnet, transport: http() });
  const walletClient = createWalletClient({ account, chain: somniaTestnet, transport: http() });

  const sdk = new SDK({ public: publicClient, wallet: walletClient });

  console.log('Creating Solidity subscription...');
  console.log('  Watching:  MockTrigger', MOCK_TRIGGER_ADDRESS);
  console.log('  Handler:   ActionExecutor', ACTION_EXECUTOR_ADDRESS);

  const result = await sdk.createSoliditySubscription({
    emitter: MOCK_TRIGGER_ADDRESS,
    handlerContractAddress: ACTION_EXECUTOR_ADDRESS,
    priorityFeePerGas: parseGwei('2'),
    maxFeePerGas: parseGwei('10'),
    gasLimit: 2_000_000n,
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
