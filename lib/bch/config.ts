/**
 * Native Bitcoin Cash Network Configuration
 * mainnet-js v3.1.7 connects to CHIPNET electrum servers for testnet
 */

export interface NativeBCHConfig {
    network: 'mainnet' | 'testnet' | 'chipnet' | 'regtest';
    treasuryAddress: string;
    explorerUrl: string;
    faucetUrl: string;
    dustLimit: number;
}

export function getNativeBCHConfig(): NativeBCHConfig {
    const network = (process.env.NEXT_PUBLIC_BCH_NETWORK as any) || 'chipnet';
    const treasuryAddress = process.env.NEXT_PUBLIC_BCH_TREASURY_ADDRESS || 'bchtest:qr7fzmep8g7h7ymfxy74lgc0v950j3r2959lhtxxsl';

    let explorerUrl: string;
    let faucetUrl: string;

    switch (network) {
        case 'chipnet':
        case 'testnet':
            explorerUrl = 'https://chipnet.chaingraph.cash';
            faucetUrl = 'https://tbch.googol.cash/';
            break;
        case 'mainnet':
            explorerUrl = 'https://blockchair.com/bitcoin-cash';
            faucetUrl = '';
            break;
        default:
            explorerUrl = 'https://chipnet.chaingraph.cash';
            faucetUrl = 'https://tbch.googol.cash/';
    }

    return {
        network,
        treasuryAddress,
        explorerUrl,
        faucetUrl,
        dustLimit: 546,
    };
}
