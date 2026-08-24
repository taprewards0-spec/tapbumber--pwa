"use client";
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// CONNECT SUPABASE
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [btcBalance, setBtcBalance] = useState(0);
  const [tapCount, setTapCount] = useState(0);

  // GET USER ON LOAD
  useEffect(() => {
    getUser();
  }, []);

  async function getUser() {
    const { data: { user } } = await supabase.auth.getUser(); // FIXED
    setUser(user);
    if (user) {
      getProfile(user.id);
    }
  }

  // GET PROFILE FROM DB
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

  // FLUTTERWAVE CONFIG
  const packageType = "Starter";
 