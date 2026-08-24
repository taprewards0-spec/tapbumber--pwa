"use client";
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { useState } from 'react';

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  
  // FAKE USER DATA - Replace with your real user from auth
  const user = {
    id: "user_123",
    email: "taprewards0@gmail.com", 
    name: "Tap Bumber User"
  }
  const packageType = "Starter";
  const activationFee = 3000; // ₦3000

  const config = {
    public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: `TAPB-${Date.now()}-${user.id}`, // unique transaction ref
    amount: activationFee,
    currency: 'NGN',
    payment_options: 'card,banktransfer,ussd',
    customer: {
      email: user.email,
      name: user.name,
    },
    customizations: {
      title: 'Tap Bumber Activation',
      description: `Activate ${packageType} Package`,
      logo: 'https://yourlogo.com/logo.png', // put your logo link
    },
  };

  const handleFlutterPayment = useFlutterwave(config);

  const activateUser = async (transaction) => {
    setLoading(true);
    try {
      const res = await fetch('/api/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction_id: transaction.transaction_id,
          tx_ref: transaction.tx_ref,
          package: packageType,
          userId: user.id
        }),
      });
      const data = await res.json();

      if (data.ok) {  
          alert(`Activated! Bonus ₦${data.bonus} credited ✅`);  
          window.location.reload();  
        } else {  
          alert(`Error: ${data.error}`);  
        }  
    } catch (err) {  
      alert('Activation failed');  
    }  
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <h1 className="text-white text-2xl font-bold mb-4">Activate Your Tap Bumber Account</h1>
      <p className="text-gray-400 mb-6">Pay ₦{activationFee} to unlock and get bonus</p>
      
      <button
        onClick={() => {
          handleFlutterPayment({
            callback: (response) => {
              console.log(response);
              if(response.status === "successful"){
                activateUser(response);
              }
              closePaymentModal() // this will close the modal
            },
            onClose: () => {},
          });
        }}
        disabled={loading}
        className="w-full max-w-md bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-lg text-lg disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Activate for ₦${activationFee}`}
      </button>
    </div>
  );
}
npm install flutterwave-react-v3

NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxxxxxxxxxxxxx-X
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxxxxxxxxxxxxx-X

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { transaction_id, package, userId } = await req.json();
  
  // TODO: Verify with Flutterwave here
  // const verify = await fetch(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {...})
  
  const bonus = 1000; // example
  // TODO: Activate user in DB
  
  return NextResponse.json({ ok: true, bonus });
}