import React from 'react'
import { createRoot } from 'react-dom/client'
import { TldrawOverlay } from './TldrawOverlay'

declare global {
  interface Window {
    RevealTldraw: any
    RevealMenuToolHandlers: Record<string, (event: Event) => void>
  }
}

window.RevealTldraw = {
  id: 'tldraw',
  init(deck: any) {
    const config = deck.getConfig()
    const slideWidth = config.width ?? 960

    const container = document.createElement('div')
    container.id = 'tldraw-overlay-root'
    container.classList.add('tldraw-inactive')
    document.body.appendChild(container)

    const root = createRoot(container)
    root.render(
      <TldrawOverlay
        deck={deck}
        slideWidth={slideWidth}
      />,
    )

    // Register the menu handler — dispatches a custom event the React component listens to
    window.RevealMenuToolHandlers = window.RevealMenuToolHandlers ?? {}
    window.RevealMenuToolHandlers.toggleTldraw = (event: Event) => {
      event.preventDefault()
      document.dispatchEvent(new CustomEvent('tldraw:toggle'))
      deck.getPlugin('menu')?.closeMenu?.()
    }

    // After Reveal is fully ready, inject our item into the Tools panel
    deck.on('ready', () => {
      // Find the Tools toolbar button by its label text, then get its panel id
      const toolsButton = Array.from(
        document.querySelectorAll<HTMLElement>('.slide-menu-toolbar .toolbar-panel-button'),
      ).find((el) => el.querySelector('.slide-menu-toolbar-label')?.textContent === 'Tools')

      if (!toolsButton) return
      const panelId = toolsButton.getAttribute('data-panel')
      const ul = document.querySelector<HTMLElement>(`div[data-panel="${panelId}"] ul.slide-menu-items`)
      if (!ul) return

      const nextIndex = ul.querySelectorAll('li[data-item]').length
      const li = document.createElement('li')
      li.className = 'slide-tool-item'
      li.setAttribute('data-item', String(nextIndex))
      li.innerHTML = `<a href="#" onclick="RevealMenuToolHandlers.toggleTldraw(event)"><kbd>T</kbd> Toggle Drawing</a>`
      ul.appendChild(li)
    })
  },
}
