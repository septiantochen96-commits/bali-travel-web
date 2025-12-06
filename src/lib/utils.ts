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
  const target = phoneNumber && phoneNumber.trim() ? `/${phoneNumber.trim()}` : ''
  const whatsappUrl = `https://wa.me${target}?text=${encodedMessage}`
  window.open(whatsappUrl, '_blank')
}
