import { Wallet, TestNetWallet } from 'mainnet-js';

/**
 * Native Bitcoin Cash Integration Module
 * mainnet-js v3.1.7 TestNetWallet connects to CHIPNET electrum servers
 */

export async function getNativeBCHBalance(address: string): Promise<number> {
    if (!address) return 0;
    try {
        const isTestnet = address.startsWith('bchtest:');
        const WalletClass = isTestnet ? TestNetWallet : Wallet;
        const wallet = await WalletClass.watchOnly(address);
        const balanceSats = await wallet.getBalance();
        const bch = Number(balanceSats) / 100_000_000;
        console.log('[BCH Balance]', address.slice(0, 16) + '...', bch, 'BCH');
        return bch;
    } catch (error) {
        console.error('Failed to get BCH balance via electrum:', error);

        // Fallback: try chipnet REST API
        try {
            return await getBalanceFromChipnetAPI(address);
        } catch {
            return 0;
        }
    }
}

async function getBalanceFromChipnetAPI(address: string): Promise<number> {
    const stripped = address.replace('bchtest:', '');
    const resp = await fetch(
        `https://chipnet.chaingraph.cash/v1/graphql`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `{
                    search_output(
                        args: { locking_bytecode_hex: "" }
                        where: { _not: { spent_by: {} } }
                    ) { value_satoshis }
                }`
            }),
        }
    );
    if (!resp.ok) return 0;
    const data = await resp.json();
    const outputs = data?.data?.search_output || [];
    const totalSats = outputs.reduce((sum: number, o: any) => sum + Number(o.value_satoshis || 0), 0);
    return totalSats / 100_000_000;
}
