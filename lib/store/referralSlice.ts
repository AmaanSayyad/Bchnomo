import { StateCreator } from 'zustand';
import { supabase } from '../supabase/client';

export interface ReferralState {
    referralCode: string | null;
    referredBy: string | null;
    referralCount: number;
    referralLeaderboard: any[];
    isLoadingReferrals: boolean;

    setReferredBy: (code: string) => void;
    fetchReferralInfo: (address: string) => Promise<void>;
    createReferralCode: (address: string) => Promise<string>;
    fetchReferralLeaderboard: () => Promise<void>;
}

export const createReferralSlice: StateCreator<ReferralState> = (set, get) => ({
    referralCode: null,
    referredBy: typeof window !== 'undefined' ? localStorage.getItem('referred_by') : null,
    referralCount: 0,
    referralLeaderboard: [],
    isLoadingReferrals: false,

    setReferredBy: (code: string) => {
        if (code && !get().referredBy) {
            localStorage.setItem('referred_by', code);
            set({ referredBy: code });
        }
    },

    fetchReferralInfo: async (address: string) => {
        try {
            const { data, error } = await supabase
                .from('user_referrals')
                .select('*')
                .eq('user_address', address)
                .single();

            if (data) {
                set({
                    referralCode: data.referral_code,
                    referralCount: data.referral_count
                });
            } else {
                // If no referral info, create one
                await (get() as any).createReferralCode(address);
            }
        } catch (error) {
            console.error('Error fetching referral info:', error);
        }
    },

    createReferralCode: async (address: string) => {
        // Check if code already exists to avoid duplicate work
        const { data: existing } = await supabase
            .from('user_referrals')
            .select('referral_code, referral_count')
            .eq('user_address', address)
            .single();

        if (existing) {
            set({ referralCode: existing.referral_code, referralCount: existing.referral_count });
            return existing.referral_code;
        }

        const shortAddr = address.slice(-4).toUpperCase();
        const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
        const code = `bchnomo-${shortAddr}${randomStr}`;

        const referredByCode = get().referredBy;
        let referredByAddress = null;

        if (referredByCode) {
            // Try exact code first, then legacy bynomo-/binomo- if ref came as bchnomo-
            const codesToTry = [referredByCode];
            if (referredByCode.startsWith('bchnomo-')) {
                const suffix = referredByCode.slice(8);
                codesToTry.push('bynomo-' + suffix, 'binomo-' + suffix);
            } else if (referredByCode.startsWith('binomo-')) {
                codesToTry.push('bchnomo-' + referredByCode.slice(7));
            } else if (referredByCode.startsWith('bynomo-')) {
                codesToTry.push('bchnomo-' + referredByCode.slice(7));
            }
            for (const code of codesToTry) {
                const { data: refUser } = await supabase
                    .from('user_referrals')
                    .select('user_address')
                    .eq('referral_code', code)
                    .single();
                if (refUser && refUser.user_address !== address) {
                    referredByAddress = refUser.user_address;
                    break;
                }
            }
        }

        const { data, error } = await supabase
            .from('user_referrals')
            .insert({
                user_address: address,
                referral_code: code,
                referred_by: referredByAddress,
                referral_count: 0
            })
            .select()
            .single();

        if (data) {
            set({
                referralCode: data.referral_code,
                referralCount: data.referral_count
            });

            // Increment referrer's count if applicable
            if (referredByAddress) {
                await supabase.rpc('increment_referral_count', { referrer_address: referredByAddress });
            }

            return data.referral_code;
        }
        return code;
    },

    fetchReferralLeaderboard: async () => {
        set({ isLoadingReferrals: true });
        try {
            const { data, error } = await supabase
                .from('user_referrals')
                .select('user_address, referral_count')
                .order('referral_count', { ascending: false })
                .limit(20);

            if (data) {
                set({ referralLeaderboard: data });
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            set({ isLoadingReferrals: false });
        }
    }
});
