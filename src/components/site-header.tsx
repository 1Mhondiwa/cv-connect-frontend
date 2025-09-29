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
      <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
        
        {/* Right Side - User Info & Notifications */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Notifications Bell */}
          <button
            type="button"
            aria-label="Notifications"
            style={{
              position: 'relative',
              padding: '8px',
              borderRadius: '6px',
              border: '2px solid rgba(253, 104, 14, 0.2)',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 6px rgba(253, 104, 14, 0.1)'
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(253, 104, 14, 0.05)';
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
            }}
          >
            {/* Bell Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {/* Notification Badge */}
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#ef4444',
              border: '2px solid #ffffff'
            }} />
          </button>

          {/* User Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            paddingLeft: '12px',
            borderLeft: '1px solid #e5e7eb'
          }}>
            {/* User Name */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              lineHeight: 1.2
            }}>
              <span style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#111827'
              }}>Admin User</span>
              <span style={{
                fontSize: '12px',
                color: '#6b7280'
              }}>Administrator</span>
            </div>

            {/* User Avatar */}
            <button
              type="button"
              aria-label="User Menu"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '2px solid rgba(253, 104, 14, 0.2)',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 6px rgba(253, 104, 14, 0.1)',
                overflow: 'hidden',
                padding: 0
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(253, 104, 14, 0.25)';
                (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 6px rgba(253, 104, 14, 0.1)';
                (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
              }}
            >
              {/* Cartoon Avatar Image */}
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=AdminUser&backgroundColor=fd680e" 
                alt="Admin User Avatar"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
