import React from 'react';

const SiteHeader = ({ onSidebarToggle, currentTab = 'dashboard', onSettingsClick, user }) => {
  const accent = '#fd680e';
  
  // Ensure we have a function for sidebar toggle
  const handleSidebarToggle = onSidebarToggle || (() => {
    console.log('Sidebar toggle clicked but no handler provided');
  });
  
  // Handle settings click
  const handleSettingsClick = onSettingsClick || (() => {
    console.log('Settings clicked but no handler provided');
  });
  
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
      default:
        return 'Admin Portal';
    }
  };

  return (
    <header 
      style={{
        height: '64px',
        backgroundColor: '#fff',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 999,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        width: '100%'
      }}
    >
      <div 
        style={{ 
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          gap: '8px'
        }}
      >
        {/* Sidebar Trigger Button */}
        <button
          onClick={handleSidebarToggle}
          style={{
            marginLeft: '-8px',
            border: 'none',
            backgroundColor: 'transparent',
            color: '#6b7280',
            padding: '8px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#f3f4f6';
            e.target.style.color = accent;
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#6b7280';
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
              'bi-house'
            }`}
            style={{ color: accent, fontSize: '14px' }}
          ></i>
          {getPageTitle()}
        </h1>

        {/* Right side content */}
        <div 
          style={{ 
            marginLeft: 'auto', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px' 
          }}
        >
          {/* Avatar */}
          <div 
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 2px 8px rgba(253, 104, 14, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = 'none';
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>

          {/* Settings Button */}
          <button
            onClick={handleSettingsClick}
            style={{
              border: 'none',
              backgroundColor: 'transparent',
              color: '#6b7280',
              padding: '8px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f3f4f6';
              e.target.style.color = accent;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#6b7280';
            }}
            aria-label="Settings"
          >
            <i className="bi bi-gear" style={{ fontSize: '16px' }}></i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;
