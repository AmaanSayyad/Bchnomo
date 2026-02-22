const fs = require('fs');
const path = require('path');

const ignoreDirs = ['node_modules', '.git', '.next', 'dist', '.vscode', 'supabase', 'contracts'];
const exts = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md'];

const replacements = [
    { from: /BCH Testnet/gi, to: 'BCH Testnet' },
    { from: /bchTestnet/g, to: 'bchTestnet' },
    { from: /bch-testnet/g, to: 'bch-testnet' },
    { from: /bch_testnet/g, to: 'bch_testnet' },
    { from: /Bchnomo/g, to: 'Bchnomo' },
    { from: /bchnomo/g, to: 'bchnomo' },
    { from: /BCHNOMO/g, to: 'BCHNOMO' },
    { from: /\bETH\b/g, to: 'BCH' },
    { from: /\bBCH\b/g, to: 'BCH' },
    { from: /\bbch\b/g, to: 'bch' },
];

let replacedFilesCount = 0;

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        // Exclude ignored directories
        if (ignoreDirs.includes(file)) continue;

        const filepath = path.join(dir, file);
        const stat = fs.statSync(filepath);

        if (stat.isDirectory()) {
            processDir(filepath);
        } else if (exts.includes(path.extname(filepath))) {
            let content = fs.readFileSync(filepath, 'utf8');
            let originalContent = content;

            // Edge Case Protection
            // We want to skip replacing BCH inside `assets/BCH-USD` or `assets: ['ETH']` if possible
            // But user said "-assets icindeki eth haric-" (Except BCH in the assets array/list/context)
            // Meaning if it's "BTC/USD", "ETH/USD" for trading pairs.
            // Let's protect `ETH/USD`, `ETH/USDT`, etc by temporarily replacing them with a placeholder
            content = content.replace(/BCH\/USD/g, 'ETH/USD');
            content = content.replace(/BCH\/USDT/g, 'ETH/USDT');
            content = content.replace(/'ETH'/g, ''ETH'');
            content = content.replace(/"ETH"/g, '"ETH"');
            
            // Revert some cases in specific files...
            // Let's do main replacements
            for (const { from, to } of replacements) {
                content = content.replace(from, to);
            }

            // Restore BCH in assets
            content = content.replace(/ETH/USD/g, 'ETH/USD');
            content = content.replace(/ETH/USDT/g, 'ETH/USDT');
            content = content.replace(/'ETH'/g, "'ETH'");
            content = content.replace(/"ETH"/g, '"ETH"');

            // Fix wagmi chains import. viem/chains has `bchTestnet`? Wait, viem might not have `bchTestnet`.
            // Let's check viem/chains. We'll manually insert `bchTestnet` if it fails to import.
            
            if (content !== originalContent) {
                fs.writeFileSync(filepath, content, 'utf8');
                replacedFilesCount++;
                console.log(`Replaced in ${filepath}`);
            }
        }
    }
}

processDir('.');
console.log(`Finished processing. Modified ${replacedFilesCount} files.`);
