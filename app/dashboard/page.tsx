"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, DollarSign, Clock, CheckCircle, AlertTriangle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

const formatRupiah = (n?: number | null) => (n ?? 0).toLocaleString("id-ID")

interface Order {
  id: string
  order_number: string
  customer_name: string
  total_amount: number
  status: 'pending' | 'confirmed' | 'picked_up' | 'in_process' | 'ready' | 'delivered' | 'cancelled' | 'pending_cancellation'
  payment_status: 'pending' | 'paid' | 'settlement' | 'failed' | 'cancelled' | 'expired'
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
  pendingCancellations: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    pendingCancellations: 0,
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
      }      /* ---------- hitung statistik ---------- */
      const totalOrders = orders?.length || 0
      const completedOrders = orders?.filter((o) => o.status === "delivered").length || 0
      const pendingOrders = orders?.filter((o) => o.status === "pending").length || 0
      const pendingCancellations = orders?.filter((o) => o.status === "pending_cancellation").length || 0
      const totalRevenue =
        orders?.filter((o) => o.payment_status === "paid").reduce((sum, o) => sum + o.total_amount, 0) || 0

      setStats({ totalOrders, completedOrders, totalRevenue, pendingOrders, pendingCancellations })
      setRecentOrders(orders?.slice(0, 5) || [])
    } catch (err) {
      console.error("Error fetching dashboard data:", err)    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "pending" },
      confirmed: { color: "bg-blue-100 text-blue-800", label: "confirmed" },
      picked_up: { color: "bg-indigo-100 text-indigo-800", label: "picked_up" },
      in_process: { color: "bg-purple-100 text-purple-800", label: "in_process" },
      ready: { color: "bg-orange-100 text-orange-800", label: "ready" },
      delivered: { color: "bg-green-100 text-green-800", label: "delivered" },
      cancelled: { color: "bg-gray-100 text-gray-800", label: "cancelled" },
      pending_cancellation: { color: "bg-red-100 text-red-700 font-semibold border border-red-300", label: "pending_cancellation" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig["pending"]
    return <Badge className={config.color}>{config.label}</Badge>
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
      </div>      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
        </Card>        {/* Card khusus untuk request cancel */}
        <Card className={`border-2 ${stats.pendingCancellations > 0 ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${stats.pendingCancellations > 0 ? 'text-red-700' : ''}`}>
              Request Cancel
            </CardTitle>
            <AlertTriangle className={`h-4 w-4 ${stats.pendingCancellations > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className={`text-2xl font-bold ${stats.pendingCancellations > 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {stats.pendingCancellations}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingCancellations > 0 ? 'Perlu ditinjau' : 'Tidak ada request'}
            </p>
            {stats.pendingCancellations > 0 && (
              <Button 
                size="sm" 
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                onClick={() => router.push('/dashboard/orders?filter=pending_cancellation')}
              >
                Lihat Detail
              </Button>
            )}
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
              <TableBody>{recentOrders.map((order) => (
                  <TableRow 
                    key={order.id}
                    className={order.status === 'pending_cancellation' 
                      ? "bg-red-50 border-l-4 border-l-red-400" 
                      : ""
                    }
                  >
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
