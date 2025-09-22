import React from 'react';

const SiteHeader = ({ onSidebarToggle, currentTab }) => {
  const accent = '#fd680e';
  
  // Get the current page title based on active tab
  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Dashboard';
      case 'associates':
        return 'Associate Management';
      case 'freelancers':
        return 'Freelancer Management';
      case 'analytics':
        return 'Analytics';
      case 'reports':
        return 'System Reports';
      case 'settings':
        return 'System Settings';
      default:
        return 'Admin Portal';
    }
  };

  return (
    <header 
      className="flex shrink-0 items-center gap-2 border-b transition-all ease-linear site-header"
      style={{
        height: '64px'
      }}
    >
      <div 
        className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6"
        style={{ padding: '0 24px' }}
      >
        {/* Sidebar Trigger Button */}
        <button
          onClick={onSidebarToggle}
          className="sidebar-toggle-btn"
          style={{
            marginLeft: '-8px'
          }}
          aria-label="Toggle sidebar"
        >
          <i className="bi bi-list" style={{ fontSize: '18px' }}></i>
        </button>

        {/* Separator */}
        <div 
          style={{
            width: '1px',
            height: '16px',
            backgroundColor: '#e5e7eb',
            margin: '0 8px'
          }}
        />

        {/* Page Title */}
        <h1 
          style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#111827',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <i 
            className={`bi ${
              currentTab === 'dashboard' ? 'bi-speedometer2' :
              currentTab === 'associates' ? 'bi-people' :
              currentTab === 'freelancers' ? 'bi-person-badge' :
              currentTab === 'analytics' ? 'bi-graph-up' :
              currentTab === 'reports' ? 'bi-file-earmark-bar-graph' :
              currentTab === 'settings' ? 'bi-gear' :
              'bi-house'
            }`}
            style={{ color: accent, fontSize: '14px' }}
          ></i>
          {getPageTitle()}
        </h1>

        {/* Right side content */}
        <div 
          className="ml-auto flex items-center gap-2"
          style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {/* Admin User Info */}
          <div className="admin-status-indicator">
            <div className="admin-status-dot" />
            <span className="admin-status-text">
              Admin
            </span>
          </div>

          {/* GitHub Link Button */}
          <button
            className="btn btn-outline-secondary btn-sm"
            style={{
              display: 'none', // Hidden by default, can be shown if needed
              border: 'none',
              backgroundColor: 'transparent',
              color: '#6b7280',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f3f4f6';
              e.target.style.color = accent;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#6b7280';
            }}
          >
            <i className="bi bi-github me-1"></i>
            GitHub
          </button>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
