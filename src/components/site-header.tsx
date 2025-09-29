import React from 'react'

export function SiteHeader({ title = "CV-Connect", onToggleSidebar, isSidebarCollapsed = false }) {
  return (
    <header 
      style={{
        position: 'fixed',
        top: 0,
        left: isSidebarCollapsed ? '60px' : '280px', // Account for sidebar width
        right: 0,
        height: '60px',
        backgroundColor: '#ffffff',
        borderBottom: '2px solid rgba(253, 104, 14, 0.2)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        zIndex: 1000,
        boxShadow: '0 2px 6px rgba(253, 104, 14, 0.1)'
      }}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            aria-label="Toggle Sidebar" 
            onClick={onToggleSidebar}
            style={{
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              backgroundColor: '#fd680e',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              (e.target as HTMLElement).style.backgroundColor = '#e55a00';
              (e.target as HTMLElement).style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              (e.target as HTMLElement).style.backgroundColor = '#fd680e';
              (e.target as HTMLElement).style.transform = 'scale(1)';
            }}
          >
            {/* Sidebar toggle icon based on collapsed state */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              {isSidebarCollapsed ? (
                // Right arrow icon when collapsed (to expand)
                <path d="M9 18L15 12L9 6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              ) : (
                // Left arrow icon when expanded (to collapse)
                <path d="M15 18L9 12L15 6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              )}
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2" />
      </div>
    </header>
  )
}
