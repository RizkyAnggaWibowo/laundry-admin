export interface Database {
  public: {
    Tables: {
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string
          service_type_id: string
          weight: number | null
          total_amount: number
          pickup_date: string
          pickup_time: string
          delivery_date: string | null
          delivery_time: string | null
          delivery_address: string | null
          pickup_option: 'pickup' | 'dropoff'
          delivery_option: 'delivery' | 'selfpickup'
          customer_name: string
          customer_phone: string
          customer_email: string | null
          pickup_address: string
          notes: string | null
          status: 'pending' | 'confirmed' | 'picked_up' | 'in_process' | 'ready' | 'delivered' | 'cancelled' | 'pending_cancellation'
          payment_status: 'pending' | 'paid' | 'settlement' | 'failed' | 'cancelled' | 'expired'
          midtrans_transaction_id: string | null
          midtrans_order_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          user_id: string
          service_type_id: string
          weight?: number | null
          total_amount: number
          pickup_date: string
          pickup_time: string
          delivery_date?: string | null
          delivery_time?: string | null
          delivery_address?: string | null
          pickup_option?: 'pickup' | 'dropoff'
          delivery_option?: 'delivery' | 'selfpickup'
          customer_name: string
          customer_phone: string
          customer_email?: string | null
          pickup_address: string
          notes?: string | null
          status?: 'pending' | 'confirmed' | 'picked_up' | 'in_process' | 'ready' | 'delivered' | 'cancelled' | 'pending_cancellation'
          payment_status?: 'pending' | 'paid' | 'settlement' | 'failed' | 'cancelled' | 'expired'
          midtrans_transaction_id?: string | null
          midtrans_order_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          user_id?: string
          service_type_id?: string
          weight?: number | null
          total_amount?: number
          pickup_date?: string
          pickup_time?: string
          delivery_date?: string | null
          delivery_time?: string | null
          delivery_address?: string | null
          pickup_option?: 'pickup' | 'dropoff'
          delivery_option?: 'delivery' | 'selfpickup'
          customer_name?: string
          customer_phone?: string
          customer_email?: string | null
          pickup_address?: string
          notes?: string | null
          status?: 'pending' | 'confirmed' | 'picked_up' | 'in_process' | 'ready' | 'delivered' | 'cancelled' | 'pending_cancellation'
          payment_status?: 'pending' | 'paid' | 'settlement' | 'failed' | 'cancelled' | 'expired'
          midtrans_transaction_id?: string | null
          midtrans_order_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      service_types: {
        Row: {
          id: string
          name: string
          type: 'kiloan' | 'satuan'
          price: number
          description: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'kiloan' | 'satuan'
          price: number
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'kiloan' | 'satuan'
          price?: number
          description?: string | null
          is_active?: boolean
          created_at?: string        }
      }
      payments: {
        Row: {
          id: string
          order_id: string
          amount: number
          method: string
          status: 'Pending' | 'Verified' | 'Rejected'
          midtrans_transaction_id: string | null
          midtrans_payment_type: string | null
          proof_url: string | null
          verified_at: string | null
          verified_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          amount: number
          method: string
          status?: 'Pending' | 'Verified' | 'Rejected'
          midtrans_transaction_id?: string | null
          midtrans_payment_type?: string | null
          proof_url?: string | null
          verified_at?: string | null
          verified_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          amount?: number
          method?: string
          status?: 'Pending' | 'Verified' | 'Rejected'
          midtrans_transaction_id?: string | null
          midtrans_payment_type?: string | null
          proof_url?: string | null
          verified_at?: string | null
          verified_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
