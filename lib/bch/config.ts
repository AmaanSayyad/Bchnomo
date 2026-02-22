/**
 * Native Bitcoin Cash Network Configuration (Chipnet)
 */

export interface NativeBCHConfig {
    network: 'mainnet' | 'testnet' | 'chipnet' | 'regtest';
    treasuryAddress: string;
    explorerUrl: string;
    dustLimit: number;
}

export function getNativeBCHConfig(): NativeBCHConfig {
    // We use Chipnet for testing
    const network = (process.env.NEXT_PUBLIC_BCH_NETWORK as any) || 'chipnet';
    const treasuryAddress = process.env.NEXT_PUBLIC_BCH_TREASURY_ADDRESS || 'bchtest:qq6zq3f6q3f6q3f6q3f6q3f6q3f6q3f6q3f6q3';
    const explorerUrl = network === 'chipnet' ? 'https://chipnet.imaginary.cash' : 'https://blockchair.com/bitcoin-cash';

    return {
        network,
        treasuryAddress,
        explorerUrl,
        dustLimit: 546, // Standard sats
    };
}
