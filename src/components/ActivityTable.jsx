import React from "react";

const statusStyles = {
  Completed: {
    backgroundColor: "#059652", // Success green from FreelancerDashboard
    color: "#ffffff",
    border: "1px solid #047857",
  },
  Pending: {
    backgroundColor: "#ffc107", // Warning yellow from FreelancerDashboard
    color: "#000000",
    border: "1px solid #e0a800",
  },
  Failed: {
    backgroundColor: "#df1529", // Error red from FreelancerDashboard
    color: "#ffffff",
    border: "1px solid #b91c1c",
  },
};

const getActivityIcon = (activityType) => {
  switch (activityType.toLowerCase()) {
    case 'cv uploaded':
      return '📄';
    case 'profile updated':
      return '👤';
    case 'application submitted':
      return '📝';
    case 'message sent':
      return '💬';
    case 'payment received':
      return '💰';
    case 'project completed':
      return '✅';
    default:
      return '📋';
  }
};

export default function ActivityTable({ activities }) {
  return (
    <div className="activity-table">
      <style>{`
        .activity-table {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .activity-table table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        }
        
        .activity-table thead {
          background: linear-gradient(135deg, #fd680e 0%, #e55a00 100%);
        }
        
        .activity-table th {
          padding: 16px 20px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .activity-table th:first-child {
          border-top-left-radius: 12px;
        }
        
        .activity-table th:last-child {
          border-top-right-radius: 12px;
        }
        
        .activity-table tbody tr {
          transition: all 0.2s ease;
          border-bottom: 1px solid #f1f5f9;
        }
        
        .activity-table tbody tr:hover {
          background-color: #f8f4f2;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(253, 104, 14, 0.1);
        }
        
        .activity-table tbody tr:last-child {
          border-bottom: none;
        }
        
        .activity-table td {
          padding: 16px 20px;
          font-size: 14px;
          color: #444;
          vertical-align: middle;
        }
        
        .activity-table .date-cell {
          font-weight: 500;
          color: #666;
          font-size: 13px;
        }
        
        .activity-table .activity-cell {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 500;
        }
        
        .activity-table .activity-icon {
          font-size: 18px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
          border-radius: 8px;
          flex-shrink: 0;
        }
        
        .activity-table .status-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 1px 2px 0 rgba(253, 104, 14, 0.1);
          transition: all 0.2s ease;
        }
        
        .activity-table .status-badge:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px 0 rgba(253, 104, 14, 0.2);
        }
        
        .activity-table .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #888;
          font-style: italic;
        }
        
        .activity-table .empty-state-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.5;
        }
      `}</style>
      
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Activity</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {activities.length === 0 ? (
            <tr>
              <td colSpan={3} className="empty-state">
                <div className="empty-state-icon">📊</div>
                <div>No recent activity to display</div>
                <div style={{ fontSize: '12px', marginTop: '8px' }}>Your activity will appear here</div>
              </td>
            </tr>
          ) : (
            activities.map((a, idx) => (
              <tr key={idx}>
                <td className="date-cell">
                  {new Date(a.activity_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
                <td className="activity-cell">
                  <div className="activity-icon">
                    {getActivityIcon(a.activity_type)}
                  </div>
                  <span>{a.activity_type}</span>
                </td>
                <td>
                  <span
                    className="status-badge"
                    style={{
                      ...statusStyles[a.status] || { backgroundColor: "#9ca3af", color: "#ffffff" },
                    }}
                  >
                    {a.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
} 