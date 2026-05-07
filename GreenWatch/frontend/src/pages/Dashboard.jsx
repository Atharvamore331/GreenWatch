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
  Clock
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
      setIsLoading(false);
    }
  };

  const stats = [
    { label: 'Total Reports', value: complaints.length, icon: <AlertTriangle />, color: 'var(--primary)' },
    { label: 'Resolved', value: complaints.filter(c => c.status === 'resolved').length, icon: <ShieldCheck />, color: '#3b82f6' },
    { label: 'Env. Points', value: user?.points || 0, icon: <Zap />, color: '#f59e0b' },
  ];

  if (!user) return null;

  return (
    <Layout>
      <div className="citizen-dashboard">
        {/* Welcome Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 700 }}>
            Welcome back, <span style={{ color: 'var(--primary)' }}>{user.name}</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            Your environmental contribution is making a difference today.
          </p>
        </div>

        {/* Stats Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {stats.map((s, i) => (
            <div key={i} className="card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 500 }}>{s.label}</p>
                  <h2 style={{ fontSize: '2.5rem', fontWeight: 700 }}>{s.value}</h2>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem', color: s.color }}>
                  {s.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Content Split */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
          {/* Recent Reports */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem' }}>Your Recent Reports</h3>
              <button className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem' }}>View All</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {complaints.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
                  <AlertTriangle size={48} color="var(--text-muted)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <p style={{ color: 'var(--text-muted)' }}>No reports filed yet. Start your journey by reporting an issue.</p>
                </div>
              ) : (
                complaints.slice(0, 3).map(c => (
                  <div key={c.id} className="card" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '1rem', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {c.image ? (
                        <img src={c.image} alt="Report" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '1rem' }} />
                      ) : (
                        <AlertTriangle size={32} color="var(--text-muted)" />
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <h4 style={{ fontSize: '1.1rem' }}>{c.title}</h4>
                        <span className={`badge badge-${c.status === 'in-progress' ? 'progress' : c.status}`}>{c.status}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={14} /> {c.location}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={14} /> {new Date(c.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <ChevronRight color="var(--text-muted)" />
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Environmental Leaderboard Snippet */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem' }}>Leaderboard</h3>
              <Trophy size={24} color="#f59e0b" />
            </div>
            
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 700, color: i === 1 ? '#f59e0b' : 'var(--text-muted)', width: '20px' }}>{i}</span>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', opacity: 1 - (i*0.2), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        U
                      </div>
                      <div>
                        <p style={{ fontSize: '1rem', fontWeight: 600 }}>Top Citizen {i}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>2{50 - i*20} Points</p>
                      </div>
                    </div>
                    {i === 1 && <ArrowUpRight size={18} color="var(--primary)" />}
                  </div>
                ))}
              </div>
              <button className="btn btn-outline" style={{ width: '100%', marginTop: '2rem' }}>View Full Leaderboard</button>
            </div>

            {/* Quick Action FAB Placeholder */}
            <div style={{ marginTop: '2rem' }}>
              <button className="btn btn-primary" style={{ width: '100%', padding: '1.25rem', borderRadius: '1.5rem', fontSize: '1.1rem' }}>
                <Plus size={24} /> Report Environmental Issue
              </button>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
