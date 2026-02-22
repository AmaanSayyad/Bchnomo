import { createConfig, http } from 'wagmi';
import { type Chain } from 'viem';
import { injected } from 'wagmi/connectors';

export const bchTestnet = {
    id: 10001,
    name: 'BCH Testnet',
    nativeCurrency: { name: 'Bitcoin Cash', symbol: 'BCH', decimals: 18 },
    rpcUrls: {
        default: { http: [process.env.NEXT_PUBLIC_ARB_RPC_ENDPOINT || 'https://rpc-testnet.smartbch.org'] },
    },
    blockExplorers: {
        default: { name: 'BCH Explorer', url: 'https://testnet.smartbch.org' },
    },
} as const satisfies Chain;

export const config = createConfig({
    chains: [bchTestnet],
    connectors: [
        injected(),
    ],
    transports: {
        [bchTestnet.id]: http(),
    },
});

