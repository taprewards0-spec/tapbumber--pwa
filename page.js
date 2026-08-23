"use client"
import { useState } from "react"

export default function Home() {
  const [balance, setBalance] = useState(0)
  const [locked] = useState(300)
  const [withdrawable] = useState(0)

  return (
    <div style={{maxWidth: '400px', margin: '40px auto', padding: '20px', fontFamily: 'Arial', background: '#111', color: '#fff', borderRadius: '16px'}}>
      <h1 style={{textAlign: 'center'}}>TapBumber 💰</h1>
      
      <div style={{background: '#222', padding: '20px', borderRadius: '12px', marginTop: '20px'}}>
        <p>Total Balance: <b>₦{balance}</b></p>
        <p>Locked: <b>₦{locked}</b></p>
        <p>Withdrawable: <b>₦{withdrawable}</b></p>
      </div>

      <button 
        disabled
        style={{width: '100%', padding: '14px', marginTop: '20px', background: 'gray', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '16px'}}>
        Request Withdrawal - Coming Soon
      </button>

      <p style={{fontSize: '12px', textAlign: 'center', marginTop: '20px', color: '#aaa'}}>
        Earn ₦10 per tap. ₦300 stays locked until activation.
      </p>
    </div>
  )
}