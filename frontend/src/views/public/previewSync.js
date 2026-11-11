const STORAGE_PREFIX = 'niskala_preview_draft_'
const CHANNEL_PREFIX = 'niskala-preview-'

export const getPreviewStorageKey = (id) => `${STORAGE_PREFIX}${id}`
export const getPreviewChannelName = (id) => `${CHANNEL_PREFIX}${id}`

const isValidSnapshot = (value) =>
  Boolean(value && typeof value === 'object' && Array.isArray(value.sections_data))

export const publishPreviewSnapshot = (id, payload) => {
  if (!id || !payload) return null

  const snapshot = {
    invitationId: String(id),
    sections_data: Array.isArray(payload.sections_data) ? payload.sections_data : [],
    music_url: payload.music_url || '',
    settings: payload.settings || {},
    updatedAt: Date.now(),
  }

  try {
    window.localStorage.setItem(getPreviewStorageKey(id), JSON.stringify(snapshot))
  } catch {
    // Ignore storage quota or private browsing errors
  }

  if (typeof window !== 'undefined' && typeof window.BroadcastChannel === 'function') {
    let channel = null
    try {
      channel = new window.BroadcastChannel(getPreviewChannelName(id))
      channel.postMessage(snapshot)
    } catch {
      // Ignore BroadcastChannel errors on restricted contexts
    } finally {
      if (channel) channel.close()
    }
  }

  return snapshot
}

export const readPreviewSnapshot = (id) => {
  if (!id || typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(getPreviewStorageKey(id))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return isValidSnapshot(parsed) ? parsed : null
  } catch {
    return null
  }
}

export const subscribePreviewUpdates = (id, onUpdate) => {
  if (!id || typeof window === 'undefined' || typeof onUpdate !== 'function') {
    return () => {}
  }

  const storageKey = getPreviewStorageKey(id)
  let channel = null

  if (typeof window.BroadcastChannel === 'function') {
    try {
      channel = new window.BroadcastChannel(getPreviewChannelName(id))
      channel.onmessage = (event) => {
        if (isValidSnapshot(event.data)) {
          onUpdate(event.data)
        }
      }
    } catch {
      channel = null
    }
  }

  const handleStorage = (event) => {
    if (event.key !== storageKey || !event.newValue) return
    try {
      const parsed = JSON.parse(event.newValue)
      if (isValidSnapshot(parsed)) {
        onUpdate(parsed)
      }
    } catch {
      // Ignore malformed storage payload
    }
  }

  window.addEventListener('storage', handleStorage)

  return () => {
    window.removeEventListener('storage', handleStorage)
    if (channel) channel.close()
  }
}
