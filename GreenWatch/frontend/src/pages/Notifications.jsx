import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Bell, CheckCircle, Ghost, Clock, Search } from 'lucide-react';
import Layout from '../components/Layout';
import { createRipple } from './Dashboard';

const API_URL = 'http://localhost:5000/api';

export default function Notifications() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('greenwatch_current_user');
    if (!userStr) return navigate('/');
    const u = JSON.parse(userStr);
    setUser(u);
    
    fetchNotifications(u.id).then(() => {
      setTimeout(() => setIsLoading(false), 300);
    });
  }, [navigate]);

  const fetchNotifications = async (userId) => {
    try {
      const res = await axios.get(`${API_URL}/notifications/${userId}`);
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (e, id) => {
    e.stopPropagation();
    createRipple(e);
    try {
      await axios.patch(`${API_URL}/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async (e) => {
    createRipple(e);
    const unread = notifications.filter(n => !n.isRead);
    for (let n of unread) {
      try {
        await axios.patch(`${API_URL}/notifications/${n.id}/read`);
      } catch (err) {
        console.error(err);
      }
    }
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  if (!user) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className={user.role === 'admin' ? 'admin-bg' : 'dashboard-bg'}>
      <Layout>
        <div className="page-enter" style={{ paddingBottom: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <h2 style={{ color: 'white', fontSize: '1.8rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Bell color="var(--primary)" /> Notifications
                {unreadCount > 0 && (
                  <span className="badge badge-pending" style={{ fontSize: '0.7rem', marginLeft: '0.5rem' }}>
                    {unreadCount} Unread
                  </span>
                )}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.2rem 0 0 0' }}>Your recent activity and updates.</p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div className="search-bar" style={{ width: '220px' }}>
                <Search size={16} className="search-icon" />
                <input type="text" placeholder="Search activity..." style={{ padding: '0.5rem 1.25rem 0.5rem 2.5rem', fontSize: '0.8rem' }} />
              </div>
              {unreadCount > 0 && (
                <button className="btn btn-outline ripple-btn" onMouseDown={markAllAsRead} style={{ padding: '0.6rem 1.25rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle size={16} /> Mark all as read
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="skeleton skeleton-box" style={{ height: '80px', borderRadius: 'var(--radius-md)' }}></div>
              <div className="skeleton skeleton-box" style={{ height: '80px', borderRadius: 'var(--radius-md)' }}></div>
              <div className="skeleton skeleton-box" style={{ height: '80px', borderRadius: 'var(--radius-md)' }}></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="card empty-state" style={{ padding: '3rem 2rem' }}>
              <Ghost size={64} color="var(--border)" />
              <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>All Caught Up!</h4>
              <p style={{ color: 'var(--text-muted)' }}>You don't have any notifications at the moment.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {notifications.map(n => (
                <div 
                  key={n.id} 
                  className={`card page-enter`} 
                  style={{ 
                    padding: '1rem 1.25rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    gap: '1.25rem',
                    borderLeft: !n.isRead ? '3px solid var(--primary)' : '3px solid transparent',
                    background: !n.isRead ? 'rgba(255,255,255,0.03)' : 'rgba(15, 23, 42, 0.4)'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ color: !n.isRead ? 'white' : 'var(--text-muted)', margin: '0 0 0.5rem 0', fontSize: '1rem', lineHeight: 1.4 }}>
                      {n.message}
                    </p>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      <Clock size={12} /> {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                  
                  {!n.isRead && (
                    <button 
                      className="icon-button ripple-btn" 
                      onMouseDown={(e) => markAsRead(e, n.id)} 
                      title="Mark as read"
                      style={{ color: 'var(--primary)', background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem', borderRadius: '50%' }}
                    >
                      <CheckCircle size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
          
        </div>
      </Layout>
    </div>
  );
}
