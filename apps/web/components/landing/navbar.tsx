'use client'

import { Menu } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

const navLinks = [
  { label: 'Pricing', href: '#pricing' },
  { label: 'Get Started', href: '#get-started' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'border-b border-neutral-200 bg-white/80 backdrop-blur-md'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-bruno text-2xl tracking-wide text-neutral-900"
        >
          Plexaris
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
            >
              {link.label}
            </a>
          ))}
          <Button
            variant="ghost"
            className="text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
            asChild
          >
            <Link href="/login">Login</Link>
          </Button>
          <Button
            className="bg-neutral-900 text-white hover:bg-neutral-800"
            asChild
          >
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>

        {/* Mobile nav */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-900 md:hidden"
            >
              <Menu className="size-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="border-neutral-200 bg-white">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="flex flex-col gap-6 pt-8">
              {navLinks.map((link) => (
                <SheetClose key={link.href} asChild>
                  <a
                    href={link.href}
                    className="text-lg text-neutral-600 transition-colors hover:text-neutral-900"
                  >
                    {link.label}
                  </a>
                </SheetClose>
              ))}
              <SheetClose asChild>
                <Link
                  href="/login"
                  className="text-lg text-neutral-600 transition-colors hover:text-neutral-900"
                >
                  Login
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Button
                  className="bg-neutral-900 text-white hover:bg-neutral-800"
                  asChild
                >
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
