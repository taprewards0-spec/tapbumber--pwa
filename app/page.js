"use client";
import { useState } from "react";

export default function Home() {
  const [balance, setBalance] = useState(0.000000000);
  const [taps, setTaps] = useState(0);

  const handleTap = () => {
    setBalance(prev => prev + 0.000032); // Add per tap
    setTaps(prev => prev + 1);
    alert("Tap +0.000000032! 🔥"); // So we know button dey work
  };

  const handleWithdraw = () => {
    alert("Coming Soon! You need ₦5000 minimum");
  };

  return (
    <div style={{ padding: '20px', background: 'linear-gradient(180deg, #0a0a0a, #000)', color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', color: '#4ade80', fontSize: '28px' }}>TAPBUMBER 💎</h1>
      
      <div style={{ background: '#111', padding: '20px', borderRadius: '16px', margin: '20px 0', border: '1px solid #222' }}>
        <h2>💰 Wallet</h2>
        <p>Total Taps: <b>{taps}</b></p>
        <p style={{ fontSize: '22px' }}>{balance.toFixed(9)} BTC</p>
        <p style={{ color: '#4ade80' }}>≈ ₦{(balance * 150000000).toFixed(2)} NGN</p>
        <p style={{ color: '#22c55e' }}>Withdrawable: ₦5000</p>
        <button onClick={handleWithdraw} style={{ marginTop: '10px', width: '100%', padding: '12px', background: '#4ade80', border: 'none', borderRadius: '10px', color: '#000', fontWeight: 'bold' }}>
          Withdraw
        </button>
      </div>

      <button onClick={handleTap}
        style={{
          width: '100%', padding: '24px', background: 'linear-gradient(90deg, #4ade80, #22c55e)',
          border: 'none', borderRadius: '16px', color: '#000', fontSize: '20px',
          fontWeight: 'bold', cursor: 'pointer'
        }}>
        🔥 TAP TO EARN +0.000032
      </button>

      <a href="https://chat.whatsapp.com/FFGIXhlJHMRKHOB3hhp3fb?s=cl&p=a&ilr=1" target="_blank"
        style={{ display: 'block', textAlign: 'center', padding: '16px', marginTop: '20px',
        background: 'linear-gradient(90deg, #25D366, #128C7E)', borderRadius: '16px', 
        color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>
        📱 Join WhatsApp Group
      </a>
    </div>
  );
}