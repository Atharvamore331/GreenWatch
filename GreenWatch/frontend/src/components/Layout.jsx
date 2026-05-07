import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Leaf, 
  Search, 
  Bell, 
  User as UserIcon, 
  Menu,
  LayoutDashboard,
  AlertTriangle,
  Map as MapIcon,
  Trophy,
  Settings,
  LogOut,
  X,
  CheckCircle,
  XCircle,
  Info,
  MessageSquare
} from 'lucide-react';
import { subscribeToasts } from '../utils/toastService';

const API_URL = 'http://localhost:5000/api';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifFilter, setNotifFilter] = useState('all');
  const [toasts, setToasts] = useState([]);

  const userStr = localStorage.getItem('greenwatch_current_user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    // Setup Toast Listener
    const unsubscribe = subscribeToasts((toastData) => {
      setToasts(prev => [...prev, toastData]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toastData.id));
      }, 3000); // Remove toast after animation finishes
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user?.id]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`${API_URL}/notifications/${user.id}`);
      setNotifications(res.data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axios.patch(`${API_URL}/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Error marking read", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('greenwatch_current_user');
    navigate('/');
  };

  const navLinks = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: user && user.role === 'admin' ? '/admin' : '/dashboard', active: window.location.pathname === '/dashboard' || window.location.pathname === '/admin' },
    { icon: <AlertTriangle size={20} />, label: 'Complaints', path: '/complaints', active: window.location.pathname === '/complaints' },
    { icon: <MapIcon size={20} />, label: 'Map', path: '/map', active: window.location.pathname === '/map' },
    { icon: <Bell size={20} />, label: 'Notifications', path: '/notifications', active: window.location.pathname === '/notifications' },
    { icon: <Trophy size={20} />, label: 'Leaderboard', path: '/leaderboard', active: window.location.pathname === '/leaderboard' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/settings', active: window.location.pathname === '/settings' },
  ];

  const handleNavClick = (path) => {
    if (path.startsWith('/')) {
      navigate(path);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const filteredNotifs = notifications.filter(n => notifFilter === 'all' || !n.isRead);

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${!isMobileOpen ? 'mobile-hidden' : ''}`}>
        <div className="sidebar-header">
          <Leaf color="var(--primary)" size={24} style={{ minWidth: '24px' }} />
          <span className="logo-text">GreenWatch</span>
          <button 
            className="icon-button" 
            style={{ marginLeft: 'auto', display: window.innerWidth <= 768 ? 'block' : 'none' }}
            onClick={() => setIsMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {navLinks.map((link, idx) => (
            <div key={idx} className={`sidebar-link ${link.active ? 'active' : ''}`} onClick={() => handleNavClick(link.path)} style={{ cursor: 'pointer' }}>
              <div style={{ minWidth: '20px', display: 'flex', justifyContent: 'center' }}>{link.icon}</div>
              <span className="link-text">{link.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Top Navbar */}
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button" onClick={() => {
              if (window.innerWidth <= 768) {
                setIsMobileOpen(!isMobileOpen);
              } else {
                setIsCollapsed(!isCollapsed);
              }
            }}>
              <Menu size={24} />
            </button>
            <div className="search-bar">
              <Search size={18} className="search-icon" />
              <input type="text" placeholder="Search reports..." />
            </div>
          </div>
          
          <div className="topbar-right">
            
            {/* Notification Bell & Dropdown */}
            <div style={{ position: 'relative' }}>
              <button className="icon-button" onClick={() => setShowNotifDropdown(!showNotifDropdown)}>
                <Bell size={20} />
                {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
              </button>

              {showNotifDropdown && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Notifications</h4>
                    <button className="icon-button" onClick={() => setShowNotifDropdown(false)}><X size={18}/></button>
                  </div>
                  <div style={{ padding: '0 1rem' }}>
                    <div className="notification-tabs">
                      <button className={`notif-tab ${notifFilter === 'all' ? 'active' : ''}`} onClick={() => setNotifFilter('all')}>All</button>
                      <button className={`notif-tab ${notifFilter === 'unread' ? 'active' : ''}`} onClick={() => setNotifFilter('unread')}>Unread</button>
                    </div>
                  </div>
                  <div className="notification-list">
                    {filteredNotifs.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No notifications found.</div>
                    ) : (
                      filteredNotifs.map(n => (
                        <div key={n.id} className={`notification-card ${!n.isRead ? 'unread' : ''}`} onClick={() => !n.isRead && handleMarkAsRead(n.id)}>
                          <div style={{ marginTop: '0.2rem' }}>
                            <MessageSquare size={16} color={!n.isRead ? 'var(--primary)' : 'var(--text-muted)'} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', color: !n.isRead ? 'white' : 'var(--text-main)' }}>{n.message}</p>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleString()}</span>
                          </div>
                          {!n.isRead && <div className="unread-dot"></div>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem', borderLeft: '1px solid var(--border)', paddingLeft: '1.5rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                {user ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span style={{ fontWeight: 600, display: window.innerWidth <= 768 ? 'none' : 'block' }}>
                {user ? user.name : 'User'}
              </span>
            </div>
            <button className="icon-button" onClick={handleLogout} style={{ marginLeft: '0.5rem' }} title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ padding: '2rem', flex: 1, position: 'relative' }}>
          {children}
        </div>
      </div>
      
      {/* Mobile Overlay */}
      {isMobileOpen && window.innerWidth <= 768 && (
        <div 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.type === 'success' && <CheckCircle size={20} color="var(--success)" />}
            {t.type === 'error' && <XCircle size={20} color="var(--danger)" />}
            {t.type === 'info' && <Info size={20} color="var(--primary)" />}
            <span style={{ fontSize: '0.95rem' }}>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
