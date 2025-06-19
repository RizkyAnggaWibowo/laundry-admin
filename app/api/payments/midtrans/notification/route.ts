import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { midtransService } from "@/lib/midtrans"

export async function POST(request: NextRequest) {
  try {
    const notification = await request.json()

    const { order_id, status_code, gross_amount, signature_key, transaction_status, payment_type, transaction_id } =
      notification

    // Verify signature
    const isValidSignature = midtransService.verifySignature(order_id, status_code, gross_amount, signature_key)

    if (!isValidSignature) {
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 })
    }

    // Update payment status based on transaction status
    let paymentStatus = "Pending"

    if (transaction_status === "capture" || transaction_status === "settlement") {
      paymentStatus = "Verified"
    } else if (transaction_status === "cancel" || transaction_status === "expire" || transaction_status === "failure") {
      paymentStatus = "Rejected"
    }

    // Update payment in database
    const { data: payment, error } = await supabase
      .from("payments")
      .update({
        status: paymentStatus,
        midtrans_transaction_id: transaction_id,
        midtrans_payment_type: payment_type,
        verified_at: paymentStatus === "Verified" ? new Date().toISOString() : null,
      })
      .eq("order_id", order_id)
      .select()
      .single()

    if (error) {
      console.error("Error updating payment:", error)
      return NextResponse.json({ success: false, message: "Failed to update payment" }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: payment })
  } catch (error) {
    console.error("Midtrans notification error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
