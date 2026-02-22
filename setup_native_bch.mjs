const { Wallet, Network } = require('mainnet-js');

async function setupBchTreasury() {
    console.log('--- Generating Native BCH (Chipnet) Treasury Wallet ---');

    // Use Chipnet (BCH Testnet)
    const network = 'chipnet';

    // Create a new random wallet
    const wallet = await Wallet.named('treasury_native_bch');

    console.log(`Address: ${wallet.cashaddr}`);
    console.log(`Mnemonic: ${wallet.mnemonic}`);
    console.log(`Private Key (WIF): ${wallet.privateKeyWif}`);
    console.log('--- DONE ---');
}

setupBchTreasury().catch(console.error);
