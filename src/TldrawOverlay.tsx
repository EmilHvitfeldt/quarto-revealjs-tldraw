import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Editor, TLEditorSnapshot, Tldraw, TLPageId, TLComponents } from 'tldraw'
import 'tldraw/tldraw.css'
import './style.css'
import { CustomMainMenu } from './CustomMainMenu'

const TLDRAW_COMPONENTS: TLComponents = {
  MainMenu: CustomMainMenu,
  ContextMenu: null,
  HelpMenu: null,
  NavigationPanel: null,
  PageMenu: null,
  DebugPanel: null,
}

const STORAGE_KEY = 'quarto-revealjs-tldraw'

function makePageId(h: number, v: number): TLPageId {
  return `page:slide-${h}-${v}` as TLPageId
}

function loadStoredSnapshot(): TLEditorSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

interface Props {
  deck: any
  slideWidth: number
  licenseKey?: string
}

export function TldrawOverlay({ deck, slideWidth, licenseKey }: Props) {
  const editorRef = useRef<Editor | null>(null)
  const [isActive, setIsActive] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // The overlay is full-screen. We set the camera so that world (0,0) maps to the
  // top-left of the slide area, and zoom matches the slide scale.
  // This way tldraw's UI chrome sits at the window edges, not inside the slide.
  const updatePosition = useCallback(() => {
    const slidesEl = document.querySelector('.reveal .slides') as HTMLElement | null
    if (!slidesEl) return

    const rect = slidesEl.getBoundingClientRect()
    const editor = editorRef.current
    if (editor) {
      const scale = rect.width / slideWidth
      editor.setCameraOptions({ isLocked: false })
      editor.setCamera({ x: rect.left, y: rect.top, z: scale })
      editor.setCameraOptions({ isLocked: true })
    }
  }, [slideWidth])

  useEffect(() => {
    // Small delay to let Reveal finish its initial layout
    const timer = setTimeout(updatePosition, 50)
    window.addEventListener('resize', updatePosition)
    deck.on('resize', updatePosition)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updatePosition)
      deck.off('resize', updatePosition)
    }
  }, [deck, updatePosition])

  const saveSnapshot = useCallback(() => {
    const editor = editorRef.current
    if (!editor) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      const snapshot = editor.getSnapshot()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
    }, 500)
  }, [])

  const switchToSlide = useCallback((h: number, v: number) => {
    const editor = editorRef.current
    if (!editor) return
    const pageId = makePageId(h, v)
    const exists = editor.getPages().some((p) => p.id === pageId)
    if (!exists) {
      editor.createPage({ id: pageId, name: `Slide ${h + 1}${v ? `.${v + 1}` : ''}` })
    }
    editor.setCurrentPage(pageId)
  }, [])

  const handleMount = useCallback(
    (editor: Editor) => {
      editorRef.current = editor

      // Restore persisted drawings before locking camera
      const snapshot = loadStoredSnapshot()
      if (snapshot) {
        try {
          editor.loadSnapshot(snapshot)
        } catch {
          // ignore stale snapshots
        }
      }

      // Navigate to current slide's page
      const indices = deck.getIndices()
      switchToSlide(indices.h, indices.v ?? 0)

      // Position overlay and lock camera to slide bounds
      updatePosition()

      // Auto-save on any document change; store the unsubscribe for cleanup
      const unsubscribe = editor.store.listen(saveSnapshot, { scope: 'document' })
      return unsubscribe
    },
    [deck, switchToSlide, saveSnapshot, updatePosition],
  )

  // Cleanup save timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [])

  // Slide change → switch tldraw page
  useEffect(() => {
    const onSlideChange = () => {
      const indices = deck.getIndices()
      switchToSlide(indices.h, indices.v ?? 0)
    }
    deck.on('slidechanged', onSlideChange)
    return () => deck.off('slidechanged', onSlideChange)
  }, [deck, switchToSlide])

  // Keyboard toggle: T/t to activate/deactivate (CapsLock-safe), Escape to deactivate
  // Also listens for the custom event fired by the Tools menu item
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if ((e.key === 't' || e.key === 'T') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        setIsActive((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setIsActive(false)
      }
    }
    const onToggle = () => setIsActive((prev) => !prev)
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('tldraw:toggle', onToggle)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('tldraw:toggle', onToggle)
    }
  }, [])

  // Sync container class for pointer-events
  useEffect(() => {
    const el = document.getElementById('tldraw-overlay-root')
    if (!el) return
    el.classList.toggle('tldraw-active', isActive)
    el.classList.toggle('tldraw-inactive', !isActive)
  }, [isActive])

  return (
    <Tldraw
      onMount={handleMount}
      hideUi={!isActive}
      components={TLDRAW_COMPONENTS}
      licenseKey={licenseKey}
    />
  )
}
