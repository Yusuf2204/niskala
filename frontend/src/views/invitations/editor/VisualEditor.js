import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { CSpinner } from '@coreui/react'
import EditorTopBar from './EditorTopBar'
import SectionPalette from './SectionPalette'
import EditorCanvas from './EditorCanvas'
import PropertyInspector from './PropertyInspector'
import PreviewModal from './PreviewModal'
import { COMPONENT_REGISTRY, createNewSection } from './registry'
import api from '../../../services/api'
import { toastSuccess, toastError } from '../../../services/toastService'

const MAX_HISTORY = 30
const DEBOUNCE_DELAY = 1500

const VisualEditor = () => {
  const { id } = useParams()

  const [loading, setLoading] = useState(true)
  const [invitation, setInvitation] = useState(null)
  const [sections, setSections] = useState([])
  const [selectedSectionId, setSelectedSectionId] = useState(null)
  const [musicCatalog, setMusicCatalog] = useState([])
  const [musicUrl, setMusicUrl] = useState('')

  // Viewport mode: USER CONSTRAINT: default to 'web'
  const [viewportMode, setViewportMode] = useState('web')

  // Autosave status
  const [autosaveStatus, setAutosaveStatus] = useState('idle') // 'idle' | 'saving' | 'saved' | 'error'
  const [lastSavedAt, setLastSavedAt] = useState(null)
  const [publishLoading, setPublishLoading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  // Local Undo / Redo History Stack
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const isHistoryAction = useRef(false)
  const debounceTimer = useRef(null)

  // Initial load
  const loadInvitationData = async () => {
    setLoading(true)
    try {
      const [invRes, musicRes] = await Promise.all([
        api.get(`/v1/invitations/${id}`),
        api.get('/v1/music').catch(() => ({ data: { data: [] } })),
      ])

      const invData = invRes.data.data
      setInvitation(invData)
      setMusicCatalog(musicRes.data.data?.data || musicRes.data.data || [])

      let initialSections = invData.content?.sections_data || []

      // If no sections exist yet, populate default luxury wedding preset
      if (!Array.isArray(initialSections) || initialSections.length === 0) {
        initialSections = [
          createNewSection('HeroCover'),
          createNewSection('CoupleProfile'),
          createNewSection('CountdownTimer'),
          createNewSection('EventSchedule'),
          createNewSection('LocationMap'),
          createNewSection('PhotoGallery'),
          createNewSection('LoveStory'),
          createNewSection('GiftRegistry'),
          createNewSection('RsvpSection'),
          createNewSection('FooterSection'),
        ].filter(Boolean)
      }

      // Merge defaultProps with any existing props so all fields render completely
      const normalizedSections = initialSections.map((sec) => {
        const meta = COMPONENT_REGISTRY[sec.type] || {}
        const mergedProps = {
          ...(meta.defaultProps || {}),
          ...(sec.props || {}),
        }
        // If title is empty in props, fallback to default or invitation title
        if (!mergedProps.title && meta.defaultProps?.title) {
          mergedProps.title = meta.defaultProps.title
        }
        return {
          ...sec,
          props: mergedProps,
        }
      })

      setSections(normalizedSections)
      setMusicUrl(invData.content?.music_url || '')
      setSelectedSectionId(normalizedSections[0]?.id || null)

      // Initialize history
      setHistory([JSON.stringify(normalizedSections)])
      setHistoryIndex(0)
    } catch (err) {
      toastError(err.response?.data?.message || 'Gagal memuat data undangan.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInvitationData()
  }, [id])

  // Push state to history
  const pushHistory = useCallback(
    (newSections) => {
      const serialized = JSON.stringify(newSections)
      setHistory((prev) => {
        const sliced = prev.slice(0, historyIndex + 1)
        const updated = [...sliced, serialized]
        if (updated.length > MAX_HISTORY) {
          return updated.slice(updated.length - MAX_HISTORY)
        }
        return updated
      })
      setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY - 1))
    },
    [historyIndex],
  )

  // Save to backend API
  const saveContentToServer = useCallback(
    async (sectionsToSave, currentMusicUrl) => {
      if (!id) return
      setAutosaveStatus('saving')
      try {
        await api.put(`/v1/invitations/${id}/content`, {
          sections_data: sectionsToSave,
          music_url: currentMusicUrl || null,
          settings: invitation?.content?.settings || {},
        })
        setAutosaveStatus('saved')
        const now = new Date()
        setLastSavedAt(
          now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        )
      } catch {
        setAutosaveStatus('error')
      }
    },
    [id, invitation],
  )

  // Trigger changes and schedule autosave debounce
  const updateSectionsState = useCallback(
    (newSections, skipHistory = false) => {
      setSections(newSections)

      if (!skipHistory) {
        pushHistory(newSections)
      }

      // Schedule Autosave with 1500ms debounce
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
      setAutosaveStatus('idle')
      debounceTimer.current = setTimeout(() => {
        saveContentToServer(newSections, musicUrl)
      }, DEBOUNCE_DELAY)
    },
    [pushHistory, saveContentToServer, musicUrl],
  )

  // Undo handler
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1
      isHistoryAction.current = true
      const parsed = JSON.parse(history[prevIndex])
      setSections(parsed)
      setHistoryIndex(prevIndex)
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      saveContentToServer(parsed, musicUrl)
    }
  }, [history, historyIndex, musicUrl, saveContentToServer])

  // Redo handler
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1
      isHistoryAction.current = true
      const parsed = JSON.parse(history[nextIndex])
      setSections(parsed)
      setHistoryIndex(nextIndex)
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      saveContentToServer(parsed, musicUrl)
    }
  }, [history, historyIndex, musicUrl, saveContentToServer])

  // Keyboard shortcut listener for Ctrl+Z and Ctrl+Y
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault()
          handleRedo()
        } else {
          e.preventDefault()
          handleUndo()
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault()
        handleRedo()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleUndo, handleRedo])

  // Section Manipulation Handlers
  const handleAddSection = (newSec) => {
    const sectionToAdd = newSec || createNewSection('HeroCover')
    const updated = [...sections, sectionToAdd]
    updateSectionsState(updated)
    setSelectedSectionId(sectionToAdd.id)
    toastSuccess(`Section ${COMPONENT_REGISTRY[sectionToAdd.type]?.name || sectionToAdd.type} ditambahkan!`)
  }

  const handleMoveSection = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= sections.length) return
    const updated = [...sections]
    const [moved] = updated.splice(fromIndex, 1)
    updated.splice(toIndex, 0, moved)
    updateSectionsState(updated)
  }

  const handleDuplicateSection = (sectionId) => {
    const idx = sections.findIndex((s) => s.id === sectionId)
    if (idx === -1) return
    const original = sections[idx]
    const duplicated = {
      ...original,
      id: `sec-${original.type.toLowerCase()}-${Date.now().toString(36)}`,
      props: JSON.parse(JSON.stringify(original.props)),
    }
    const updated = [...sections]
    updated.splice(idx + 1, 0, duplicated)
    updateSectionsState(updated)
    setSelectedSectionId(duplicated.id)
    toastSuccess('Section berhasil diduplikasi!')
  }

  const handleDeleteSection = (sectionId) => {
    const updated = sections.filter((s) => s.id !== sectionId)
    updateSectionsState(updated)
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(updated[0]?.id || null)
    }
    toastSuccess('Section berhasil dihapus.')
  }

  const handleUpdateProps = (sectionId, newProps) => {
    const updated = sections.map((s) => (s.id === sectionId ? { ...s, props: newProps } : s))
    updateSectionsState(updated)
  }

  const handleUpdateMusicUrl = (newUrl) => {
    setMusicUrl(newUrl)
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      saveContentToServer(sections, newUrl)
    }, DEBOUNCE_DELAY)
  }

  const handleManualSave = () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    saveContentToServer(sections, musicUrl)
  }

  const handlePublish = async () => {
    if (sections.length === 0) {
      toastError('Tidak dapat mempublikasikan undangan tanpa section konten.')
      return
    }

    setPublishLoading(true)
    try {
      // First save current content
      await api.put(`/v1/invitations/${id}/content`, {
        sections_data: sections,
        music_url: musicUrl || null,
        settings: invitation?.content?.settings || {},
      })
      // Then publish
      const res = await api.post(`/v1/invitations/${id}/publish`)
      setInvitation(res.data.data)
      toastSuccess('Selamat! Undangan berhasil dipublikasikan.')
    } catch (err) {
      toastError(err.response?.data?.message || 'Gagal mempublikasikan undangan.')
    } finally {
      setPublishLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="secondary" />
        <p className="mt-2 text-muted small">Memuat Visual Editor...</p>
      </div>
    )
  }

  const activeSection = sections.find((s) => s.id === selectedSectionId)

  return (
    <div
      className="d-flex flex-column"
      style={{
        height: 'calc(100vh - 110px)',
        minHeight: '680px',
        margin: '-1rem -1rem 0 -1rem',
      }}
    >
      {/* 1. TOP BAR */}
      <EditorTopBar
        invitation={invitation}
        autosaveStatus={autosaveStatus}
        lastSavedAt={lastSavedAt}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        viewportMode={viewportMode}
        onToggleViewport={setViewportMode}
        onOpenPreview={() => setPreviewOpen(true)}
        onManualSave={handleManualSave}
        onPublish={handlePublish}
        publishLoading={publishLoading}
      />

      {/* 2. BODY CONTAINER: PANEL KIRI, KANVAS TENGAH, PANEL KANAN */}
      <div className="d-flex flex-grow-1 overflow-hidden">
        {/* Panel Kiri: Section Catalog & Layers */}
        <SectionPalette
          sections={sections}
          selectedSectionId={selectedSectionId}
          onSelectSection={setSelectedSectionId}
          onAddSection={handleAddSection}
          onMoveSection={handleMoveSection}
          onDuplicateSection={handleDuplicateSection}
          onDeleteSection={handleDeleteSection}
        />

        {/* Kanvas Tengah: Interactive Preview Canvas (Web mode default) */}
        <EditorCanvas
          sections={sections}
          selectedSectionId={selectedSectionId}
          onSelectSection={setSelectedSectionId}
          onMoveSection={handleMoveSection}
          onDuplicateSection={handleDuplicateSection}
          onDeleteSection={handleDeleteSection}
          onAddSection={handleAddSection}
          viewportMode={viewportMode}
        />

        {/* Panel Kanan: Property Inspector & Media Uploader */}
        <PropertyInspector
          invitation={invitation}
          section={activeSection}
          onUpdateProps={handleUpdateProps}
          onUpdateMusicUrl={handleUpdateMusicUrl}
          musicCatalog={musicCatalog}
        />
      </div>

      {/* Modal Preview Layar Penuh */}
      <PreviewModal
        visible={previewOpen}
        onClose={() => setPreviewOpen(false)}
        sections={sections}
        title={invitation?.title}
      />
    </div>
  )
}

export default VisualEditor
