export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">TapBumber</h1>
      <p className="mt-4">Earn rewards by tapping!</p>
      <button className="mt-8 px-8 py-4 bg-green-500 text-white rounded-lg text-2xl">
        TAP
      </button>
    </main>
  )
}

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