import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import { useSSE } from '../hooks/useSSE';
import NotificationPanel from './NotificationPanel';
import './Layout.css';

function Layout() {
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const navigate = useNavigate();
  
  useSSE();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="logo">Alerts & Workflows</h1>
            <nav className="nav">
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
              <Link to="/alerts" className="nav-link">
                Alerts
              </Link>
            </nav>
          </div>
          <div className="header-right">
            <NotificationPanel />
            <div className="user-info">
              <span>{user?.email}</span>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
