import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trophy, Medal, Star, TrendingUp, Users, Search } from 'lucide-react';
import Layout from '../components/Layout';

const API_URL = 'http://localhost:5000/api';

export default function Leaderboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('greenwatch_current_user');
    if (!userStr) return navigate('/');
    const u = JSON.parse(userStr);
    setUser(u);
    
    fetchAndCalculateLeaderboard().then(() => {
      setTimeout(() => setIsLoading(false), 400);
    });
  }, [navigate]);

  const fetchAndCalculateLeaderboard = async () => {
    try {
      const res = await axios.get(`${API_URL}/complaints`);
      const complaints = res.data;
      
      const userScores = {};

      complaints.forEach(c => {
        if (!c.citizen) return;
        const cId = c.citizen.id;
        if (!userScores[cId]) {
          userScores[cId] = {
            id: cId,
            name: c.citizen.name,
            totalReports: 0,
            resolvedReports: 0,
            score: 0
          };
        }
        
        userScores[cId].totalReports += 1;
        if (c.status === 'resolved') {
          userScores[cId].resolvedReports += 1;
        }
      });

      // Calculate dynamic score: 50 pts per resolved, 10 pts per pending/in-progress
      const rankedUsers = Object.values(userScores).map(u => ({
        ...u,
        score: (u.resolvedReports * 50) + (u.totalReports * 10)
      })).sort((a, b) => b.score - a.score);

      setLeaderboard(rankedUsers);
    } catch (err) {
      console.error(err);
    }
  };

  const getRankBadge = (index) => {
    if (index === 0) return <div style={{ background: 'linear-gradient(135deg, #FFD700, #FDB931)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}><Trophy size={28} /></div>;
    if (index === 1) return <div style={{ color: '#C0C0C0' }}><Medal size={28} /></div>;
    if (index === 2) return <div style={{ color: '#CD7F32' }}><Medal size={28} /></div>;
    return <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-muted)', width: '28px', textAlign: 'center' }}>#{index + 1}</span>;
  };

  if (!user) return null;

  return (
    <div className={user.role === 'admin' ? 'admin-bg' : 'dashboard-bg'}>
      <Layout>
        <div className="page-enter" style={{ paddingBottom: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ color: 'white', fontSize: '1.8rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                <Trophy size={28} color="var(--primary)" /> Leaderboard
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0.2rem 0 0 0' }}>
                Environmental champions and community rankings.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div className="search-bar" style={{ width: '220px' }}>
                <Search size={16} className="search-icon" />
                <input type="text" placeholder="Search citizens..." style={{ padding: '0.5rem 1.25rem 0.5rem 2.5rem', fontSize: '0.8rem' }} />
              </div>
              <div className="card" style={{ padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '99px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                   <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{leaderboard.length}</span> <span style={{ color: 'var(--text-muted)' }}>Citizens</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Star size={18} color="var(--primary)" /> Global Rankings
              </h3>
              <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><TrendingUp size={14} /> 50pts / Resolved</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Users size={14} /> 10pts / Report</span>
              </div>
            </div>

            <div style={{ padding: '1rem' }}>
              {isLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[1,2,3,4,5].map(i => <div key={i} className="skeleton skeleton-box" style={{ height: '70px', borderRadius: 'var(--radius-sm)' }}></div>)}
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="empty-state" style={{ padding: '3rem 0' }}>
                  <p style={{ color: 'var(--text-muted)' }}>No data available yet. Be the first to report an issue!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {leaderboard.map((lbUser, index) => {
                    const isCurrentUser = lbUser.id === user.id;
                    const isTop3 = index < 3;
                    
                    return (
                      <div 
                        key={lbUser.id} 
                        className={`page-enter`} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          padding: '1rem 1.5rem', 
                          background: isCurrentUser ? 'rgba(16, 185, 129, 0.1)' : (isTop3 ? 'rgba(255,255,255,0.03)' : 'transparent'),
                          border: isCurrentUser ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                          borderBottom: !isCurrentUser ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(16, 185, 129, 0.3)',
                          borderRadius: 'var(--radius-sm)',
                          transition: 'background 0.2s',
                          animationDelay: `${index * 0.05}s`
                        }}
                      >
                        <div style={{ width: '60px', display: 'flex', justifyContent: 'center', marginRight: '1rem' }}>
                          {getRankBadge(index)}
                        </div>
                        
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 0.2rem 0', fontSize: '1.1rem', color: isCurrentUser ? 'var(--primary)' : 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {lbUser.name} {isCurrentUser && <span className="badge badge-resolved" style={{ fontSize: '0.6rem' }}>YOU</span>}
                          </h4>
                          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <span>Total Reports: {lbUser.totalReports}</span>
                            <span>•</span>
                            <span>Resolved: <strong style={{ color: 'var(--success)' }}>{lbUser.resolvedReports}</strong></span>
                          </div>
                        </div>
                        
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: isTop3 ? 'var(--primary)' : 'var(--text-main)', textShadow: isTop3 ? '0 0 10px rgba(16,185,129,0.3)' : 'none' }}>
                            {lbUser.score}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Points</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </Layout>
    </div>
  );
}
