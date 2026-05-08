import { useState } from 'react';
import { 
  Trophy, 
  AlertTriangle, 
  Plus, 
  ChevronRight, 
  ShieldCheck,
  Zap,
  MapPin,
  Clock,
  CheckCircle,
  Activity
} from 'lucide-react';
import Layout from '../components/Layout';
import NewComplaintModal from '../components/NewComplaintModal';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, complaints, notifications, isLoading } = useAppContext();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!user) return null;

  // Filter complaints specific to this citizen
  const userComplaints = complaints.filter(c => c.citizenId === user.id || (c.citizen && c.citizen.id === user.id));

  const pendingCount = userComplaints.filter(c => c.status === 'pending' || c.status === 'in-progress').length;
  const resolvedCount = userComplaints.filter(c => c.status === 'resolved').length;

  const stats = [
    { label: 'Total Reports', value: userComplaints.length, icon: <AlertTriangle size={24} />, color: 'var(--primary)', shadow: 'var(--primary-glow)' },
    { label: 'Resolved Cases', value: resolvedCount, icon: <ShieldCheck size={24} />, color: 'var(--secondary)', shadow: 'rgba(59, 130, 246, 0.2)' },
    { label: 'Impact Points', value: user.points || 0, icon: <Zap size={24} />, color: 'var(--warning)', shadow: 'rgba(245, 158, 11, 0.2)' },
  ];

  // Generate Activity Feed by merging real notifications + synthesized creation events
  let activities = [];
  
  if (notifications) {
    notifications.forEach(n => {
      let type = 'info';
      let icon = <Activity size={16} />;
      
      if (n.message.includes('resolved')) {
        type = 'resolved';
        icon = <CheckCircle size={16} />;
      } else if (n.message.includes('assigned') || n.message.includes('progress') || n.message.includes('in-progress')) {
        type = 'progress';
        icon = <Zap size={16} />;
      }

      activities.push({
        id: `notif-${n.id}`,
        type,
        title: 'Status Update',
        desc: n.message,
        date: new Date(n.createdAt),
        icon
      });
    });
  }

  userComplaints.forEach(c => {
    activities.push({
      id: `comp-${c.id}-created`,
      type: 'created',
      title: 'Report Submitted',
      desc: c.title,
      date: new Date(c.createdAt),
      icon: <AlertTriangle size={16} />
    });
  });

  // Sort activities by date descending
  activities.sort((a, b) => b.date - a.date);
  const recentActivities = activities.slice(0, 5);

  return (
    <Layout>
      <div className="fade-in">
        <div className="flex-between mb-8">
          <div>
            <h1 className="text-gradient">Welcome, {user.name}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>
              Track your environmental impact and active reports.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> New Report
          </button>
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
          <div>
            <div className="flex-between mb-8">
              <h3>Recent Environmental Activity</h3>
              <button className="btn btn-ghost" onClick={() => navigate('/complaints')}>View All <ChevronRight size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
              {isLoading ? (
                [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '100px', borderRadius: 'var(--radius-lg)' }}></div>)
              ) : userComplaints.length === 0 ? (
                <div className="card flex-center" style={{ padding: 'var(--s-16)', flexDirection: 'column', textAlign: 'center' }}>
                  <AlertTriangle size={48} color="var(--text-muted)" style={{ marginBottom: 'var(--s-4)', opacity: 0.3 }} />
                  <h4 style={{ color: 'var(--text-muted)' }}>No Active Reports</h4>
                  <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>You haven't filed any environmental reports yet.</p>
                  <button className="btn btn-primary mt-4" onClick={() => setIsModalOpen(true)}><Plus size={18} /> New Report</button>
                </div>
              ) : (
                userComplaints.slice(0, 4).map(c => (
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
                    <button className="icon-button" onClick={() => navigate('/complaints')}><ChevronRight size={20} /></button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Activity Feed */}
          <aside>
            <div className="flex-between mb-8">
              <h3>Recent Activity</h3>
              <Activity size={20} color="var(--info)" />
            </div>
            
            <div className="card mb-8">
              {recentActivities.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                  <p>No recent activity detected.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {recentActivities.map((act, i) => (
                    <div key={act.id} className="flex-between" style={{ position: 'relative' }}>
                      {/* Timeline line */}
                      {i !== recentActivities.length - 1 && (
                        <div style={{ position: 'absolute', left: '19px', top: '40px', bottom: '-1.5rem', width: '2px', background: 'var(--border)' }}></div>
                      )}
                      
                      <div className="flex-center" style={{ gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ 
                          width: '40px', height: '40px', borderRadius: '50%', 
                          background: act.type === 'resolved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)', 
                          color: act.type === 'resolved' ? 'var(--primary)' : 'var(--secondary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1
                        }}>
                          {act.icon}
                        </div>
                        <div>
                          <p style={{ fontWeight: 700, margin: '0 0 0.25rem 0', fontSize: '0.95rem' }}>{act.title}</p>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', margin: 0 }}>{act.desc}</p>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {act.date.toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="card-glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>See something wrong in nature?</p>
              <button className="btn btn-primary" style={{ width: '100%', padding: '1.25rem', borderRadius: 'var(--radius-md)' }} onClick={() => setIsModalOpen(true)}>
                <Plus size={20} /> New Environmental Report
              </button>
            </div>
          </aside>
        </div>
      </div>

      <NewComplaintModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </Layout>
  );
}
