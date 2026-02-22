'use client';

import React, { useState, useEffect } from 'react';
import { useOverflowStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Monitor, Key, Copy, Check, ExternalLink, Trash2 } from 'lucide-react';
import {
    getSavedWallet,
    createNewBrowserWallet,
    importBrowserWallet,
    clearSavedWallet,
} from '@/lib/bch/browserWallet';

type ModalView = 'main' | 'create' | 'import' | 'connected';

export const WalletConnectModal: React.FC = () => {
    const isOpen = useOverflowStore(state => state.isConnectModalOpen);
    const setOpen = useOverflowStore(state => state.setConnectModalOpen);
    const setPreferredNetwork = useOverflowStore(state => state.setPreferredNetwork);
    const setAddress = useOverflowStore(state => state.setAddress);
    const setIsConnected = useOverflowStore(state => state.setIsConnected);
    const setNetwork = useOverflowStore(state => state.setNetwork);
    const refreshWalletBalance = useOverflowStore(state => state.refreshWalletBalance);
    const fetchProfile = useOverflowStore(state => state.fetchProfile);
    const fetchBalance = useOverflowStore(state => state.fetchBalance);

    const [view, setView] = useState<ModalView>('main');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [wifInput, setWifInput] = useState('');
    const [newWalletInfo, setNewWalletInfo] = useState<{ address: string; wif: string } | null>(null);
    const [copied, setCopied] = useState<'address' | 'wif' | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setView('main');
            setError(null);
            setWifInput('');
            setNewWalletInfo(null);
            setCopied(null);
        }
    }, [isOpen]);

    const connectWithAddress = (addr: string) => {
        setPreferredNetwork('BCH');
        setAddress(addr);
        setIsConnected(true);
        setNetwork('BCH');
        refreshWalletBalance();
        fetchProfile(addr);
        fetchBalance(addr);
        setOpen(false);
    };

    const handleConnectExisting = () => {
        const saved = getSavedWallet();
        if (saved) {
            connectWithAddress(saved.address);
        }
    };

    const handleCreateWallet = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const wallet = await createNewBrowserWallet();
            setNewWalletInfo(wallet);
            setView('connected');
        } catch (err: any) {
            setError(err.message || 'Failed to create wallet');
        } finally {
            setIsLoading(false);
        }
    };

    const handleImportWallet = async () => {
        if (!wifInput.trim()) {
            setError('Please enter a WIF private key');
            return;
        }
        try {
            setIsLoading(true);
            setError(null);
            const { address } = await importBrowserWallet(wifInput.trim());
            connectWithAddress(address);
        } catch (err: any) {
            setError(err.message || 'Invalid WIF key');
        } finally {
            setIsLoading(false);
        }
    };

    const handleConnectNewWallet = () => {
        if (newWalletInfo) {
            connectWithAddress(newWalletInfo.address);
        }
    };

    const handleDeleteWallet = () => {
        clearSavedWallet();
        setView('main');
    };

    const copyToClipboard = async (text: string, type: 'address' | 'wif') => {
        await navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    const savedWallet = typeof window !== 'undefined' ? getSavedWallet() : null;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setOpen(false)}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md max-h-[90vh] bg-[#0f0f0f] border border-white/10 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col"
                >
                    <div className="p-5 sm:p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-green-500/10 to-transparent shrink-0">
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                                {view === 'main' && 'Connect Wallet'}
                                {view === 'create' && 'Creating Wallet...'}
                                {view === 'import' && 'Import Wallet'}
                                {view === 'connected' && 'Wallet Created!'}
                            </h2>
                            <p className="text-[11px] sm:text-sm text-gray-400 mt-1">
                                {view === 'main' && 'BCH Chipnet Browser Wallet'}
                                {view === 'create' && 'Please wait...'}
                                {view === 'import' && 'Enter your WIF private key'}
                                {view === 'connected' && 'Save your private key!'}
                            </p>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            className="p-2 hover:bg-white/5 rounded-full transition-colors group"
                        >
                            <X className="w-5 h-5 text-gray-500 group-hover:text-white" />
                        </button>
                    </div>

                    <div className="p-4 sm:p-6 space-y-3 overflow-y-auto no-scrollbar">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <p className="text-xs text-red-500">{error}</p>
                            </div>
                        )}

                        {/* MAIN VIEW */}
                        {view === 'main' && (
                            <>
                                {savedWallet && (
                                    <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-xl space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Saved Wallet</span>
                                            <button
                                                onClick={handleDeleteWallet}
                                                className="p-1 hover:bg-red-500/10 rounded transition-colors"
                                                title="Delete wallet"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 text-red-500/60 hover:text-red-500" />
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-300 font-mono break-all">{savedWallet.address}</p>
                                        <button
                                            onClick={handleConnectExisting}
                                            className="w-full py-2.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 font-bold text-sm rounded-lg border border-green-500/30 transition-all"
                                        >
                                            Connect This Wallet
                                        </button>
                                    </div>
                                )}

                                <button
                                    onClick={handleCreateWallet}
                                    disabled={isLoading}
                                    className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group relative overflow-hidden disabled:opacity-50"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20 group-hover:scale-110 transition-transform shrink-0">
                                        <Monitor className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-white text-sm sm:text-base">
                                                Create New Wallet
                                            </span>
                                            <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[10px] bg-green-500/20 text-green-500 font-bold uppercase tracking-wider">Chipnet</span>
                                        </div>
                                        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
                                            Generate a BCH chipnet wallet in your browser
                                        </p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => { setView('import'); setError(null); }}
                                    className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/5 to-yellow-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 group-hover:scale-110 transition-transform shrink-0">
                                        <Key className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <span className="font-bold text-white text-sm sm:text-base">Import Wallet</span>
                                        <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
                                            Import existing wallet with WIF private key
                                        </p>
                                    </div>
                                </button>
                            </>
                        )}

                        {/* IMPORT VIEW */}
                        {view === 'import' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-mono uppercase mb-1.5 block">WIF Private Key</label>
                                    <input
                                        type="password"
                                        value={wifInput}
                                        onChange={(e) => { setWifInput(e.target.value); setError(null); }}
                                        placeholder="cN1q2e... or K5..."
                                        className="w-full px-3 py-2.5 bg-black/50 border border-white/10 rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-green-500/50"
                                    />
                                    <p className="text-[10px] text-gray-500 mt-1.5">Testnet WIF keys start with &apos;c&apos; or mainnet with &apos;K&apos;/&apos;L&apos;</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setView('main')}
                                        className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-sm rounded-lg border border-white/10 transition-all"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleImportWallet}
                                        disabled={isLoading || !wifInput.trim()}
                                        className="flex-1 py-2.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 font-bold text-sm rounded-lg border border-green-500/30 transition-all disabled:opacity-50"
                                    >
                                        {isLoading ? 'Importing...' : 'Import & Connect'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* WALLET CREATED VIEW */}
                        {view === 'connected' && newWalletInfo && (
                            <div className="space-y-4">
                                <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                    <p className="text-xs text-yellow-400 font-bold mb-1">Save your private key!</p>
                                    <p className="text-[10px] text-yellow-500/80">
                                        This key is stored in your browser. If you clear browser data, you will lose access. Back it up now.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Address</label>
                                    <div className="flex items-center gap-2 p-2.5 bg-black/50 border border-white/10 rounded-lg">
                                        <p className="text-xs text-green-400 font-mono break-all flex-1">{newWalletInfo.address}</p>
                                        <button
                                            onClick={() => copyToClipboard(newWalletInfo.address, 'address')}
                                            className="p-1.5 hover:bg-white/10 rounded transition-colors shrink-0"
                                        >
                                            {copied === 'address' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Private Key (WIF)</label>
                                    <div className="flex items-center gap-2 p-2.5 bg-black/50 border border-red-500/20 rounded-lg">
                                        <p className="text-xs text-red-400 font-mono break-all flex-1">{newWalletInfo.wif}</p>
                                        <button
                                            onClick={() => copyToClipboard(newWalletInfo.wif, 'wif')}
                                            className="p-1.5 hover:bg-white/10 rounded transition-colors shrink-0"
                                        >
                                            {copied === 'wif' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                                        </button>
                                    </div>
                                </div>

                                <a
                                    href="https://tbch.googol.cash/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-sm font-bold rounded-lg border border-blue-500/20 transition-all"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Get Chipnet BCH (Faucet)
                                </a>
                                <p className="text-[10px] text-yellow-500/80 text-center">
                                    Faucet&apos;te network olarak &quot;chipnet&quot; seçin!
                                </p>

                                <button
                                    onClick={handleConnectNewWallet}
                                    className="w-full py-3 bg-green-500/20 hover:bg-green-500/30 text-green-400 font-bold text-sm rounded-lg border border-green-500/30 transition-all"
                                >
                                    I Saved My Key — Connect Wallet
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-white/5 text-center shrink-0">
                        <p className="text-[8px] sm:text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                            Bchnomo Protocol · BCH Chipnet
                        </p>
                        <p className="text-[9px] text-gray-600 mt-1">Browser wallet — keys stored locally</p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
