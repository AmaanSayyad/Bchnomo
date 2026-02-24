'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useOverflowStore } from '@/lib/store';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrivyProvider, usePrivy, useWallets } from '@privy-io/react-auth';
import { WagmiProvider, useAccount } from 'wagmi';
import { useWallet as useBCHWallet } from 'bch-connect';
import { ConnectKitProvider } from 'connectkit';
import { config as wagmiConfig, bchTestnet } from '@/lib/bnb/wagmi';

// Solana Imports
import { ConnectionProvider, WalletProvider as SolanaWalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

// Sui Imports
import { createNetworkConfig, SuiClientProvider, WalletProvider, useCurrentAccount } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import '@mysten/dapp-kit/dist/index.css';

// Custom Components
import { WalletConnectModal } from '@/components/wallet/WalletConnectModal';
import { ReferralSync } from './ReferralSync';

// BCH Connect
import { BCHConnectProvider, createConfig as createBCHConfig } from 'bch-connect';

// Wallet Sync component to bridge all wallet states with our Zustand store
function WalletSync() {
  const { user, authenticated, ready: privyReady } = usePrivy();
  const { wallets: privyWallets } = useWallets();
  const { connected: solanaConnected, publicKey: solanaPublicKey } = useWallet();
  const suiAccount = useCurrentAccount();
  const { address: wagmiAddress, isConnected: wagmiConnected } = useAccount();
  const { address: bchAddress, isConnected: bchConnected } = useBCHWallet();

  const {
    address,
    accountType,
    setAddress,
    setIsConnected,
    setNetwork,
    refreshWalletBalance,
    fetchProfile,
    fetchBalance,
    preferredNetwork
  } = useOverflowStore();

  // Main Sync Effect
  useEffect(() => {
    // 0. Check Demo Mode (Priority)
    if (accountType === 'demo') {
      if (address !== '0xDEMO_1234567890') {
        setAddress('0xDEMO_1234567890');
        setIsConnected(true);
        setNetwork('BNB');
      }
      return;
    }

    // 1. Check Solana (Priority if preferred)
    if (solanaConnected && solanaPublicKey && preferredNetwork === 'SOL') {
      const addr = solanaPublicKey.toBase58();
      if (address !== addr) {
        setAddress(addr);
        setIsConnected(true);
        setNetwork('SOL');
        refreshWalletBalance();
        fetchProfile(addr);
      }
      return;
    }

    // 2. Check Sui
    if (suiAccount?.address && preferredNetwork === 'SUI') {
      if (address !== suiAccount.address) {
        setAddress(suiAccount.address);
        setIsConnected(true);
        setNetwork('SUI');
        refreshWalletBalance();
        fetchProfile(suiAccount.address);
      }
      return;
    }

    // 3. Check BCH (Browser wallet or bch-connect)
    if (preferredNetwork === 'BCH') {
      // Priority 1: bch-connect (WalletConnect)
      if (bchConnected && bchAddress) {
        if (address !== bchAddress) {
          setAddress(bchAddress);
          setIsConnected(true);
          setNetwork('BCH');
          refreshWalletBalance();
          fetchProfile(bchAddress);
          fetchBalance(bchAddress);
        }
        return;
      }

      // Priority 2: Browser wallet (mainnet-js stored locally)
      const { getSavedWallet } = require('@/lib/bch/browserWallet');
      const saved = getSavedWallet();
      if (saved && saved.address) {
        if (address !== saved.address) {
          setAddress(saved.address);
          setIsConnected(true);
          setNetwork('BCH');
          refreshWalletBalance();
          fetchProfile(saved.address);
          fetchBalance(saved.address);
        }
        return;
      }
      return;
    }

    // 4. Check Stellar - Logic is now handled by restoration effect above or manual connection
    if (preferredNetwork === 'XLM') {
      if (useOverflowStore.getState().address && useOverflowStore.getState().network === 'XLM') {
        return;
      }
    }

    // 5. Check Tezos
    if (preferredNetwork === 'XTZ') {
      if (useOverflowStore.getState().address && useOverflowStore.getState().network === 'XTZ') {
        return;
      }
    }

    // 6. Check NEAR
    if (preferredNetwork === 'NEAR') {
      if (useOverflowStore.getState().address && useOverflowStore.getState().network === 'NEAR') {
        return;
      }
    }

    // 7. Cleanup/Sync Decision
    const state = useOverflowStore.getState();
    const isDemoMode = state.accountType === 'demo';
    const hasSolana = solanaConnected && solanaPublicKey;
    const hasSui = !!suiAccount?.address;
    const hasBNB = (wagmiConnected && !!wagmiAddress) || (privyReady && authenticated && !!privyWallets[0]);
    const hasStellar = state.network === 'XLM' && !!state.address;
    const hasTezos = state.network === 'XTZ' && !!state.address;
    const hasNEAR = state.network === 'NEAR' && !!state.address;
    const { getSavedWallet: getSaved } = require('@/lib/bch/browserWallet');
    const hasBrowserWallet = !!getSaved();

    // Determine if we should clear
    let shouldClear = false;

    // If we are in demo mode, NEVER clear the address (wait for manual exit)
    if (isDemoMode) {
      shouldClear = false;
    } else {
      const pn = preferredNetwork as typeof preferredNetwork | 'BCH';
      if (pn === 'SOL' && !hasSolana) shouldClear = true;
      else if (pn === 'SUI' && !hasSui) shouldClear = true;
      else if (pn === 'BNB' && !hasBNB) shouldClear = true;
      else if (pn === 'BCH' && !bchConnected && !hasBrowserWallet && !address) shouldClear = true;
      else if (pn === 'XLM' && !hasStellar) shouldClear = true;
      else if (pn === 'XTZ' && !hasTezos) shouldClear = true;
      else if (pn === 'NEAR' && !hasNEAR) shouldClear = true;
      else if (!pn && !hasBNB && !hasSolana && !hasSui && !hasStellar && !hasTezos && !hasNEAR) shouldClear = true;
    }

    if (shouldClear && address !== null) {
      setAddress(null);
      setIsConnected(false);
      setNetwork(null);
    }
  }, [
    user, authenticated, privyWallets, privyReady,
    solanaConnected, solanaPublicKey,
    suiAccount,
    wagmiAddress, wagmiConnected,
    preferredNetwork, address, accountType,
    setAddress, setIsConnected, setNetwork, refreshWalletBalance, fetchProfile, fetchBalance
  ]);

  return null;
}

const { networkConfig } = createNetworkConfig({
  mainnet: { url: getFullnodeUrl('mainnet') },
});

export function Providers({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const [queryClient] = useState(() => new QueryClient());

  // Solana wallet adapter v2+ auto-discovers installed wallets via Wallet Standard
  // No need to explicitly add adapters - this avoids duplicate key errors (e.g. MetaMask)
  const solanaWallets = useMemo(() => [], []);

  // Fix: Move hook to top level
  const solanaEndpoint = useMemo(() => {
    try {
      const { getSolanaConfig } = require('@/lib/solana/config');
      return getSolanaConfig().rpcEndpoint;
    } catch (e) {
      return "https://solana-rpc.publicnode.com";
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initializeApp = async () => {
      try {
        const { updateAllPrices, loadTargetCells, startGlobalPriceFeed } = useOverflowStore.getState();

        await loadTargetCells().catch(console.error);
        const stopPriceFeed = startGlobalPriceFeed(updateAllPrices);
        setIsReady(true);
        return () => { if (stopPriceFeed) stopPriceFeed(); };
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsReady(true);
      }
    };

    initializeApp();
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'cm7377f0a00gup9u2w4m3v6be';

  const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'fa8caeb40b76a4b42dd7dfa9b5f82ba6';

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider mode="dark">
          <BCHConnectProvider
            config={createBCHConfig({
              projectId: walletConnectProjectId,
              network: 'testnet',
              supportLegacyClient: false,
              metadata: {
                name: 'Bchnomo',
                description: 'Bchnomo Protocol on BCH Testnet',
                url: typeof window !== 'undefined' ? window.location.origin : 'https://bchnomo.com',
                icons: ['https://cryptologos.cc/logos/bitcoin-cash-bch-logo.png'],
              },
            })}
          >
            <PrivyProvider
              appId={PRIVY_APP_ID}
              config={{
                appearance: {
                  theme: 'dark',
                  accentColor: '#A855F7',
                  showWalletLoginFirst: true,
                },
                supportedChains: [bchTestnet],
                defaultChain: bchTestnet,
                embeddedWallets: {
                  createOnLogin: 'users-without-wallets',
                },
              }}
            >
              <ConnectionProvider endpoint={solanaEndpoint}>
                <SolanaWalletProvider wallets={solanaWallets} autoConnect>
                  <WalletModalProvider>
                    <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
                      <WalletProvider autoConnect>
                        <WalletSync />
                        <ReferralSync />
                        {children}
                        <WalletConnectModal />
                        <ToastProvider />
                      </WalletProvider>
                    </SuiClientProvider>
                  </WalletModalProvider>
                </SolanaWalletProvider>
              </ConnectionProvider>
            </PrivyProvider>
          </BCHConnectProvider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
