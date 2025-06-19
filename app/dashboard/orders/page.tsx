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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Eye, Loader2, CreditCard } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

const formatRupiah = (amount?: number | null) => (amount ?? 0).toLocaleString("id-ID")

interface Order {
  id: string
  order_number: string
  user_id: string
  service_type_id: string
  weight: number | null
  total_amount: number
  pickup_date: string
  pickup_time: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  pickup_address: string
  notes: string | null
  status: string
  payment_status: string
  midtrans_transaction_id: string | null
  midtrans_order_id: string | null
  created_at: string
  updated_at: string
  service_types?: {
    name: string
    description: string | null
    price_per_kg: number | null
    price_per_item: number | null
  }
}

interface ServiceType {
  id: string
  name: string
  description: string | null
  price_per_kg: number | null
  price_per_item: number | null
}

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchOrders()
    fetchServiceTypes()
  }, [statusFilter, paymentStatusFilter, searchTerm])

  const fetchServiceTypes = async () => {
    try {
      const { data, error } = await supabase.from("service_types").select("*")

      if (error) {
        console.warn("Error fetching service types:", error.message)
        return
      }

      setServiceTypes(data || [])
    } catch (err) {
      console.warn("Failed to fetch service types:", err)
    }
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)

      /* ----- attempt 1: query dengan join service_types ----- */
      let query = supabase
        .from("orders")
        .select(`
          *,
          service_types (
            name,
            description,
            price_per_kg,
            price_per_item
          )
        `)
        .order("created_at", { ascending: false })

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter)
      }

      if (paymentStatusFilter !== "all") {
        query = query.eq("payment_status", paymentStatusFilter)
      }

      let { data, error } = await query

      /* ----- fallback: query tanpa join bila relasi belum ada ----- */
      if (error) {
        console.warn("Join orders ↔ service_types gagal, fallback dipakai:", error.message)

        let fallbackQuery = supabase.from("orders").select("*").order("created_at", { ascending: false })

        if (statusFilter !== "all") {
          fallbackQuery = fallbackQuery.eq("status", statusFilter)
        }

        if (paymentStatusFilter !== "all") {
          fallbackQuery = fallbackQuery.eq("payment_status", paymentStatusFilter)
        }

        const { data: plainOrders, error: plainErr } = await fallbackQuery

        if (plainErr) throw plainErr

        // Manual join dengan service_types yang sudah di-fetch
        data = plainOrders?.map((order) => ({
          ...order,
          service_types: serviceTypes.find((st) => st.id === order.service_type_id) || null,
        }))
      }

      // Filter by search term (client-side)
      let filteredData = data || []
      if (searchTerm) {
        filteredData = filteredData.filter(
          (order: any) =>
            order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer_phone.includes(searchTerm),
        )
      }

      setOrders(filteredData)
    } catch (err) {
      console.error("Error fetching orders:", err)
      toast({
        title: "Error",
        description: "Gagal memuat data order",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getServiceName = (order: Order) => {
    // Prioritas: dari join result, lalu dari manual lookup, terakhir fallback
    if (order.service_types?.name) {
      return order.service_types.name
    }

    const serviceType = serviceTypes.find((st) => st.id === order.service_type_id)
    return serviceType?.name || "Unknown Service"
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending:    { color: "bg-yellow-100 text-yellow-700", label: "Pesanan Dibuat" },  
      confirmed:  { color: "bg-blue-100 text-blue-700", label: "Pesanan Dikonfirmasi" },      
      picked_up:  { color: "bg-indigo-100 text-indigo-700", label: "Dijemput" },  
      in_process: { color: "bg-orange-100 text-orange-700", label: "Sedang Diproses" },  
      ready:      { color: "bg-emerald-100 text-emerald-700", label: "Siap Diantar" },
      delivered:  { color: "bg-lime-100 text-lime-700", label: "Selesai" },      
      cancelled:  { color: "bg-gray-200 text-gray-600", label: "Dibatalkan" },      
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig["pending"]
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getPaymentStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", label: "Menunggu Pembayaran" },
      paid: { color: "bg-green-100 text-green-800", label: "Lunas" },
      failed: { color: "bg-red-100 text-red-800", label: "Gagal"},
      cancelled: { color: "bg-gray-100 text-gray-800", label: "Dibatalkan" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig["pending"]
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdating(true)

      const { error } = await supabase
        .from("orders")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (error) throw error

      toast({
        title: "Berhasil",
        description: "Status order berhasil diupdate",
      })

      fetchOrders()

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus })
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      toast({
        title: "Error",
        description: "Gagal mengupdate status order",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const updatePaymentStatus = async (orderId: string, newPaymentStatus: string) => {
    try {
      setUpdating(true)

      const { error } = await supabase
        .from("orders")
        .update({
          payment_status: newPaymentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (error) throw error

      toast({
        title: "Berhasil",
        description: "Status pembayaran berhasil diupdate",
      })

      fetchOrders()

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, payment_status: newPaymentStatus })
      }
    } catch (error) {
      console.error("Error updating payment status:", error)
      toast({
        title: "Error",
        description: "Gagal mengupdate status pembayaran",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const updateOrderDetails = async (orderId: string, updateData: any) => {
    try {
      setUpdating(true)

      const { error } = await supabase
        .from("orders")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (error) throw error

      toast({
        title: "Berhasil",
        description: "Detail order berhasil diupdate",
      })

      fetchOrders()
    } catch (error) {
      console.error("Error updating order:", error)
      toast({
        title: "Error",
        description: "Gagal mengupdate order",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const createMidtransPayment = async (order: Order) => {
    try {
      setUpdating(true)

      const response = await fetch("/api/payments/create-midtrans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.id,
          orderNumber: order.order_number,
          amount: order.total_amount,
          customerDetails: {
            first_name: order.customer_name.split(" ")[0],
            last_name: order.customer_name.split(" ").slice(1).join(" "),
            email: order.customer_email || `${order.customer_phone}@temp.com`,
            phone: order.customer_phone,
            address: order.pickup_address,
          },
        }),
      })

      if (!response.ok) throw new Error("Failed to create Midtrans payment")

      const result = await response.json()

      if (result.success) {
        // Update order dengan midtrans transaction ID
        await updateOrderDetails(order.id, {
          midtrans_transaction_id: result.data.transaction_id,
          midtrans_order_id: result.data.order_id,
        })

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
          <h1 className="text-3xl font-bold text-[#0F4C75]">Manajemen Order</h1>
          <p className="text-muted-foreground">Kelola semua order pelanggan</p>
        </div>
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
                  placeholder="Cari nama pelanggan, nomor order, atau telepon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter Status Order" />
              </SelectTrigger>
              <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Pesanan Dibuat</SelectItem>
              <SelectItem value="confirmed">Pesanan Dikonfirmasi</SelectItem>
              <SelectItem value="picked_up">Dijemput</SelectItem>
              <SelectItem value="in_process">Sedang Diproses</SelectItem>
              <SelectItem value="ready">Siap Diantar</SelectItem>
              <SelectItem value="delivered">Selesai</SelectItem>
              <SelectItem value="cancelled">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter Status Pembayaran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Menunggu Pembayaran</SelectItem>
                <SelectItem value="paid">Lunas</SelectItem>
                <SelectItem value="failed">Gagal</SelectItem>
                <SelectItem value="cancelled">Dibatalkan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Order</CardTitle>
          <CardDescription>Total {orders.length} order ditemukan</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomor Order</TableHead>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Layanan</TableHead>
                <TableHead>Berat (kg)</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status Order</TableHead>
                <TableHead>Status Pembayaran</TableHead>
                <TableHead>Pickup</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customer_name}</div>
                      <div className="text-sm text-muted-foreground">{order.customer_phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getServiceName(order)}</TableCell>
                  <TableCell>{order.weight ? `${order.weight} kg` : "TBD"}</TableCell>
                  <TableCell>Rp {formatRupiah(order.total_amount)}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>{getPaymentStatusBadge(order.payment_status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(order.pickup_date).toLocaleDateString("id-ID")}</div>
                      <div className="text-muted-foreground">{order.pickup_time}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Detail Order {selectedOrder?.order_number}</DialogTitle>
                            <DialogDescription>Informasi lengkap order pelanggan</DialogDescription>
                          </DialogHeader>
                          {selectedOrder && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Pelanggan</Label>
                                  <p className="font-medium">{selectedOrder.customer_name}</p>
                                  <p className="text-sm text-muted-foreground">{selectedOrder.customer_phone}</p>
                                  {selectedOrder.customer_email && (
                                    <p className="text-sm text-muted-foreground">{selectedOrder.customer_email}</p>
                                  )}
                                </div>
                                <div>
                                  <Label>Status Order</Label>
                                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                                  <div className="mt-2">
                                    <Label>Status Pembayaran</Label>
                                    <div className="mt-1">{getPaymentStatusBadge(selectedOrder.payment_status)}</div>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <Label>Alamat Pickup</Label>
                                <p className="text-sm whitespace-pre-line">{selectedOrder.pickup_address}</p>
                              </div>

                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <Label>Layanan</Label>
                                  <p>{getServiceName(selectedOrder)}</p>
                                </div>
                                <div>
                                  <Label>Tanggal Pickup</Label>
                                  <p>{new Date(selectedOrder.pickup_date).toLocaleDateString("id-ID")}</p>
                                </div>
                                <div>
                                  <Label>Waktu Pickup</Label>
                                  <p>{selectedOrder.pickup_time}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Berat (kg)</Label>
                                  <Input
                                    type="number"
                                    defaultValue={selectedOrder.weight || ""}
                                    step="0.1"
                                    placeholder="Masukkan berat"
                                    onChange={(e) => {
                                      const value = Number.parseFloat(e.target.value)
                                      if (!isNaN(value)) {
                                        updateOrderDetails(selectedOrder.id, { weight: value })
                                      }
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label>Total Amount</Label>
                                  <Input
                                    type="number"
                                    defaultValue={selectedOrder.total_amount}
                                    onChange={(e) => {
                                      const value = Number.parseFloat(e.target.value)
                                      if (!isNaN(value)) {
                                        updateOrderDetails(selectedOrder.id, { total_amount: value })
                                      }
                                    }}
                                  />
                                </div>
                              </div>

                              <div>
                                <Label>Catatan</Label>
                                <Textarea
                                  defaultValue={selectedOrder.notes || ""}
                                  placeholder="Tambahkan catatan..."
                                  onChange={(e) => {
                                    updateOrderDetails(selectedOrder.id, { notes: e.target.value })
                                  }}
                                />
                              </div>

                              {selectedOrder.midtrans_transaction_id && (
                                <div>
                                  <Label>Midtrans Transaction ID</Label>
                                  <p className="text-sm font-mono">{selectedOrder.midtrans_transaction_id}</p>
                                </div>
                              )}

                              <div className="flex gap-2 flex-wrap">
                                <Select
                                  defaultValue={selectedOrder.status}
                                  onValueChange={(value) => updateOrderStatus(selectedOrder.id, value)}
                                  disabled={updating}
                                >
                                  <SelectTrigger className="w-[200px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pesanan Dibuat</SelectItem>
                                    <SelectItem value="confirmed">Pesanan Dikonfirmasi</SelectItem>
                                    <SelectItem value="picked_up">Dijemput</SelectItem>
                                    <SelectItem value="in_process">Sedang Diproses</SelectItem>
                                    <SelectItem value="ready">Siap Diantar</SelectItem>
                                    <SelectItem value="delivered">Selesai</SelectItem>
                                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                                  </SelectContent>
                                </Select>

                                <Select
                                  defaultValue={selectedOrder.payment_status}
                                  onValueChange={(value) => updatePaymentStatus(selectedOrder.id, value)}
                                  disabled={updating}
                                >
                                  <SelectTrigger className="w-[200px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Menunggu Pembayaran</SelectItem>
                                    <SelectItem value="paid">Lunas</SelectItem>
                                    <SelectItem value="failed">Gagal</SelectItem>
                                    <SelectItem value="cancelled">Dibatalkan</SelectItem>
                                  </SelectContent>
                                </Select>

                                {selectedOrder.payment_status === "pending" && (
                                  <Button
                                    onClick={() => createMidtransPayment(selectedOrder)}
                                    disabled={updating}
                                    className="bg-[#0F4C75] hover:bg-[#0F4C75]/90"
                                  >
                                    {updating ? (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                      <CreditCard className="mr-2 h-4 w-4" />
                                    )}
                                    Buat Link Pembayaran
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
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
