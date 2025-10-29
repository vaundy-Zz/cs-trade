import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { alertsAPI, Alert } from '../api/alerts';
import { useNotificationStore } from '../stores/notificationStore';
import './Dashboard.css';

function Dashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const { notifications } = useNotificationStore();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const data = await alertsAPI.getAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeAlerts = alerts.filter((a) => a.isActive);
  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-value">{alerts.length}</div>
          <div className="stat-label">Total Alerts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{activeAlerts.length}</div>
          <div className="stat-label">Active Alerts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{notifications.length}</div>
          <div className="stat-label">Notifications</div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Alerts</h2>
            <Link to="/alerts" className="link-button">
              View all
            </Link>
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : alerts.length === 0 ? (
            <div className="empty-state">
              <p>No alerts configured yet</p>
              <Link to="/alerts/new" className="btn-primary">
                Create your first alert
              </Link>
            </div>
          ) : (
            <div className="alert-list">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="alert-item">
                  <div className="alert-info">
                    <h3>{alert.name}</h3>
                    <p>
                      {alert.symbol} - {alert.type} {alert.operator}{' '}
                      {alert.threshold}
                    </p>
                  </div>
                  <div
                    className={`alert-status ${
                      alert.isActive ? 'active' : 'inactive'
                    }`}
                  >
                    {alert.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Notifications</h2>
          </div>
          {recentNotifications.length === 0 ? (
            <div className="empty-state">
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="notification-list-dash">
              {recentNotifications.map((notification) => (
                <div key={notification.id} className="notification-item-dash">
                  <div className="notification-content-dash">
                    <h4>{notification.alertName}</h4>
                    <p>{notification.message}</p>
                    <span className="notification-time-dash">
                      {new Date(notification.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
