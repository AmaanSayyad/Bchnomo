import { TestNetWallet } from 'mainnet-js';

let cachedWallet: InstanceType<typeof TestNetWallet> | null = null;

async function getTreasuryWallet(): Promise<InstanceType<typeof TestNetWallet>> {
    if (cachedWallet) return cachedWallet;

    const wif = process.env.BCH_TREASURY_SECRET_KEY;
    if (!wif) throw new Error('BCH_TREASURY_SECRET_KEY is not configured');

    cachedWallet = await TestNetWallet.fromWIF(wif);
    return cachedWallet;
}

export async function transferBCHFromTreasury(
    toAddress: string,
    amountBch: number
): Promise<string> {
    const wallet = await getTreasuryWallet();
    const satoshis = BigInt(Math.round(amountBch * 100_000_000));

    console.log(`[Treasury] Sending ${amountBch} BCH (${satoshis} sats) to ${toAddress}`);

    const resp = await wallet.send([
        { cashaddr: toAddress, value: satoshis }
    ]);

    if (!resp.txId) throw new Error('Treasury transfer failed - no txId');

    console.log(`[Treasury] TX confirmed: ${resp.txId}`);
    return resp.txId;
}
