import { createHash } from "crypto"

export interface MidtransConfig {
  serverKey: string
  clientKey: string
  merchantId: string
  isProduction: boolean
}

export const midtransConfig: MidtransConfig = {
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
  merchantId: process.env.MERCHANT_ID!,
  isProduction: false, // Set to true for production
}

export interface TransactionDetails {
  order_id: string
  gross_amount: number
}

export interface CustomerDetails {
  first_name: string
  last_name?: string
  email: string
  phone: string
  billing_address?: {
    first_name: string
    last_name?: string
    email: string
    phone: string
    address: string
    city: string
    postal_code: string
    country_code: string
  }
}

export interface MidtransPayload {
  transaction_details: TransactionDetails
  customer_details: CustomerDetails
  enabled_payments: string[]
  callbacks?: {
    finish: string
  }
}

export class MidtransService {
  private baseUrl: string
  private serverKey: string

  constructor() {
    this.baseUrl = midtransConfig.isProduction ? "https://api.midtrans.com/v2" : "https://api.sandbox.midtrans.com/v2"
    this.serverKey = midtransConfig.serverKey
  }

  private getAuthHeader(): string {
    return Buffer.from(this.serverKey + ":").toString("base64")
  }

  async createTransaction(payload: MidtransPayload) {
    try {
      const response = await fetch(`${this.baseUrl}/charge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${this.getAuthHeader()}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error creating Midtrans transaction:", error)
      throw error
    }
  }

  async getTransactionStatus(orderId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/${orderId}/status`, {
        method: "GET",
        headers: {
          Authorization: `Basic ${this.getAuthHeader()}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error getting transaction status:", error)
      throw error
    }
  }

  verifySignature(orderId: string, statusCode: string, grossAmount: string, signatureKey: string): boolean {
    const input = orderId + statusCode + grossAmount + this.serverKey
    const hash = createHash("sha512").update(input).digest("hex")
    return hash === signatureKey
  }
}

export const midtransService = new MidtransService()
