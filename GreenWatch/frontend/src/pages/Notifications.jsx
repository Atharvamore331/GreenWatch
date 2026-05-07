import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, MessageSquare, Check, Trash2, Clock, Inbox, Filter } from 'lucide-react';
import Layout from '../components/Layout';

const API_URL = 'http://localhost:5000/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const user = JSON.parse(localStorage.getItem('greenwatch_current_user'));
    if (!user) return;
    try {
      const res = await axios.get(`${API_URL}/notifications/${user.id}`);
      setNotifications(res.data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsLoading(false), 600);
    }
  };

  const markAllRead = async () => {
    const user = JSON.parse(localStorage.getItem('greenwatch_current_user'));
    try {
      await axios.patch(`${API_URL}/notifications/read-all/${user.id}`);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`${API_URL}/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotifs = notifications.filter(n => filter === 'all' || !n.isRead);

  return (
    <Layout>
      <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div className="flex-between mb-8">
          <div>
            <h1 className="text-gradient">Activity Stream</h1>
            <p style={{ color: 'var(--text-muted)' }}>Stay updated with environmental deployments and community actions.</p>
          </div>
          <div className="flex-center" style={{ gap: 'var(--s-4)' }}>
            <button className="btn btn-outline" onClick={markAllRead} disabled={!notifications.some(n => !n.isRead)}>
              <Check size={18} /> Mark all read
            </button>
          </div>
        </div>

        <div className="card mb-8" style={{ padding: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '2rem', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-light)' }}>
            <button 
              className={`notif-tab ${filter === 'all' ? 'active' : ''}`} 
              onClick={() => setFilter('all')}
              style={{ fontSize: '1rem' }}
            >
              All Logs
            </button>
            <button 
              className={`notif-tab ${filter === 'unread' ? 'active' : ''}`} 
              onClick={() => setFilter('unread')}
              style={{ fontSize: '1rem' }}
            >
              Unread
            </button>
          </div>

          <div style={{ minHeight: '400px' }}>
            {isLoading ? (
              [1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: '80px', margin: '1rem', borderRadius: 'var(--radius-md)' }}></div>)
            ) : filteredNotifs.length === 0 ? (
              <div className="flex-center" style={{ flexDirection: 'column', padding: '5rem', textAlign: 'center' }}>
                <Inbox size={48} color="var(--border)" style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
                <h4 style={{ color: 'var(--text-muted)' }}>Quiet for now</h4>
                <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>No new intelligence alerts at this moment.</p>
              </div>
            ) : (
              filteredNotifs.map(n => (
                <div key={n.id} className={`notification-card ${!n.isRead ? 'unread' : ''}`} style={{ borderBottom: '1px solid var(--border-light)', padding: '1.5rem' }}>
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '10px', 
                    background: !n.isRead ? 'var(--primary-glow)' : 'rgba(255,255,255,0.03)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <MessageSquare size={20} color={!n.isRead ? 'var(--primary)' : 'var(--text-dim)'} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="flex-between" style={{ marginBottom: '0.25rem' }}>
                      <p style={{ margin: 0, fontWeight: !n.isRead ? 700 : 500, fontSize: '1rem' }}>{n.message}</p>
                      <button className="icon-button" onClick={() => deleteNotification(n.id)} style={{ padding: '0.25rem' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex-center" style={{ gap: '0.5rem', justifyContent: 'flex-start', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                      <Clock size={14} /> {new Date(n.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
