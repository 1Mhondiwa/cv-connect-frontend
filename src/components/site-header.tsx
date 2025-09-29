import React from 'react'

export function SiteHeader({ title = "CV-Connect" }) {
  return (
    <header 
      style={{
        position: 'fixed',
        top: 0,
        left: '280px', // Account for sidebar width
        right: 0,
        height: '60px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        zIndex: 1000,
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            aria-label="Menu" 
            style={{
              padding: '8px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#f3f4f6'}
            onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = 'transparent'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 6H21M3 12H21M3 18H21" stroke="#374151" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          {/* vertical divider retained for spacing */}
          <div style={{ height: '20px', width: '1px', backgroundColor: '#d1d5db' }} />
        </div>
        <div className="flex items-center gap-2" />
      </div>
    </header>
  )
}
