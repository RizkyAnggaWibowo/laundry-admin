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
          customer_name: string
          customer_phone: string
          customer_email?: string | null
          pickup_address: string
          notes?: string | null
          status?: string
          payment_status?: string
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
          customer_name?: string
          customer_phone?: string
          customer_email?: string | null
          pickup_address?: string
          notes?: string | null
          status?: string
          payment_status?: string
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
          description: string | null
          price_per_kg: number | null
          price_per_item: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price_per_kg?: number | null
          price_per_item?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price_per_kg?: number | null
          price_per_item?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
