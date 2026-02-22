import { Wallet } from 'mainnet-js';

/**
 * Native Bitcoin Cash Integration Module (Chipnet)
 * Focus: Watch-only and Utility functions for Trust Wallet
 */

/**
 * Get BCH balance for a given address on Chipnet
 */
export async function getNativeBCHBalance(address: string): Promise<number> {
    if (!address) return 0;
    try {
        // watchOnly detects network from address prefix (bchtest:)
        const wallet = await Wallet.watchOnly(address);
        const balanceSats = await wallet.getBalance(); // v3 returns bigint (satoshis)
        return Number(balanceSats) / 100_000_000;
    } catch (error) {
        console.error('Failed to get native BCH balance:', error);
        return 0;
    }
}
