"use client";
import { useState } from "react";

export default function Home() {
  const [btc, setBtc] = useState(0.00000);
  const [taps, setTaps] = useState(0);

  const handleTap = () => {
    const newBtc = btc + 0.000032;
    const newTaps = taps + 1;
    setBtc(newBtc);
    setTaps(newTaps);
  };

  return (
    <div style={{backgroundColor: '#000', color: '#fff', minHeight: '100vh', padding: '20px', fontFamily: 'Arial'}}>
      
      <h1 style={{color: '#00ff00', textAlign: 'center', fontSize: '28px'}}>TAPBUMBER 💎</h1>
      
      <div style={{backgroundColor: '#111', padding: '20px', borderRadius: '15px', marginTop: '20px'}}>
        <h2>💰 Wallet</h2>
        <p>Total Taps: <b>{taps}</b></p>
        <h1 style={{color: '#00ff00'}}>{btc.toFixed(8)} BTC</h1>
        <p style={{color: '#00ff00'}}>≈ ₦{(btc * 150000).toFixed(2)} NGN</p>
        <button style={{width: '100%', padding: '12px', backgroundColor: '#00ff00', border: 'none', borderRadius: '10px', fontWeight: 'bold', color: '#000'}}>Withdraw</button>
      </div>

      <button 
        onClick={handleTap}
        style={{
          width: '100%', padding: '25px', marginTop: '20px',
          backgroundColor: '#00ff00', border: 'none', borderRadius: '15px',
          fontSize: '20px', fontWeight: 'bold', color: '#000', cursor: 'pointer'
        }}
      >
        🔥 TAP TO EARN +0.000032
      </button>

    </div>
  );
}