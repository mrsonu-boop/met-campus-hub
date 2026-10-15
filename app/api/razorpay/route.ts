import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const DEFAULT_TOKEN_RUPEES = 50;

export async function POST(req: Request) {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json(
      { error: "Razorpay keys are not configured on the server." },
      { status: 500 }
    );
  }

  let amountPaise = DEFAULT_TOKEN_RUPEES * 100;
  try {
    const body = (await req.json()) as { amount?: number };
    const requestedRupees = Number(body?.amount);
    if (Number.isFinite(requestedRupees) && requestedRupees > 0) {
      amountPaise = Math.round(requestedRupees) * 100;
    }
  } catch {
    amountPaise = DEFAULT_TOKEN_RUPEES * 100;
  }

  try {
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `met_token_${Date.now()}`,
      notes: { purpose: "Item Reservation Deposit" }
    });

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create Razorpay order.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
