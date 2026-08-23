import { NextResponse } from "next/server";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

// SERVER ONLY - Price table. Frontend cannot override this
const PACKAGE_PRICES = {
  standard: 300000, // ₦3000 in kobo
  premium: 500000, // ₦5000 in kobo
};

const BONUS = {
  standard: 50000, // ₦500 in kobo
  premium: 80000, // ₦800 in kobo
};

export async function POST(req) {
  try {
    // 1. GET USER FROM SUPABASE SESSION - DO NOT TRUST FRONTEND
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY // server only
    );
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError ||!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reference, requestedPackage } = await req.json();

    // 2. SERVER DECIDES THE PRICE. IGNORE CLIENT FEE
    const expectedAmount = PACKAGE_PRICES[requestedPackage];
    if (!expectedAmount) {
      return NextResponse.json({ error: "Invalid package" }, { status: 400 });
    }

    // 3. VERIFY PAYMENT WITH PAYSTACK USING SECRET KEY
    const paystackRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paymentData = paystackRes.data;

    // 4. 5 CRITICAL CHECKS BEFORE ACTIVATION
    if (paymentData.status!== "success") {
      return NextResponse.json({ error: "Payment not successful" }, { status: 400 });
    }
    if (paymentData.currency!== "NGN") {
      return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
    }
    if (paymentData.amount!== expectedAmount) {
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }
    if (paymentData.metadata?.user_id && paymentData.metadata.user_id!== user.id) {
      return NextResponse.json({ error: "User mismatch" }, { status: 400 });
    }

    // 5. ATOMIC DATABASE TRANSACTION
    const { data: existingPayment } = await supabase
     .from("payments")
     .select("id")
     .eq("payment_reference", reference)
     .single();
    
    if (existingPayment) {
      return NextResponse.json({ error: "Payment already used" }, { status: 400 });
    }

    // Start transaction: activation + bonus + cycle + payment record
    const { error: dbError } = await supabase.rpc("activate_user_atomic", {
      p_user_id: user.id,
      p_package: requestedPackage,
      p_reference: reference,
      p_amount: expectedAmount,
      p_bonus: BONUS[requestedPackage]
    });

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, package: requestedPackage });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Activation failed" }, { status: 500 });
  }
}