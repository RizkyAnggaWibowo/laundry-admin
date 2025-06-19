import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    let query = supabase
      .from("orders")
      .select(`
        *,
        customers (
          name,
          email,
          phone,
          address
        ),
        payments (
          id,
          amount,
          method,
          status,
          midtrans_transaction_id
        )
      `)
      .order("created_at", { ascending: false })

    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    if (search) {
      query = query.or(`customers.name.ilike.%${search}%,id.ilike.%${search}%`)
    }

    const { data: orders, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, data: orders })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()

    const { data: order, error } = await supabase.from("orders").insert(orderData).select().single()

    if (error) throw error

    return NextResponse.json({ success: true, data: order })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ success: false, message: "Failed to create order" }, { status: 500 })
  }
}
