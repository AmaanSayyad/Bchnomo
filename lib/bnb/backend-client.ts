/**
 * BCH Testnet Backend Client
 * Used for administrative operations like withdrawals
 */

import { ethers } from 'ethers';
import { getBCHConfig } from './config';

/**
 * Get the treasury wallet for backend operations
 */
export function getTreasuryWallet(): ethers.Wallet {
    const config = getBCHConfig();
    const secretKey = process.env.BCH_TREASURY_SECRET_KEY;

    if (!secretKey) {
        throw new Error('BCH_TREASURY_SECRET_KEY is not configured');
    }

    const provider = new ethers.JsonRpcProvider(config.rpcEndpoint);
    return new ethers.Wallet(secretKey, provider);
}

/**
 * Transfer BCH (on BCH Testnet) from treasury to a user
 */
export async function transferBCHFromTreasury(
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
        console.error('Failed to transfer BCH from treasury on BCH Testnet:', error);
        throw error;
    }
}
