import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Trophy, 
  AlertTriangle, 
  Plus, 
  ChevronRight, 
  ArrowUpRight,
  ShieldCheck,
  Zap,
  MapPin,
  Clock,
  ExternalLink
} from 'lucide-react';
import Layout from '../components/Layout';

const API_URL = 'http://localhost:5000/api';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('greenwatch_current_user');
    if (userStr) {
      const u = JSON.parse(userStr);
      setUser(u);
      fetchUserComplaints(u.id);
    }
  }, []);

  const fetchUserComplaints = async (userId) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/complaints/citizen/${userId}`);
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      // Simulate network delay for premium feel
      setTimeout(() => setIsLoading(false), 800);
    }
  };

  const stats = [
    { label: 'Total Reports', value: complaints.length, icon: <AlertTriangle size={24} />, color: 'var(--primary)', shadow: 'var(--primary-glow)' },
    { label: 'Resolved Cases', value: complaints.filter(c => c.status === 'resolved').length, icon: <ShieldCheck size={24} />, color: 'var(--secondary)', shadow: 'rgba(59, 130, 246, 0.2)' },
    { label: 'Impact Points', value: user?.points || 0, icon: <Zap size={24} />, color: 'var(--warning)', shadow: 'rgba(245, 158, 11, 0.2)' },
  ];

  if (!user) return null;

  return (
    <Layout>
      <div className="fade-in">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-gradient">Welcome, {user.name}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>
            Track your environmental impact and active reports.
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--s-6)', marginBottom: 'var(--s-12)' }}>
          {isLoading ? (
            [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '140px', borderRadius: 'var(--radius-lg)' }}></div>)
          ) : (
            stats.map((s, i) => (
              <div key={i} className="card card-interactive" style={{ padding: 'var(--s-6)' }}>
                <div className="flex-between">
                  <div>
                    <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.875rem', marginBottom: 'var(--s-2)' }}>{s.label}</p>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800 }}>{s.value}</h2>
                  </div>
                  <div style={{ 
                    padding: '1rem', 
                    background: 'rgba(255,255,255,0.03)', 
                    borderRadius: 'var(--radius-md)', 
                    color: s.color,
                    boxShadow: `0 0 20px ${s.shadow}`,
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    {s.icon}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Main Dashboard Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 'var(--s-8)' }}>
          
          {/* Left Column: Reports List */}
          <section>
            <div className="flex-between mb-8">
              <h3>Active Intelligence Reports</h3>
              <button className="btn btn-ghost">View History <ChevronRight size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
              {isLoading ? (
                [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '100px', borderRadius: 'var(--radius-lg)' }}></div>)
              ) : complaints.length === 0 ? (
                <div className="card flex-center" style={{ padding: 'var(--s-16)', flexDirection: 'column', textAlign: 'center' }}>
                  <AlertTriangle size={48} color="var(--text-muted)" style={{ marginBottom: 'var(--s-4)', opacity: 0.3 }} />
                  <h4 style={{ color: 'var(--text-muted)' }}>No Active Reports</h4>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>You haven't filed any environmental reports yet.</p>
                  <button className="btn btn-primary mt-4"><Plus size={18} /> New Report</button>
                </div>
              ) : (
                complaints.slice(0, 4).map(c => (
                  <div key={c.id} className="card card-interactive" style={{ padding: 'var(--s-4)', display: 'flex', gap: 'var(--s-4)', alignItems: 'center' }}>
                    <div style={{ 
                      width: '70px', height: '70px', borderRadius: 'var(--radius-md)', 
                      background: 'rgba(255,255,255,0.05)', display: 'flex', 
                      alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                      border: '1px solid var(--border)'
                    }}>
                      {c.image ? (
                        <img src={c.image} alt="Report" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <AlertTriangle size={28} color="var(--text-dim)" />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="flex-between mb-8" style={{ marginBottom: '0.25rem' }}>
                        <h4 style={{ fontSize: '1.1rem', margin: 0 }}>{c.title}</h4>
                        <span className={`badge badge-${c.status === 'in-progress' ? 'progress' : c.status}`}>{c.status}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                        <span className="flex-center" style={{ gap: '0.3rem' }}><MapPin size={14} /> {c.location}</span>
                        <span className="flex-center" style={{ gap: '0.3rem' }}><Clock size={14} /> {new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button className="icon-button"><ChevronRight size={20} /></button>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Right Column: Leaderboard & Actions */}
          <aside>
            <div className="flex-between mb-8">
              <h3>Community Leaders</h3>
              <Trophy size={20} color="var(--warning)" />
            </div>
            
            <div className="card mb-8">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex-between">
                    <div className="flex-center" style={{ gap: '1rem' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: i === 1 ? 'var(--warning)' : 'var(--text-muted)', width: '24px' }}>{i}</span>
                      <div style={{ 
                        width: '40px', height: '40px', borderRadius: 'var(--radius-full)', 
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
                        opacity: 1 - (i*0.2), display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', fontWeight: '800', fontSize: '0.75rem' 
                      }}>
                        {String.fromCharCode(64 + i)}C
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, margin: 0, fontSize: '0.95rem' }}>Citizen {String.fromCharCode(64 + i)}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: 0 }}>{3000 - i*250} Impact Points</p>
                      </div>
                    </div>
                    {i === 1 && <ArrowUpRight size={18} color="var(--primary)" />}
                  </div>
                ))}
              </div>
              <button className="btn btn-outline" style={{ width: '100%', marginTop: '2rem' }}>Full Ranking <ExternalLink size={14} /></button>
            </div>

            {/* Floating Action Button Replacement */}
            <div className="card-glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>See something wrong in nature?</p>
              <button className="btn btn-primary" style={{ width: '100%', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                <Plus size={20} /> New Environmental Report
              </button>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
