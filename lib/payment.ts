// Payment utility functions

interface PaymentQRData {
  orderId: string
  amount: number
  customerName: string
  email: string
}

export async function generatePaymentQR(data: PaymentQRData): Promise<string> {
  // Return your provided QR code image for payment
  // This QR code will be shown to customers for UPI payment
  return "https://res.cloudinary.com/dklqhgo8r/image/upload/v1758137642/cachesm-qr-1758137393758_hztjjq.jpg"
}

export function generateUPILink(data: PaymentQRData): string {
  // Generate UPI payment link
  return `upi://pay?pa=merchant@upi&pn=BundleHub&am=${data.amount}&cu=INR&tn=Order ${data.orderId}`
}

export function formatCurrency(amount: number, currency: string = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
  }).format(amount)
}