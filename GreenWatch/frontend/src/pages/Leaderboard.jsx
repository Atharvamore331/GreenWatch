import { useMemo } from 'react';
import { Trophy, Award, Star, TrendingUp, Users, ArrowUpRight, Shield, Leaf, Activity, CheckCircle, FileText } from 'lucide-react';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';

export default function Leaderboard() {
  const { user, complaints, isLoading } = useAppContext();

  const getBadgeInfo = (points) => {
    if (points >= 301) return { title: 'Earth Champion', color: 'var(--warning)', icon: <Trophy size={14} />, bg: 'rgba(245, 158, 11, 0.1)' };
    if (points >= 151) return { title: 'Protector', color: '#8b5cf6', icon: <Shield size={14} />, bg: 'rgba(139, 92, 246, 0.1)' };
    if (points >= 51) return { title: 'Guardian', color: 'var(--primary)', icon: <Leaf size={14} />, bg: 'rgba(56, 189, 248, 0.1)' };
    return { title: 'Eco Starter', color: 'var(--text-dim)', icon: <Activity size={14} />, bg: 'rgba(255, 255, 255, 0.05)' };
  };

  const leaders = useMemo(() => {
    if (!complaints) return [];
    
    const userMap = {};
    
    complaints.forEach(c => {
      if (!c.citizen || !c.citizen.id) return;
      
      const uid = c.citizen.id;
      if (!userMap[uid]) {
        userMap[uid] = {
          id: uid,
          name: c.citizen.name,
          email: c.citizen.email,
          points: 0,
          submittedCount: 0,
          resolvedCount: 0
        };
      }
      
      userMap[uid].submittedCount += 1;
      userMap[uid].points += 10;
      
      if (c.status === 'resolved') {
        userMap[uid].resolvedCount += 1;
        userMap[uid].points += 40;
      }
    });

    return Object.values(userMap).sort((a, b) => b.points - a.points);
  }, [complaints]);

  // Determine user's own rank
  const currentUserRank = leaders.findIndex(l => l.id === user?.id) + 1;
  const rankDisplay = currentUserRank > 0 ? `Top ${Math.max(1, Math.ceil((currentUserRank / leaders.length) * 100))}%` : 'Unranked';

  return (
    <Layout>
      <div className="fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div className="flex-between mb-8" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="text-gradient">Top Environmental Contributors</h1>
            <p style={{ color: 'var(--text-muted)' }}>Environmental Leaders in the global sustainability movement.</p>
          </div>
          {user && user.role === 'citizen' && (
            <div style={{ padding: '0.75rem 1.25rem', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Trophy color="var(--warning)" size={24} />
              <div>
                <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--warning)', margin: 0, textTransform: 'uppercase' }}>Your Season Rank</p>
                <p style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>{rankDisplay}</p>
              </div>
            </div>
          )}
        </div>

        {/* Top 3 Podium */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: 'var(--s-6)', alignItems: 'flex-end', marginBottom: 'var(--s-12)' }}>
          {isLoading ? (
            [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: i === 2 ? '300px' : '220px', borderRadius: 'var(--radius-lg)' }}></div>)
          ) : (
            <>
              {/* Rank 2 */}
              <div className="card" style={{ textAlign: 'center', padding: '2rem', background: leaders[1]?.id === user?.id ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255,255,255,0.03)', border: leaders[1]?.id === user?.id ? '1px solid var(--primary)' : '1px solid var(--border)' }}>
                <Award size={32} color="#94a3b8" style={{ marginBottom: '1rem' }} />
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--secondary)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>{leaders[1] ? leaders[1].name.charAt(0) : '-'}</div>
                <h4 style={{ marginBottom: '0.25rem' }}>{leaders[1]?.name || 'Unranked'}</h4>
                <p style={{ color: 'var(--secondary-light)', fontWeight: 800, marginBottom: '1rem' }}>{leaders[1]?.points || 0} pts</p>
                {leaders[1] && (
                   <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.6rem', background: getBadgeInfo(leaders[1].points).bg, color: getBadgeInfo(leaders[1].points).color, borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                     {getBadgeInfo(leaders[1].points).icon} {getBadgeInfo(leaders[1].points).title}
                   </div>
                )}
              </div>

              {/* Rank 1 */}
              <div className="card" style={{ textAlign: 'center', padding: '3rem', border: '1px solid var(--warning)', boxShadow: '0 0 30px rgba(245, 158, 11, 0.1)', background: leaders[0]?.id === user?.id ? 'linear-gradient(to bottom, rgba(245, 158, 11, 0.1), rgba(255, 255, 255, 0.02))' : 'var(--bg-card)' }}>
                <Trophy size={48} color="var(--warning)" style={{ marginBottom: '1rem' }} />
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--warning)', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: 'var(--bg-base)' }}>{leaders[0] ? leaders[0].name.charAt(0) : '-'}</div>
                <h3 style={{ marginBottom: '0.5rem' }}>{leaders[0]?.name || 'Unranked'}</h3>
                <p style={{ color: 'var(--warning)', fontSize: '1.25rem', fontWeight: 900, marginBottom: '1rem' }}>{leaders[0]?.points || 0} pts</p>
                {leaders[0] && (
                   <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', background: getBadgeInfo(leaders[0].points).bg, color: getBadgeInfo(leaders[0].points).color, borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700 }}>
                     {getBadgeInfo(leaders[0].points).icon} {getBadgeInfo(leaders[0].points).title}
                   </div>
                )}
              </div>

              {/* Rank 3 */}
              <div className="card" style={{ textAlign: 'center', padding: '2rem', background: leaders[2]?.id === user?.id ? 'rgba(56, 189, 248, 0.08)' : 'rgba(255,255,255,0.03)', border: leaders[2]?.id === user?.id ? '1px solid var(--primary)' : '1px solid var(--border)' }}>
                <Star size={32} color="#b45309" style={{ marginBottom: '1rem' }} />
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#b45309', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>{leaders[2] ? leaders[2].name.charAt(0) : '-'}</div>
                <h4 style={{ marginBottom: '0.25rem' }}>{leaders[2]?.name || 'Unranked'}</h4>
                <p style={{ color: '#f59e0b', fontWeight: 800, marginBottom: '1rem' }}>{leaders[2]?.points || 0} pts</p>
                {leaders[2] && (
                   <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.6rem', background: getBadgeInfo(leaders[2].points).bg, color: getBadgeInfo(leaders[2].points).color, borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                     {getBadgeInfo(leaders[2].points).icon} {getBadgeInfo(leaders[2].points).title}
                   </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Global Rankings Table */}
        <div className="card">
          <div className="flex-between mb-8">
            <h3>Global Impact Ranking</h3>
            <div className="flex-center" style={{ gap: '1rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
              <Users size={16} /> <span>{leaders.length} Active Contributors</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
            {isLoading ? (
              [1, 2, 3, 4, 5].map(i => <div key={i} className="skeleton" style={{ height: '70px', borderRadius: 'var(--radius-md)' }}></div>)
            ) : leaders.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No active complaints reported yet. Be the first to make an impact!
              </div>
            ) : (
              leaders.slice(3).map((l, i) => {
                const badge = getBadgeInfo(l.points);
                const isCurrentUser = l.id === user?.id;
                
                return (
                  <div key={l.id} className="card-glass flex-between" style={{ padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)', border: isCurrentUser ? '1px solid var(--primary)' : '1px solid var(--border)', background: isCurrentUser ? 'rgba(56, 189, 248, 0.05)' : 'var(--bg-surface)' }}>
                    <div className="flex-center" style={{ gap: '1.5rem' }}>
                      <span style={{ width: '24px', fontWeight: 800, color: isCurrentUser ? 'var(--primary)' : 'var(--text-dim)' }}>{i + 4}</span>
                      <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: isCurrentUser ? 'var(--primary)' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: isCurrentUser ? 'var(--bg-base)' : 'var(--text-main)' }}>{l.name.charAt(0)}</div>
                      <div>
                        <p style={{ fontWeight: 700, margin: '0 0 0.3rem 0', color: isCurrentUser ? 'var(--text-main)' : 'var(--text-main)' }}>
                          {l.name} {isCurrentUser && <span style={{ fontSize: '0.7rem', color: 'var(--primary)', marginLeft: '0.5rem', fontWeight: 600 }}>(You)</span>}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                           <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: badge.color }}>
                             {badge.icon} {badge.title}
                           </span>
                           <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                             <FileText size={12} /> {l.submittedCount} Submissions
                           </span>
                           <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--success)' }}>
                             <CheckCircle size={12} /> {l.resolvedCount} Resolved
                           </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-center" style={{ gap: '1rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 800, margin: 0, color: 'var(--primary-light)', fontSize: '1.1rem' }}>{l.points} pts</p>
                      </div>
                      <ArrowUpRight size={18} color="var(--border)" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
