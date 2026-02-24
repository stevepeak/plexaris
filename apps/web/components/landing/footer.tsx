import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-bruno text-lg tracking-wide text-neutral-900"
        >
          Plexaris
        </Link>
        <p className="text-sm text-neutral-400">
          &copy; {new Date().getFullYear()} Plexaris. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
