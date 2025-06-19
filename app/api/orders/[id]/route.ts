import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        *,
        customers (
          name,
          email,
          phone,
          address,
          city,
          postal_code
        ),
        payments (
          id,
          amount,
          method,
          status,
          midtrans_transaction_id,
          proof_url
        )
      `)
      .eq("id", params.id)
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data: order })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updateData = await request.json()

    const { data: order, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data: order })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ success: false, message: "Failed to update order" }, { status: 500 })
  }
}
