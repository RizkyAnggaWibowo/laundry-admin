"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Download, Upload, CheckCircle, XCircle, Clock, CreditCard, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

const formatRupiah = (n?: number | null) => (n ?? 0).toLocaleString("id-ID")

interface Payment {
  id: string
  created_at: string
  amount: number
  method: string
  status: string
  midtrans_transaction_id: string | null
  midtrans_payment_type: string | null
  proof_url: string | null
  orders: {
    id: string
    customers: {
      name: string
      email: string
      phone: string
    }
  }
}

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchPayments()
  }, [statusFilter, searchTerm])

  const fetchPayments = async () => {
    try {
      setLoading(true)

      /* ----- attempt 1 : query dengan join orders & customers ----- */
      let query = supabase
        .from("payments")
        .select(
          `
            *,
            orders (
              id,
              customers (
                name,
                email,
                phone
              )
            )
          `,
        )
        .order("created_at", { ascending: false })

      if (statusFilter !== "all") query = query.eq("status", statusFilter)

      let { data, error } = await query

      /* ----- fallback : tanpa join bila relasi belum ada ----- */
      if (error) {
        console.warn("Join payments ↔ orders gagal, fallback dipakai:", error.message)

        const { data: plainPayments, error: plainErr } = await supabase
          .from("payments")
          .select("*")
          .order("created_at", { ascending: false })

        if (plainErr) throw plainErr
        data = plainPayments
      }

      /* ----- filter client-side berdasarkan pencarian ----- */
      let filtered = data || []
      if (searchTerm) {
        filtered = filtered.filter((p: any) => {
          const custName = p.orders?.customers?.name ?? ""
          const orderId = p.orders?.id ?? p.order_id ?? ""
          return (
            custName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            orderId.toLowerCase().includes(searchTerm.toLowerCase())
          )
        })
      }

      setPayments(filtered as any)
    } catch (err) {
      console.error("Error fetching payments:", err)
      toast({
        title: "Error",
        description: "Gagal memuat data pembayaran",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      Verified: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      Rejected: { color: "bg-red-100 text-red-800", icon: XCircle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig["Pending"]
    const Icon = config.icon

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    )
  }

  const verifyPayment = async (paymentId: string) => {
    try {
      setUpdating(true)

      const response = await fetch(`/api/payments/${paymentId}/verify`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to verify payment")

      toast({
        title: "Berhasil",
        description: "Pembayaran berhasil diverifikasi",
      })

      fetchPayments()
    } catch (error) {
      console.error("Error verifying payment:", error)
      toast({
        title: "Error",
        description: "Gagal memverifikasi pembayaran",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const rejectPayment = async (paymentId: string) => {
    try {
      setUpdating(true)

      const { error } = await supabase.from("payments").update({ status: "Rejected" }).eq("id", paymentId)

      if (error) throw error

      toast({
        title: "Berhasil",
        description: "Pembayaran berhasil ditolak",
      })

      fetchPayments()
    } catch (error) {
      console.error("Error rejecting payment:", error)
      toast({
        title: "Error",
        description: "Gagal menolak pembayaran",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const createMidtransPayment = async (orderId: string, amount: number) => {
    try {
      setUpdating(true)

      const response = await fetch("/api/payments/create-midtrans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          amount,
        }),
      })

      if (!response.ok) throw new Error("Failed to create Midtrans payment")

      const result = await response.json()

      if (result.success) {
        // Redirect to Midtrans payment page
        window.open(result.data.redirect_url, "_blank")

        toast({
          title: "Berhasil",
          description: "Link pembayaran Midtrans berhasil dibuat",
        })
      }
    } catch (error) {
      console.error("Error creating Midtrans payment:", error)
      toast({
        title: "Error",
        description: "Gagal membuat pembayaran Midtrans",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const exportToExcel = () => {
    // Implementasi export ke Excel
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "ID Order,Pelanggan,Jumlah,Metode,Status,Tanggal\n" +
      payments
        .map(
          (payment) =>
            `${payment.orders?.id},${payment.orders?.customers?.name},${payment.amount},${payment.method},${payment.status},${new Date(payment.created_at).toLocaleDateString("id-ID")}`,
        )
        .join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `payments_${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Berhasil",
      description: "Data pembayaran berhasil diexport",
    })
  }

  const totalPending = payments.filter((p) => p.status === "Pending").reduce((sum, p) => sum + p.amount, 0)
  const totalVerified = payments.filter((p) => p.status === "Verified").reduce((sum, p) => sum + p.amount, 0)

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
          <h1 className="text-3xl font-bold text-[#0F4C75]">Manajemen Pembayaran</h1>
          <p className="text-muted-foreground">Kelola dan verifikasi pembayaran pelanggan</p>
        </div>
        <Button onClick={exportToExcel} className="bg-[#0F4C75] hover:bg-[#0F4C75]/90">
          <Download className="mr-2 h-4 w-4" />
          Export Excel
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">Rp {formatRupiah(totalPending)}</div>
            <p className="text-xs text-muted-foreground">
              {payments.filter((p) => p.status === "Pending").length} transaksi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Rp {formatRupiah(totalVerified)}</div>
            <p className="text-xs text-muted-foreground">
              {payments.filter((p) => p.status === "Verified").length} transaksi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Keseluruhan</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F4C75]">Rp {formatRupiah(totalPending + totalVerified)}</div>
            <p className="text-xs text-muted-foreground">{payments.length} total transaksi</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter & Pencarian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama pelanggan atau ID order..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Verified">Verified</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pembayaran</CardTitle>
          <CardDescription>Total {payments.length} pembayaran ditemukan</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Order</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Midtrans ID</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.orders?.id.slice(0, 8)}...</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{payment.orders?.customers?.name}</div>
                      <div className="text-sm text-muted-foreground">{payment.orders?.customers?.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>Rp {formatRupiah(payment.amount)}</TableCell>
                  <TableCell>
                    <Badge variant={payment.method === "COD" ? "secondary" : "default"}>{payment.method}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell>{new Date(payment.created_at).toLocaleDateString("id-ID")}</TableCell>
                  <TableCell>
                    {payment.midtrans_transaction_id ? (
                      <span className="text-xs font-mono">{payment.midtrans_transaction_id.slice(0, 10)}...</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {payment.status === "Pending" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => verifyPayment(payment.id)}
                            disabled={updating}
                          >
                            {updating ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => rejectPayment(payment.id)}
                            disabled={updating}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                          {payment.method === "COD" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => createMidtransPayment(payment.orders?.id || "", payment.amount)}
                              disabled={updating}
                            >
                              <CreditCard className="h-4 w-4" />
                            </Button>
                          )}
                        </>
                      )}
                      {payment.proof_url && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Upload className="h-4 w-4 mr-1" />
                              Lihat
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Bukti Transfer - {payment.orders?.id.slice(0, 8)}...</DialogTitle>
                              <DialogDescription>
                                Bukti pembayaran dari {payment.orders?.customers?.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-center">
                              <img
                                src={payment.proof_url || "/placeholder.svg"}
                                alt="Bukti Transfer"
                                className="max-w-full h-auto rounded-lg border"
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
