import React from 'react'

export function SiteHeader() {
  return (
    <header className="flex items-center gap-2 border-b bg-white">
      <div className="flex w-full items-center gap-2 px-4 lg:px-6" style={{ minHeight: 56 }}>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Open sidebar" className="p-2 rounded hover:bg-gray-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <div className="h-4 w-px bg-gray-200" />
          <h1 className="text-base font-medium">CV-Connect</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <a
            href="/"
            className="hidden sm:inline-block text-sm px-2 py-1 rounded hover:bg-gray-100"
          >
            Home
          </a>
        </div>
      </div>
    </header>
  )
}
