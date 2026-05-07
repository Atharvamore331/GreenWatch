import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  MessageSquare,
  ChevronLeft
} from 'lucide-react';
import { subscribeToasts } from '../utils/toastService';

const API_URL = 'http://localhost:5000/api';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [notifFilter, setNotifFilter] = useState('all');
  const [toasts, setToasts] = useState([]);

  const userStr = localStorage.getItem('greenwatch_current_user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    const unsubscribe = subscribeToasts((toastData) => {
      setToasts(prev => [...prev, toastData]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toastData.id));
      }, 3500);
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
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: user && user.role === 'admin' ? '/admin' : '/dashboard' },
    { icon: <AlertTriangle size={20} />, label: 'Complaints', path: '/complaints' },
    { icon: <MapIcon size={20} />, label: 'Map', path: '/map' },
    { icon: <Bell size={20} />, label: 'Notifications', path: '/notifications' },
    { icon: <Trophy size={20} />, label: 'Leaderboard', path: '/leaderboard' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/settings' },
  ];

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const filteredNotifs = notifications.filter(n => notifFilter === 'all' || !n.isRead);

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="flex-center" style={{ gap: '0.75rem' }}>
            <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '0.75rem' }}>
              <Leaf color="white" size={20} />
            </div>
            <span className="logo-text">GreenWatch</span>
          </div>
          <button 
            className="icon-button mobile-only" 
            style={{ marginLeft: 'auto', display: 'none' }} 
            onClick={() => setIsMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {navLinks.map((link, idx) => (
            <div 
              key={idx} 
              className={`sidebar-link ${location.pathname === link.path ? 'active' : ''}`} 
              onClick={() => { navigate(link.path); setIsMobileOpen(false); }}
            >
              <div className="link-icon">{link.icon}</div>
              <span className="link-text">{link.label}</span>
            </div>
          ))}
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
          <div className={`sidebar-link`} onClick={handleLogout}>
            <LogOut size={20} />
            <span className="link-text">Sign Out</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        <header className="topbar">
          <div className="flex-center" style={{ gap: '1.5rem' }}>
            <button className="icon-button" onClick={() => {
              if (window.innerWidth <= 768) setIsMobileOpen(!isMobileOpen);
              else setIsCollapsed(!isCollapsed);
            }}>
              {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
            </button>
            <div className="search-bar">
              <Search size={18} className="search-icon" />
              <input type="text" placeholder="Intelligence search..." />
            </div>
          </div>
          
          <div className="flex-center" style={{ gap: '1rem' }}>
            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button className={`icon-button ${showNotifDropdown ? 'active' : ''}`} onClick={() => setShowNotifDropdown(!showNotifDropdown)}>
                <Bell size={20} />
                {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
              </button>

              {showNotifDropdown && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h4>Notifications</h4>
                    <button className="icon-button" onClick={() => setShowNotifDropdown(false)}><X size={18}/></button>
                  </div>
                  <div style={{ padding: '0 1.5rem' }}>
                    <div className="notification-tabs">
                      <button className={`notif-tab ${notifFilter === 'all' ? 'active' : ''}`} onClick={() => setNotifFilter('all')}>All</button>
                      <button className={`notif-tab ${notifFilter === 'unread' ? 'active' : ''}`} onClick={() => setNotifFilter('unread')}>Unread</button>
                    </div>
                  </div>
                  <div className="notification-list">
                    {filteredNotifs.length === 0 ? (
                      <div style={{ padding: '3rem', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>All caught up!</p>
                      </div>
                    ) : (
                      filteredNotifs.map(n => (
                        <div key={n.id} className={`notification-card ${!n.isRead ? 'unread' : ''}`} onClick={() => !n.isRead && handleMarkAsRead(n.id)}>
                          <div style={{ marginTop: '0.25rem' }}>
                            <MessageSquare size={16} color={!n.isRead ? 'var(--primary)' : 'var(--text-dim)'} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', lineHeight: '1.4' }}>{n.message}</p>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{new Date(n.createdAt).toLocaleTimeString()}</span>
                          </div>
                          {!n.isRead && <div className="unread-dot"></div>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex-center" style={{ gap: '0.75rem', paddingLeft: '1.5rem', borderLeft: '1px solid var(--border)' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '0.8rem', boxShadow: '0 0 15px var(--primary-glow)' }}>
                {user ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ display: window.innerWidth <= 768 ? 'none' : 'block' }}>
                <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>{user ? user.name : 'Citizen'}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: 0 }}>{user?.role === 'admin' ? 'Environmental Admin' : 'Active Citizen'}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="fade-in" style={{ flex: 1 }}>
          <div className="page-container">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.type === 'success' && <CheckCircle size={20} color="var(--success)" />}
            {t.type === 'error' && <XCircle size={20} color="var(--danger)" />}
            {t.type === 'info' && <Info size={20} color="var(--info)" />}
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{t.message}</span>
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .mobile-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 999;
          animation: fadeIn 0.3s ease;
        }
        @media (max-width: 768px) {
          .mobile-only { display: flex !important; }
        }
      `}} />
    </div>
  );
}
