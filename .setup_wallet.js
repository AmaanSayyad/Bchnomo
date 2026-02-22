const fs = require('fs');
const { ethers } = require('ethers');
const w = ethers.Wallet.createRandom();

let envContent = fs.readFileSync('.env', 'utf8');

const arbbBlockRegex = /# Arbitrum Configuration[\s\S]*ARB_TREASURY_SECRET_KEY=.*\n?/g;
const bchBlock = `# BCH Testnet Configuration
NEXT_PUBLIC_BCH_NETWORK=testnet
NEXT_PUBLIC_BCH_RPC_ENDPOINT=https://rpc-testnet.smartbch.org
NEXT_PUBLIC_BCH_TREASURY_ADDRESS=${w.address}
BCH_TREASURY_SECRET_KEY=${w.privateKey.replace('0x', '')}
`;

if (envContent.match(arbbBlockRegex)) {
    envContent = envContent.replace(arbbBlockRegex, bchBlock);
} else {
    envContent += '\n' + bchBlock;
}

fs.writeFileSync('.env', envContent, 'utf8');
console.log('Successfully generated and injected SmartBCH wallet into .env.');
console.log('Address:', w.address);
