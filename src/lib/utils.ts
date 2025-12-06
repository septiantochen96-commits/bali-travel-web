export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatCurrency(amount: string, currency: 'IDR' | 'USD'): string {
  if (currency === 'IDR') {
    return `Rp ${amount}`
  } else {
    return `$${amount}`
  }
}

export function generateWhatsAppMessage(tourTitle: string): string {
  return `Hello! I'm interested in booking the "${tourTitle}" tour. Could you please provide more information about availability and pricing?`
}

export function openWhatsApp(message: string, phoneNumber?: string): void {
  const encodedMessage = encodeURIComponent(message)
  const phone = phoneNumber && phoneNumber.trim() ? phoneNumber.trim() : ''
  const schemeUrl = phone
    ? `whatsapp://send?phone=${phone}&text=${encodedMessage}`
    : `whatsapp://send?text=${encodedMessage}`
  const webUrl = phone
    ? `https://wa.me/${phone}?text=${encodedMessage}`
    : `https://wa.me/?text=${encodedMessage}`
  const start = Date.now()
  window.location.href = schemeUrl
  setTimeout(() => {
    if (Date.now() - start < 1500) {
      window.location.href = webUrl
    }
  }, 1200)
}
