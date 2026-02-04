import { type RefObject, useEffect } from 'react'

import { type OrderCartHandle } from './order-cart'
import { type PanelState } from './panel-toggle-bar'
import { type TabItem, tabKey } from './types'

interface UseOrderHotkeysOptions {
  panels: PanelState
  onTogglePanel: (panel: keyof PanelState) => void
  tabs: TabItem[]
  activeTabKey: string | null
  setActiveTabKey: (key: string) => void
  closeTab: (key: string) => void
  searchInputRef: RefObject<HTMLInputElement | null>
  cartRef: RefObject<OrderCartHandle | null>
  onNavigateHome: () => void
  onOpenShortcuts: () => void
  onOpenActivityTab?: () => void
  onOpenCartTab?: () => void
}

function isInputFocused(): boolean {
  const el = document.activeElement
  if (!el) return false
  const tag = el.tagName.toLowerCase()
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true
  if ((el as HTMLElement).isContentEditable) return true
  return false
}

export function useOrderHotkeys({
  panels,
  onTogglePanel,
  tabs,
  activeTabKey,
  setActiveTabKey,
  closeTab,
  searchInputRef,
  cartRef,
  onNavigateHome,
  onOpenShortcuts,
  onOpenActivityTab,
  onOpenCartTab,
}: UseOrderHotkeysOptions) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Escape in search box → go home and blur
      if (e.key === 'Escape') {
        if (document.activeElement === searchInputRef.current) {
          e.preventDefault()
          onNavigateHome()
          searchInputRef.current?.blur()
          return
        }
      }

      // Skip all other shortcuts when typing in an input
      if (isInputFocused()) return

      // Ignore when modifier keys are held (allow native Cmd+C, Ctrl+V, etc.)
      if (e.metaKey || e.ctrlKey || e.altKey) return

      switch (e.key) {
        case '/': {
          e.preventDefault()
          onOpenShortcuts()
          break
        }
        case 'w': {
          if (activeTabKey) {
            e.preventDefault()
            closeTab(activeTabKey)
          }
          break
        }
        case 'c': {
          e.preventDefault()
          onTogglePanel('chat')
          break
        }
        case 's': {
          e.preventDefault()
          if (!panels.search) {
            onTogglePanel('search')
          }
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              searchInputRef.current?.focus()
            })
          })
          break
        }
        case 'a': {
          e.preventDefault()
          onOpenActivityTab?.()
          break
        }
        case 'e': {
          e.preventDefault()
          onOpenCartTab?.()
          break
        }
        case 'k': {
          e.preventDefault()
          onTogglePanel('order')
          break
        }
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9': {
          const index = parseInt(e.key) - 1
          if (index < tabs.length) {
            e.preventDefault()
            setActiveTabKey(tabKey(tabs[index]!))
          }
          break
        }
        case 'ArrowUp': {
          if (panels.order) {
            e.preventDefault()
            cartRef.current?.focusPrev()
          }
          break
        }
        case 'ArrowDown': {
          if (panels.order) {
            e.preventDefault()
            cartRef.current?.focusNext()
          }
          break
        }
        case 'Delete':
        case 'Backspace': {
          if (panels.order) {
            e.preventDefault()
            cartRef.current?.deleteSelected()
          }
          break
        }
        case '=':
        case '+': {
          if (panels.order) {
            e.preventDefault()
            cartRef.current?.incrementSelected()
          }
          break
        }
        case '-':
        case '_': {
          if (panels.order) {
            e.preventDefault()
            cartRef.current?.decrementSelected()
          }
          break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [
    panels,
    onTogglePanel,
    tabs,
    activeTabKey,
    setActiveTabKey,
    closeTab,
    searchInputRef,
    cartRef,
    onNavigateHome,
    onOpenShortcuts,
    onOpenActivityTab,
    onOpenCartTab,
  ])
}
