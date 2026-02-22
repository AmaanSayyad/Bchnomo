import { getDefaultConfig } from 'connectkit';
import { createConfig, http } from 'wagmi';
import { arbitrumSepolia } from 'wagmi/chains';

export const config = createConfig(
    getDefaultConfig({
        // Your dApps chains
        chains: [arbitrumSepolia],
        transports: {
            [arbitrumSepolia.id]: http(),
        },

        // Required API Keys
        walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'dummy-id',

        // Required App Info
        appName: 'Arbnomo',

        // Optional App Info
        appDescription: 'Arbnomo on Arbitrum Sepolia',
        appUrl: 'https://arbnomo.com', // updated url
        appIcon: 'https://arbnomo.com/logo.png', // updated icon
    }),
);
