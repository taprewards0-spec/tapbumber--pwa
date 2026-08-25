"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [tapCount, setTapCount] = useState(0);

  useEffect(() => {
    getUser();
  }, []);

  async function getUser() {
    try {
      setLoading(true);

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Unable to get user:", error);
        setUser(null);
        return;
      }

      setUser(user);

      if (user) {
        await getProfile(user.id);
      }
    } catch (error) {
      console.error("getUser error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("btc_balance, tap_count")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Profile error:", error);
        return;
      }

      if (data) {
        setBalance(data.btc_balance ?? 0);
        setTapCount(data.tap_count ?? 0);
      }
    } catch (error) {
      console.error("getProfile error:", error);
    }
  }

  if (loading) {
    return (
      <main>
        <h1>TapBumber</h1>
        <p>Loading...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main>
        <h1>TapBumber</h1>
        <p>Please log in to continue.</p>
      </main>
    );
  }

  return (
    <main>
      <h1>TapBumber</h1>

      <section>
        <p>Welcome</p>
        <p>{user.email}</p>
      </section>

      <section>
        <h2>Balance</h2>
        <p>₦{Number(balance).toLocaleString()}</p>
      </section>

      <section>
        <h2>Tap Count</h2>
        <p>{tapCount}</p>
      </section>

      <section>
        <h2>Activation Packages</h2>

        <div>
          <h3>Standard</h3>
          <p>₦3,000</p>
          <p>₦50 per completed 2-hour cycle</p>
          <p>₦500 referral bonus</p>
        </div>

        <div>
          <h3>Premium</h3>
          <p>₦5,000</p>
          <p>₦120 per completed 2-hour cycle</p>
          <p>₦800 referral bonus</p>
        </div>
      </section>
    </main>
  );
}