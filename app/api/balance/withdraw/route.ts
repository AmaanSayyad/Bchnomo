import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

interface WithdrawRequest {
  userAddress: string;
  amount: number;
  currency: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: WithdrawRequest = await request.json();
    const { userAddress, amount, currency = 'BCH' } = body;

    if (!userAddress || amount === undefined || amount === null) {
      return NextResponse.json(
        { error: 'Missing required fields: userAddress, amount' },
        { status: 400 }
      );
    }

    const { isValidAddress } = await import('@/lib/utils/address');
    if (!(await isValidAddress(userAddress))) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Withdrawal amount must be greater than zero' },
        { status: 400 }
      );
    }

    // Get house balance from Supabase
    let resolvedCurrency = currency;
    let result = await supabase
      .from('user_balances')
      .select('balance, status')
      .eq('user_address', userAddress)
      .eq('currency', currency)
      .single();

    let userData = result.data;
    let userError = result.error;

    // Fallback: try alternate currency key (legacy BCH/ETH compat)
    if ((userError || !userData) && (currency === 'BCH' || currency === 'ETH')) {
      const fallbackCurrency = currency === 'BCH' ? 'ETH' : 'BCH';
      const fallback = await supabase
        .from('user_balances')
        .select('balance, status')
        .eq('user_address', userAddress)
        .eq('currency', fallbackCurrency)
        .single();
      if (!fallback.error && fallback.data) {
        userData = fallback.data;
        userError = null;
        resolvedCurrency = fallbackCurrency;
      }
    }

    if (userError || !userData) {
      return NextResponse.json({ error: 'User record not found' }, { status: 404 });
    }

    if (userData.status === 'frozen') {
      return NextResponse.json({ error: 'Account is frozen. Withdrawals are disabled.' }, { status: 403 });
    }

    if (userData.status === 'banned') {
      return NextResponse.json({ error: 'Account is banned.' }, { status: 403 });
    }

    const balance = Number(userData.balance);
    const epsilon = 1e-9;
    if (balance < amount - epsilon) {
      return NextResponse.json({ error: `Insufficient house balance in ${resolvedCurrency}` }, { status: 400 });
    }

    // 2% Treasury Fee
    const feePercent = 0.02;
    const feeAmount = amount * feePercent;
    const netWithdrawAmount = amount - feeAmount;

    console.log(`Withdrawal: Total=${amount}, Fee=${feeAmount}, Net=${netWithdrawAmount}, Currency=${resolvedCurrency}`);

    // Transfer from treasury using native BCH (mainnet-js)
    let signature: string;
    try {
      const { transferBCHFromTreasury } = await import('@/lib/bch/treasury');
      signature = await transferBCHFromTreasury(userAddress, netWithdrawAmount);
    } catch (e: any) {
      console.error('Transfer failed:', e);
      return NextResponse.json({ error: `Withdrawal failed: ${e.message}` }, { status: 500 });
    }

    // Update Supabase balance
    const { data, error } = await supabase.rpc('update_balance_for_withdrawal', {
      p_user_address: userAddress,
      p_withdrawal_amount: amount,
      p_currency: resolvedCurrency,
      p_transaction_hash: signature,
    });

    if (error) {
      console.error('Database error in withdrawal update:', error);
      return NextResponse.json(
        {
          success: true,
          txHash: signature,
          warning: 'BCH sent but balance update failed. Please contact support.',
          error: error.message
        },
        { status: 200 }
      );
    }

    const rpcResult = data as { success: boolean; error: string | null; new_balance: number };

    return NextResponse.json({
      success: true,
      txHash: signature,
      newBalance: rpcResult.new_balance,
    });
  } catch (error) {
    console.error('Unexpected error in POST /api/balance/withdraw:', error);
    return NextResponse.json(
      { error: 'An error occurred processing your request' },
      { status: 500 }
    );
  }
}
