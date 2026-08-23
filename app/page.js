"use client"
import { useState } from "react"

export default function Home() {
  const [balance, setBalance] = useState(0)
  const [locked] = useState(0)
  const [withdrawable] = useState(5000)
  const [referralCount] = useState(3)
  const [weeklyProgress] = useState(3)

  return (
    <div style={{maxWidth: '400px', margin: '20px auto', padding: '16px', fontFamily: 'Arial', background: '#111', color: '#fff', borderRadius: '16px'}}>
      <h1 style={{textAlign: 'center', color: '#4ade80'}}>TAPBUMBER 💰</h1>

      <div style={{background: '#222', padding: '16px', borderRadius: '12px', marginTop: '16px'}}>
        <h3>Wallet</h3>
        <p>Available: <b>₦{balance}</b></p>
        <p>Locked: <b>₦{locked}</b></p>
        <p>Withdrawable: <b style={{color: '#4ade80'}}>₦{withdrawable}</b></p>
      </div>

      <div style={{background: '#222', padding: '16px', borderRadius: '12px', marginTop: '16px'}}>
        <h3>Referral Program 🤝</h3>
        <p>Total Referrals: <b>{referralCount}</b></p>
        <p>₦3,000 Activation = <b>₦500</b></p>
        <p>₦5,000 Activation = <b>₦800</b></p>

        <div style={{background: '#333', padding: '12px', borderRadius: '8px', marginTop: '10px', border: '1px solid #4ade80'}}>
          <p style={{margin: 0}}><b>🔥 Weekly Bonus</b></p>
          <p style={{margin: '4px 0', fontSize: '14px'}}>Refer 10 people in 7 days = <b>₦5,000</b> extra</p>
          <p style={{margin: 0, fontSize: '14px'}}>Progress: <b>{weeklyProgress}/10</b></p>
          <div style={{background: '#555', height: '8px', borderRadius: '4px', marginTop: '6px'}}>
            <div style={{width: `${weeklyProgress * 10}%`, background: '#4ade80', height: '8px', borderRadius: '4px'}}></div>
          </div>
        </div>
      </div>

      <a href="https://chat.whatsapp.com/FFGIXhlJHMRKHOB3hhp3fb?s=cl&p=a&ilr=1" target="_blank"
        style={{display: 'block', textAlign: 'center', padding: '14px', marginTop: '16px', background: '#25D366', borderRadius: '10px', color: '#fff', textDecoration: 'none', fontWeight: 'bold'}}>
        Join WhatsApp Group
      </a>

      <button disabled style={{width: '100%', padding: '14px', marginTop: '12px', background: 'gray', border: 'none', borderRadius: '10px', color: '#fff'}}>
        Request Withdrawal - Coming Soon
      </button>

      <p style={{fontSize: '12px', textAlign: 'center', marginTop: '16px', color: '#aaa'}}>
        Withdrawals: 14th & 30th, 6:00-7:30 AM WAT
      </p>
    </div>
  )
}