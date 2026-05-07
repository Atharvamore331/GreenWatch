import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Zap, Award, Star, TrendingUp, Users, ArrowUpRight } from 'lucide-react';
import Layout from '../components/Layout';

const API_URL = 'http://localhost:5000/api';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaders();
  }, []);

  const fetchLeaders = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/leaderboard`);
      setLeaders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsLoading(false), 800);
    }
  };

  return (
    <Layout>
      <div className="fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div className="flex-between mb-8">
          <div>
            <h1 className="text-gradient">Environmental Elite</h1>
            <p style={{ color: 'var(--text-muted)' }}>Top contributors in the global sustainability movement.</p>
          </div>
          <div style={{ padding: '0.75rem 1.25rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Trophy color="var(--warning)" size={24} />
            <div>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--warning)', margin: 0, textTransform: 'uppercase' }}>Season Rank</p>
              <p style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Top 5%</p>
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: 'var(--s-6)', alignItems: 'flex-end', marginBottom: 'var(--s-12)' }}>
          {isLoading ? (
            [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: i === 2 ? '300px' : '220px', borderRadius: 'var(--radius-lg)' }}></div>)
          ) : (
            <>
              {/* Rank 2 */}
              <div className="card" style={{ textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.03)' }}>
                <Award size={32} color="#94a3b8" style={{ marginBottom: '1rem' }} />
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--secondary)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>{leaders[1]?.name.charAt(0)}</div>
                <h4 style={{ marginBottom: '0.25rem' }}>{leaders[1]?.name || 'Guardian'}</h4>
                <p style={{ color: 'var(--secondary-light)', fontWeight: 800 }}>{leaders[1]?.points || 0} pts</p>
              </div>

              {/* Rank 1 */}
              <div className="card" style={{ textAlign: 'center', padding: '3rem', border: '1px solid var(--warning)', boxShadow: '0 0 30px rgba(245, 158, 11, 0.1)' }}>
                <Trophy size={48} color="var(--warning)" style={{ marginBottom: '1rem' }} />
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--warning)', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: 'var(--bg-base)' }}>{leaders[0]?.name.charAt(0)}</div>
                <h3 style={{ marginBottom: '0.5rem' }}>{leaders[0]?.name || 'Champion'}</h3>
                <p style={{ color: 'var(--warning)', fontSize: '1.25rem', fontWeight: 900 }}>{leaders[0]?.points || 0} pts</p>
                <div className="badge badge-resolved mt-4">Earth Guardian</div>
              </div>

              {/* Rank 3 */}
              <div className="card" style={{ textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.03)' }}>
                <Star size={32} color="#b45309" style={{ marginBottom: '1rem' }} />
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#b45309', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>{leaders[2]?.name.charAt(0)}</div>
                <h4 style={{ marginBottom: '0.25rem' }}>{leaders[2]?.name || 'Protector'}</h4>
                <p style={{ color: '#f59e0b', fontWeight: 800 }}>{leaders[2]?.points || 0} pts</p>
              </div>
            </>
          )}
        </div>

        {/* Global Rankings Table */}
        <div className="card">
          <div className="flex-between mb-8">
            <h3>Global Impact Ranking</h3>
            <div className="flex-center" style={{ gap: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              <Users size={16} /> <span>12,450 Active Members</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
            {isLoading ? (
              [1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton" style={{ height: '70px', borderRadius: 'var(--radius-md)' }}></div>)
            ) : (
              leaders.slice(3).map((l, i) => (
                <div key={l.id} className="card-glass flex-between" style={{ padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)' }}>
                  <div className="flex-center" style={{ gap: '1.5rem' }}>
                    <span style={{ width: '24px', fontWeight: 800, color: 'var(--text-dim)' }}>{i + 4}</span>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{l.name.charAt(0)}</div>
                    <div>
                      <p style={{ fontWeight: 700, margin: 0 }}>{l.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: 0 }}>Sustainability Level {Math.floor(l.points/500) + 1}</p>
                    </div>
                  </div>
                  <div className="flex-center" style={{ gap: '1rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 800, margin: 0, color: 'var(--primary-light)' }}>{l.points} pts</p>
                      <div className="flex-center" style={{ gap: '0.25rem', justifyContent: 'flex-end', color: 'var(--success)', fontSize: '0.7rem' }}>
                        <TrendingUp size={10} /> +12% this week
                      </div>
                    </div>
                    <ArrowUpRight size={18} color="var(--border)" />
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
