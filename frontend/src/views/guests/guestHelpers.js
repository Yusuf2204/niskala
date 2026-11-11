export const GUEST_CATEGORIES = ['General', 'VIP', 'Family', 'Colleague', 'Friend']

export const ATTENDANCE_LABELS = {
  attending: 'Hadir',
  not_attending: 'Tidak Hadir',
  tentative: 'Ragu-ragu',
}

export const ATTENDANCE_COLORS = {
  attending: 'success',
  not_attending: 'danger',
  tentative: 'warning',
}

export const buildInvitationGuestUrl = (slug, guest) => {
  if (!slug || typeof window === 'undefined') return ''
  const params = new URLSearchParams()
  if (guest?.name) {
    params.set('to', guest.name)
  }
  if (guest?.slug_token) {
    params.set('c', guest.slug_token)
  }
  const query = params.toString()
  return `${window.location.origin}/#/p/${slug}${query ? `?${query}` : ''}`
}

export const normalizeWhatsAppPhone = (phone) => {
  if (!phone) return ''
  const digits = String(phone).replace(/[^\d]/g, '')
  if (!digits) return ''
  if (digits.startsWith('0')) {
    return `62${digits.slice(1)}`
  }
  return digits
}

export const buildWhatsAppShareUrl = ({ slug, guest, invitationTitle }) => {
  const url = buildInvitationGuestUrl(slug, guest)
  const recipient = guest?.name || 'Bapak/Ibu/Saudara/i'
  const titleText = invitationTitle ? `*${invitationTitle}*` : 'acara kami'
  const text = [
    `Kepada Yth. *${recipient}*,`,
    '',
    `Tanpa mengurangi rasa hormat, perkenankan kami mengundang Anda untuk hadir serta memberikan doa restu pada ${titleText}.`,
    '',
    `Tautan undangan personal:`,
    url,
    '',
    'Atas perhatian dan doa restunya, kami ucapkan terima kasih.',
  ].join('\n')

  const phone = normalizeWhatsAppPhone(guest?.phone_number)
  const base = 'https://api.whatsapp.com/send'
  const params = new URLSearchParams()
  if (phone) {
    params.set('phone', phone)
  }
  params.set('text', text)
  return `${base}?${params.toString()}`
}

export const formatDateTimeId = (isoValue) => {
  if (!isoValue) return '-'
  try {
    return new Date(isoValue).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return String(isoValue)
  }
}

export const parseBulkGuestLines = (rawText) => {
  if (!rawText) return []
  return rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/[;,|\t]/).map((p) => p.trim())
      const name = (parts[0] || '').slice(0, 150)
      const phone = parts[1] || ''
      const rawCat = parts[2] || 'General'
      const matchedCategory =
        GUEST_CATEGORIES.find((cat) => cat.toLowerCase() === rawCat.toLowerCase()) || 'General'
      const parsedPax = parseInt(parts[3], 10)
      const paxAllocated =
        Number.isFinite(parsedPax) && parsedPax >= 1 && parsedPax <= 20 ? parsedPax : 1

      return {
        name,
        phone_number: phone || null,
        category: matchedCategory,
        pax_allocated: paxAllocated,
      }
    })
    .filter((item) => item.name.length > 0)
}
