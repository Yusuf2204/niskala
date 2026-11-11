export const SERVICE_TYPE_META = {
  full_creation: {
    label: 'Pembuatan Penuh',
    description:
      'Tim admin membantu membuat draf undangan lengkap dari awal sesuai data acara Anda.',
    color: 'primary',
  },
  custom_styling: {
    label: 'Penataan Desain',
    description: 'Menata ulang komposisi seksi, estetika visual, dan musik latar pada draf Anda.',
    color: 'info',
  },
  data_entry: {
    label: 'Input Data & Tamu',
    description:
      'Membantu mengisikan detail profil, jadwal acara, galeri, serta daftar tamu undangan.',
    color: 'warning',
  },
  review: {
    label: 'Tinjau & Kurasi',
    description: 'Pemeriksaan menyeluruh tata letak, tautan peta, ejaan, dan kesiapan publikasi.',
    color: 'secondary',
  },
}

export const ORDER_STATUS_META = {
  pending_review: {
    label: 'Menunggu Review',
    color: 'warning',
    badgeClass: 'bg-warning-subtle text-warning border border-warning-subtle',
  },
  in_progress: {
    label: 'Sedang Dikerjakan',
    color: 'info',
    badgeClass: 'bg-info-subtle text-info border border-info-subtle',
  },
  client_review: {
    label: 'Perlu Review Anda',
    color: 'primary',
    badgeClass: 'bg-primary-subtle text-primary border border-primary-subtle',
  },
  completed: {
    label: 'Selesai',
    color: 'success',
    badgeClass: 'bg-success-subtle text-success border border-success-subtle',
  },
  cancelled: {
    label: 'Dibatalkan',
    color: 'secondary',
    badgeClass: 'bg-secondary-subtle text-body-secondary border border-secondary-subtle',
  },
}

export const AUDIT_ACTION_LABELS = {
  'service_order.created': 'Tiket Bantuan Dibuat',
  'service_order.assigned': 'Penugasan Admin Diperbarui',
  'service_order.status_updated': 'Status Tiket Diubah',
  'service_order.approved': 'Hasil Disetujui Pelanggan',
  'service_order.revision_requested': 'Revisi Diminta Pelanggan',
  'service_order.cancelled': 'Tiket Dibatalkan',
  'service_order.invitation_created': 'Undangan Klien Dibuat Admin',
  'invitation.admin_updated': 'Info Undangan Diedit Admin',
  'invitation.admin_content_updated': 'Konten Editor Diedit Admin',
  'invitation.admin_media_uploaded': 'Media Diunggah Admin',
  'invitation.published': 'Undangan Dipublikasikan',
  'invitation.archived': 'Undangan Diarsipkan',
  'invitation.deleted': 'Undangan Dihapus',
}

export const ALLOWED_ADMIN_TRANSITIONS = {
  pending_review: ['pending_review', 'in_progress', 'cancelled'],
  in_progress: ['in_progress', 'client_review', 'cancelled'],
  client_review: ['client_review', 'in_progress', 'completed', 'cancelled'],
  completed: ['completed'],
  cancelled: ['cancelled'],
}

export const formatDateTimeId = (isoString) => {
  if (!isoString) return '-'
  const parsed = new Date(isoString)
  if (Number.isNaN(parsed.getTime())) return '-'
  return parsed.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const openInvitationPreviewTab = (invitationId) => {
  if (!invitationId) return
  window.open(`/#/preview/${invitationId}`, '_blank', 'noopener,noreferrer')
}
