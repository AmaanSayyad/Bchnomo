/**
 * Arbitrum Sepolia Backend Client
 * Used for administrative operations like withdrawals
 */

import { ethers } from 'ethers';
import { getARBConfig } from './config';

/**
 * Get the treasury wallet for backend operations
 */
export function getTreasuryWallet(): ethers.Wallet {
    const config = getARBConfig();
    const secretKey = process.env.ARB_TREASURY_SECRET_KEY;

    if (!secretKey) {
        throw new Error('ARB_TREASURY_SECRET_KEY is not configured');
    }

    const provider = new ethers.JsonRpcProvider(config.rpcEndpoint);
    return new ethers.Wallet(secretKey, provider);
}

/**
 * Transfer ETH (on Arbitrum Sepolia) from treasury to a user
 */
export async function transferARBFromTreasury(
    toAddress: string,
    amountETH: number
): Promise<string> {
    try {
        const wallet = getTreasuryWallet();
        const amountWei = ethers.parseEther(amountETH.toString());

        const tx = await wallet.sendTransaction({
            to: toAddress,
            value: amountWei,
        });

        console.log(`Withdrawal transaction sent: ${tx.hash}`);
        await tx.wait();
        console.log(`Withdrawal transaction confirmed: ${tx.hash}`);

        return tx.hash;
    } catch (error) {
        console.error('Failed to transfer ETH from treasury on Arbitrum Sepolia:', error);
        throw error;
    }
}
