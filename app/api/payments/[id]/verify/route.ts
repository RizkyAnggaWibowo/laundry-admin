import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: payment, error } = await supabase
      .from("payments")
      .update({
        status: "Verified",
        verified_at: new Date().toISOString(),
        verified_by: "admin", // In production, use actual admin ID
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data: payment })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ success: false, message: "Failed to verify payment" }, { status: 500 })
  }
}
