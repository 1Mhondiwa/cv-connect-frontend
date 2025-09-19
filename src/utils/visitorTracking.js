// Frontend visitor tracking utility
class WebVisitorTracker {
  constructor() {
    this.baseURL = '/api/visitor';
    this.sessionId = this.getOrCreateSessionId();
    this.isTracking = false;
  }

  getOrCreateSessionId() {
    let sessionId = localStorage.getItem('visitor_session_id');
    if (!sessionId) {
      sessionId = `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('visitor_session_id', sessionId);
    }
    return sessionId;
  }

  async trackVisit(pageVisited, userId = null) {
    try {
      // Prevent duplicate tracking for the same page in the same session
      const lastTrackedPage = sessionStorage.getItem('last_tracked_page');
      if (lastTrackedPage === pageVisited && !userId) {
        return; // Skip if same page already tracked in this session
      }

      const token = localStorage.getItem('token');
      
      const response = await fetch(`${this.baseURL}/track-web`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          page_visited: pageVisited,
          session_id: this.sessionId,
          referrer: document.referrer || null
        })
      });

      if (response.ok) {
        sessionStorage.setItem('last_tracked_page', pageVisited);
        console.log('✅ Web visitor tracked:', pageVisited);
      } else {
        console.warn('⚠️ Failed to track web visitor:', response.status);
      }
    } catch (error) {
      console.error('❌ Error tracking web visitor:', error);
    }
  }

  // Track page visit automatically
  trackCurrentPage() {
    const currentPath = window.location.pathname;
    const userId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).user_id : null;
    
    // Only track main pages, not API calls or static files
    if (currentPath && !currentPath.includes('/api/') && !currentPath.includes('.')) {
      this.trackVisit(currentPath, userId);
    }
  }
}

// Create global instance
const visitorTracker = new WebVisitorTracker();

// Auto-track when page loads
if (typeof window !== 'undefined') {
  // Track initial page load
  visitorTracker.trackCurrentPage();
  
  // Track page changes (for SPA navigation)
  window.addEventListener('popstate', () => {
    setTimeout(() => visitorTracker.trackCurrentPage(), 100);
  });
}

export default visitorTracker;
