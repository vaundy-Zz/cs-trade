import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { alertsAPI, Alert } from '../api/alerts';
import './AlertsPage.css';

function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this alert?')) {
      return;
    }

    try {
      await alertsAPI.deleteAlert(id);
      setAlerts(alerts.filter((a) => a.id !== id));
    } catch (error) {
      console.error('Failed to delete alert:', error);
      alert('Failed to delete alert');
    }
  };

  const handleToggleActive = async (alert: Alert) => {
    try {
      const updated = await alertsAPI.updateAlert(alert.id, {
        isActive: !alert.isActive,
      });
      setAlerts(alerts.map((a) => (a.id === alert.id ? updated : a)));
    } catch (error) {
      console.error('Failed to update alert:', error);
      alert('Failed to update alert');
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'active') return alert.isActive;
    if (filter === 'inactive') return !alert.isActive;
    return true;
  });

  return (
    <div className="alerts-page">
      <div className="page-header">
        <h1 className="page-title">Alerts</h1>
        <Link to="/alerts/new" className="btn-primary">
          Create Alert
        </Link>
      </div>

      <div className="filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({alerts.length})
        </button>
        <button
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Active ({alerts.filter((a) => a.isActive).length})
        </button>
        <button
          className={`filter-btn ${filter === 'inactive' ? 'active' : ''}`}
          onClick={() => setFilter('inactive')}
        >
          Inactive ({alerts.filter((a) => !a.isActive).length})
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading alerts...</div>
      ) : filteredAlerts.length === 0 ? (
        <div className="empty-state">
          <p>No alerts found</p>
          <Link to="/alerts/new" className="btn-primary">
            Create your first alert
          </Link>
        </div>
      ) : (
        <div className="alerts-grid">
          {filteredAlerts.map((alert) => (
            <div key={alert.id} className="alert-card">
              <div className="alert-card-header">
                <h3>{alert.name}</h3>
                <div
                  className={`status-badge ${
                    alert.isActive ? 'active' : 'inactive'
                  }`}
                >
                  {alert.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              {alert.description && (
                <p className="alert-description">{alert.description}</p>
              )}

              <div className="alert-details">
                <div className="detail-row">
                  <span className="detail-label">Type:</span>
                  <span className="detail-value">{alert.type}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Symbol:</span>
                  <span className="detail-value">{alert.symbol}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Condition:</span>
                  <span className="detail-value">
                    {alert.operator} {alert.threshold}
                  </span>
                </div>
                {alert.triggers && alert.triggers.length > 0 && (
                  <div className="detail-row">
                    <span className="detail-label">Last triggered:</span>
                    <span className="detail-value">
                      {new Date(alert.triggers[0].triggeredAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="alert-actions">
                <button
                  className="btn-toggle"
                  onClick={() => handleToggleActive(alert)}
                >
                  {alert.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <Link to={`/alerts/${alert.id}/edit`} className="btn-edit">
                  Edit
                </Link>
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(alert.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AlertsPage;
