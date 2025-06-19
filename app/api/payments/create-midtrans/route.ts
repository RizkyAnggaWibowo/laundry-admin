import { type NextRequest, NextResponse } from "next/server"
import { midtransService } from "@/lib/midtrans"

export async function POST(request: NextRequest) {
  try {
    const { orderId, orderNumber, amount, customerDetails } = await request.json()

    const midtransPayload = {
      transaction_details: {
        order_id: orderNumber, // Use order_number as Midtrans order_id
        gross_amount: amount,
      },
      customer_details: {
        first_name: customerDetails.first_name,
        last_name: customerDetails.last_name || "",
        email: customerDetails.email,
        phone: customerDetails.phone,
        billing_address: {
          first_name: customerDetails.first_name,
          last_name: customerDetails.last_name || "",
          email: customerDetails.email,
          phone: customerDetails.phone,
          address: customerDetails.address,
          city: "Jakarta", // Default city
          postal_code: "12345", // Default postal code
          country_code: "IDN",
        },
      },
      enabled_payments: [
        "credit_card",
        "bca_va",
        "bni_va",
        "bri_va",
        "echannel",
        "permata_va",
        "other_va",
        "gopay",
        "shopeepay",
      ],
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/finish`,
      },
    }

    const midtransResponse = await midtransService.createTransaction(midtransPayload)

    return NextResponse.json({
      success: true,
      data: {
        token: midtransResponse.token,
        redirect_url: midtransResponse.redirect_url,
        transaction_id: midtransResponse.transaction_id,
        order_id: orderNumber,
      },
    })
  } catch (error) {
    console.error("Error creating Midtrans transaction:", error)
    return NextResponse.json({ success: false, message: "Failed to create payment" }, { status: 500 })
  }
}
