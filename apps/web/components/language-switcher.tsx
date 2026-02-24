'use i18n'
'use client'

import { Languages } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import {
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'

const locales = [
  { code: 'en', label: '🇬🇧 English' },
  { code: 'nl', label: '🇳🇱 Nederlands' },
] as const

function getLocale(): string {
  if (typeof document === 'undefined') return 'en'
  const match = document.cookie.match(/(?:^|;\s*)locale=([^;]*)/)
  return match?.[1] ?? 'en'
}

function setLocale(locale: string) {
  document.cookie = `locale=${locale};path=/;max-age=31536000;samesite=lax`
  window.location.reload()
}

export function LanguageSwitcher() {
  const [current, setCurrent] = useState('en')
  useEffect(() => setCurrent(getLocale()), [])

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Languages className="h-4 w-4" />
      {locales.map((l, i) => (
        <span key={l.code} className="flex items-center gap-2">
          {i > 0 && <span className="text-border">|</span>}
          <button
            type="button"
            onClick={() => {
              if (l.code !== current) setLocale(l.code)
            }}
            className={
              l.code === current
                ? 'font-medium text-foreground'
                : 'underline-offset-4 hover:text-foreground hover:underline'
            }
          >
            {l.label}
          </button>
        </span>
      ))}
    </div>
  )
}

export function LanguageSubmenu() {
  const [current, setCurrent] = useState('en')
  useEffect(() => setCurrent(getLocale()), [])

  const handleChange = useCallback((value: string) => {
    if (value !== getLocale()) {
      setLocale(value)
    }
  }, [])

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <Languages className="mr-2 h-4 w-4" />
        Language
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <DropdownMenuRadioGroup value={current} onValueChange={handleChange}>
            {locales.map((l) => (
              <DropdownMenuRadioItem key={l.code} value={l.code}>
                {l.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  )
}
