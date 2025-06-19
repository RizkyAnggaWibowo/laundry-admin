import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    let query = supabase
      .from("payments")
      .select(`
        *,
        orders (
          id,
          customers (
            name,
            email,
            phone
          )
        )
      `)
      .order("created_at", { ascending: false })

    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    const { data: payments, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, data: payments })
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch payments" }, { status: 500 })
  }
}
