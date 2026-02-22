/**
 * Arbitrum Sepolia Network Configuration
 */

export interface ARBConfig {
    network: string;
    rpcEndpoint: string;
    chainId: number;
    treasuryAddress: string;
}

/**
 * Get Arbitrum Sepolia configuration from environment variables
 */
export function getARBConfig(): ARBConfig {
    const network = process.env.NEXT_PUBLIC_ARB_NETWORK || 'testnet';
    const rpcEndpoint = process.env.NEXT_PUBLIC_ARB_RPC_ENDPOINT || 'https://sepolia-rollup.arbitrum.io/rpc';
    const chainId = 421614; // Arbitrum Sepolia
    const treasuryAddress = process.env.NEXT_PUBLIC_ARB_TREASURY_ADDRESS || '';

    if (!treasuryAddress) {
        console.warn('Missing NEXT_PUBLIC_ARB_TREASURY_ADDRESS. Please set it in your .env file.');
    }

    return {
        network,
        rpcEndpoint,
        chainId,
        treasuryAddress,
    };
}

// Keep the old name for compatibility with existing code that imports it
export const getBNBConfig = getARBConfig;
