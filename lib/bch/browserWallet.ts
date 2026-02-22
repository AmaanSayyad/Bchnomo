'use client';

const STORAGE_KEY = 'bchnomo_browser_wallet';

interface StoredWallet {
  wif: string;
  address: string;
}

export function getSavedWallet(): StoredWallet | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveWallet(wif: string, address: string): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ wif, address }));
}

export function clearSavedWallet(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export async function createNewBrowserWallet(): Promise<{ address: string; wif: string }> {
  const { TestNetWallet } = await import('mainnet-js');
  const wallet = await TestNetWallet.newRandom();
  const address = wallet.getDepositAddress()!;
  const wif = wallet.privateKeyWif!;
  saveWallet(wif, address);
  return { address, wif };
}

export async function importBrowserWallet(wif: string): Promise<{ address: string }> {
  const { TestNetWallet } = await import('mainnet-js');
  const wallet = await TestNetWallet.fromWIF(wif);
  const address = wallet.getDepositAddress()!;
  saveWallet(wif, address);
  return { address };
}

export async function getBrowserWalletInstance() {
  const saved = getSavedWallet();
  if (!saved) return null;
  const { TestNetWallet } = await import('mainnet-js');
  return await TestNetWallet.fromWIF(saved.wif);
}

export async function sendFromBrowserWallet(
  toAddress: string,
  amountBch: number
): Promise<string> {
  const wallet = await getBrowserWalletInstance();
  if (!wallet) throw new Error('No browser wallet found');

  const satoshis = BigInt(Math.round(amountBch * 100_000_000));

  const resp = await wallet.send([
    { cashaddr: toAddress, value: satoshis }
  ]);

  if (!resp.txId) throw new Error('Transaction failed - no txId returned');
  return resp.txId;
}
