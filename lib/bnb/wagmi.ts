import { getDefaultConfig } from 'connectkit';
import { createConfig, http } from 'wagmi';
import { type Chain } from 'viem';

export const bchTestnet = {
    id: 10001,
    name: 'SmartBCH Testnet',
    nativeCurrency: { name: 'Bitcoin Cash', symbol: 'BCH', decimals: 18 },
    rpcUrls: {
        default: { http: ['https://rpc-testnet.smartbch.org'] },
    },
    blockExplorers: {
        default: { name: 'SmartBCH Explorer', url: 'https://testnet.smartbch.org' },
    },
} as const satisfies Chain;

export const config = createConfig(
    getDefaultConfig({
        // Your dApps chains
        chains: [bchTestnet],
        transports: {
            [bchTestnet.id]: http(),
        },

        // Required API Keys
        walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'dummy-id',

        // Required App Info
        appName: 'Bchnomo',

        // Optional App Info
        appDescription: 'Bchnomo on BCH Testnet',
        appUrl: 'https://bchnomo.com', // updated url
        appIcon: 'https://bchnomo.com/logo.png', // updated icon
    }),
);
