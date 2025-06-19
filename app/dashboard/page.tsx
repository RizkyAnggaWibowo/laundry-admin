"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, DollarSign, Clock, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

const formatRupiah = (n?: number | null) => (n ?? 0).toLocaleString("id-ID")

interface Order {
  id: string
  order_number: string
  customer_name: string
  total_amount: number
  status: string
  payment_status: string
  created_at: string
  service_types?: {
    name: string
  }
}

interface DashboardStats {
  totalOrders: number
  completedOrders: number
  totalRevenue: number
  pendingOrders: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const today = new Date().toISOString().split("T")[0]

      /* ----- attempt 1: query dengan join service_types ----- */
      let { data: orders, error } = await supabase
        .from("orders")
        .select(`
          *,
          service_types (
            name
          )
        `)
        .gte("created_at", today)
        .order("created_at", { ascending: false })

      /* ----- fallback: tanpa join bila relasi belum ada ----- */
      if (error) {
        console.warn("Join orders ↔ service_types gagal, fallback dipakai:", error.message)

        const { data: plainOrders, error: plainErr } = await supabase
          .from("orders")
          .select("*")
          .gte("created_at", today)
          .order("created_at", { ascending: false })

        if (plainErr) throw plainErr
        orders = plainOrders
      }

      /* ---------- hitung statistik ---------- */
      const totalOrders = orders?.length || 0
      const completedOrders = orders?.filter((o) => o.status === "completed").length || 0
      const pendingOrders = orders?.filter((o) => o.status === "pending").length || 0
      const totalRevenue =
        orders?.filter((o) => o.payment_status === "paid").reduce((sum, o) => sum + o.total_amount, 0) || 0

      setStats({ totalOrders, completedOrders, totalRevenue, pendingOrders })
      setRecentOrders(orders?.slice(0, 5) || [])
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800" },
      confirmed: { color: "bg-blue-100 text-blue-800" },
      "in-progress": { color: "bg-purple-100 text-purple-800" },
      "ready-for-pickup": { color: "bg-orange-100 text-orange-800" },
      completed: { color: "bg-green-100 text-green-800" },
      cancelled: { color: "bg-red-100 text-red-800" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig["pending"]
    return <Badge className={config.color}>{status}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#0F4C75]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0F4C75]">Dashboard</h1>
          <p className="text-muted-foreground">Ringkasan operasional laundry hari ini</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Order Hari Ini</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F4C75]">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Order masuk hari ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Order Selesai</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedOrders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalOrders > 0 ? Math.round((stats.completedOrders / stats.totalOrders) * 100) : 0}% completion
              rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendapatan Hari Ini</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F4C75]">Rp {formatRupiah(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Dari order yang sudah dibayar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Order Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Perlu tindak lanjut</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Order Terbaru</CardTitle>
          <CardDescription>Daftar order yang masuk hari ini</CardDescription>
        </CardHeader>
        <CardContent>
          {recentOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomor Order</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Layanan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell>{order.service_types?.name || "Unknown Service"}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>Rp {formatRupiah(order.total_amount)}</TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString("id-ID")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">Belum ada order hari ini</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
