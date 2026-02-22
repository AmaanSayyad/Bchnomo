/**
 * BCH Testnet Network Configuration
 */

export interface BCHConfig {
    network: string;
    rpcEndpoint: string;
    chainId: number;
    treasuryAddress: string;
}

/**
 * Get BCH Testnet configuration from environment variables
 */
export function getBCHConfig(): BCHConfig {
    const network = process.env.NEXT_PUBLIC_BCH_NETWORK || 'testnet';
    const rpcEndpoint = process.env.NEXT_PUBLIC_BCH_RPC_ENDPOINT || 'https://rpc-testnet.smartbch.org';
    const chainId = 10001; // BCH Testnet
    const treasuryAddress = process.env.NEXT_PUBLIC_BCH_TREASURY_ADDRESS || '';

    if (!treasuryAddress) {
        console.warn('Missing NEXT_PUBLIC_BCH_TREASURY_ADDRESS. Please set it in your .env file.');
    }

    return {
        network,
        rpcEndpoint,
        chainId,
        treasuryAddress,
    };
}

// Keep the old name for compatibility with existing code that imports it
export const getBNBConfig = getBCHConfig;
