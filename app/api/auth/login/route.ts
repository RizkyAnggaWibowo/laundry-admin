import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    // ✅ DEMO check (email / password hard-coded)
    if (email !== "admin@laundrybiner.com" || password !== "admin123") {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    // ---------- OPTIONAL: simpan ke tabel admin_users jika ada ----------
    let adminUser = { email, name: "Admin Laundry", role: "super_admin" }

    try {
      // 1. Cek apakah tabel admin_users memang ada
      const { error: metaErr } = await supabase.from("admin_users").select("id").limit(1)

      // Jika query berhasil (tabel ada), lanjutkan proses normal
      if (!metaErr) {
        // Apakah admin sudah ada?
        const { data: existing, error: selErr } = await supabase
          .from("admin_users")
          .select("*")
          .eq("email", email)
          .single()

        if (!selErr && existing) {
          adminUser = existing
        } else {
          // Insert admin user baru
          const { data: inserted, error: insErr } = await supabase
            .from("admin_users")
            .insert({
              email,
              name: "Admin Laundry",
              role: "super_admin",
            })
            .select()
            .single()

          if (!insErr && inserted) adminUser = inserted
        }
      }
      // jika metaErr, berarti tabel belum ada → lewati tanpa error fatal
    } catch (tblErr) {
      // Error 42P01 = relation does not exist (tabel belum dibuat)
      console.warn("admin_users table not found — skipping Supabase sync")
    }

    // ------------- response -------------
    return NextResponse.json({ success: true, user: adminUser })
  } catch (err) {
    console.error("Login error:", err)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
