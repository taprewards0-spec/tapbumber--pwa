"use client";
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// 1. CONNECT SUPABASE
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [btcBalance, setBtcBalance] = useState(0);
  const [tapCount, setTapCount] = useState(0);

  // 2. GET REAL USER WHEN PAGE LOADS
  useEffect(() => {
    getUser();
  }, []);

  async function getUser() {
    const { data: { user } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      getProfile(user.id);
    }
  }

  // 3. GET USER PROFILE FROM DATABASE
  async function getProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('btc_balance, tap_count')
      .eq('id', userId)
      .single();
    
    if (data) {
      setBtcBalance(data.btc_balance);
      setTapCount(data.tap_count);
    }
  }

  const packageType = "Starter";
  const activationFee = 3000; // ₦3000

  const config = {
    public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: `TAPB-${Date.now()}-${user?.id}`, 
    amount: activationFee,
    currency: 'NGN',
    payment_options: 'card, mobilemoney, ussd',
    customer: {
      email: user?.email || '',
      name: user?.user_metadata?.name || 'Tap Bumber User',
    },
    customizations: {
      title: 'TapBumber Activation',
      description: `Activation fee for ${packageType} Package`,
      logo: 'https://tapbumber.com/logo.png',
    },
  };

  const handleFlutterwavePayment = useFlutterwave(config);

  // 4. HANDLE PAYMENT
  const handlePayment = () => {
    if (!user) return alert('Please login first');
    setLoading(true);
    handleFlutterwavePayment({
      callback: async (response) => {
        console.log(response);
        setLoading(false);
        closePaymentModal();
        // TODO: We will verify this payment on server with webhook later
        alert('Payment done! We will activate you after verification');
      },
      onClose: () => {
        setLoading(false);
      },
    });
  };

  // 5. HANDLE TAP - SAVES TO DATABASE
  const handleTap = async () => {
    if (!user) return alert('Please login first');
    
    const newBalance = btcBalance + 0.000032;
    const newTapCount = tapCount + 1;

    // Update UI first
    setBtcBalance(newBalance);
    setTapCount(newTapCount);

    // Save to Supabase
    const { error } = await supabase
      .from('profiles')
      .update({ 
        btc_balance: newBalance,
        tap_count: newTapCount
      })
      .eq('id', user.id);

    if (error) console.log('Error saving tap:', error);
  };

  // 6. LOGIN / LOGOUT
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google'
    });
    if (error) console.log(error);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <div style={{padding: '20px', textAlign: 'center'}}>
      <h1>TapBumber</h1>
      
      {!user ? (
        <button onClick={handleLogin}>Login with Google</button>
      ) : (
        <>
          <p>Welcome, {user.email}</p>
          <p><b>BTC Balance:</b> {btcBalance.toFixed(6)}</p>
          <p><b>Total Taps:</b> {tapCount}</p>
          
          <button 
            onClick={handleTap}
            style={{fontSize: '24px', padding: '20px 40px', margin: '10px'}}
          >
            TAP +0.000032 BTC
          </button>
          <br/>
          <button onClick={handlePayment} disabled={loading}>
            {loading ? 'Processing...' : `Activate ${packageType} - ₦${activationFee}`}
          </button>
          <br/><br/>
          <button onClick={handleLogout}>Logout</button>
        </>
      )}
    </div>
  )
}