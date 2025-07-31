import React from "react";

const statusColors = {
  Completed: "bg-green-600",
  Pending: "bg-yellow-500",
  Failed: "bg-red-600",
};

const statusStyles = {
  Completed: {
    backgroundColor: "#16a34a", // green-600
    color: "#ffffff",
  },
  Pending: {
    backgroundColor: "#eab308", // yellow-500
    color: "#000000",
  },
  Failed: {
    backgroundColor: "#dc2626", // red-600
    color: "#ffffff",
  },
};

export default function ActivityTable({ activities }) {
  return (
    <div className="activity-table">
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
              <td colSpan={3} style={{ textAlign: "center" }}>No recent activity.</td>
            </tr>
          ) : (
            activities.map((a, idx) => (
              <tr key={idx}>
                <td>{new Date(a.activity_date).toLocaleDateString()}</td>
                <td>{a.activity_type}</td>
                <td>
                  <span
                    className="status-badge"
                    style={{
                      ...statusStyles[a.status] || { backgroundColor: "#9ca3af", color: "#ffffff" },
                      padding: "0.2em 0.8em",
                      borderRadius: "0.8em",
                      fontWeight: 600,
                      fontSize: "0.95em",
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