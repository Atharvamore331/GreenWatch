import { useState, useEffect } from 'react';
import { User, Bell, Shield, Moon, Globe, Save, LogOut, ChevronRight, Lock, Eye } from 'lucide-react';
import Layout from '../components/Layout';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const userStr = localStorage.getItem('greenwatch_current_user');
    if (userStr) setUser(JSON.parse(userStr));
  }, []);

  const tabs = [
    { id: 'profile', label: 'Profile Intelligence', icon: <User size={18} /> },
    { id: 'security', label: 'Security & Auth', icon: <Lock size={18} /> },
    { id: 'notifications', label: 'Alert Preferences', icon: <Bell size={18} /> },
    { id: 'appearance', label: 'System Theme', icon: <Moon size={18} /> },
  ];

  if (!user) return null;

  return (
    <Layout>
      <div className="fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div className="mb-8">
          <h1 className="text-gradient">System Configuration</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your account preferences and operational settings.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 'var(--s-8)' }}>
          {/* Sidebar Tabs */}
          <aside>
            <div className="card" style={{ padding: '0.75rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {tabs.map(tab => (
                  <button 
                    key={tab.id} 
                    className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-ghost'}`} 
                    onClick={() => setActiveTab(tab.id)}
                    style={{ justifyContent: 'flex-start', width: '100%', padding: '0.8rem 1.25rem' }}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
              <hr style={{ margin: '1rem 0', opacity: 0.1 }} />
              <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--danger)' }}>
                <LogOut size={18} /> Deactivate Account
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main>
            <div className="card" style={{ padding: '2.5rem' }}>
              {activeTab === 'profile' && (
                <div className="fade-in">
                  <h3 className="mb-8">Identity Profile</h3>
                  <div className="flex-center mb-8" style={{ justifyContent: 'flex-start', gap: '2rem' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, color: 'white', border: '4px solid var(--border-light)' }}>
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <button className="btn btn-outline mb-8" style={{ marginBottom: '0.5rem' }}>Update Avatar</button>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>JPG, PNG or SVG. Max size 2MB.</p>
                    </div>
                  </div>

                  <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">Full Operator Name</label>
                      <input className="form-control" defaultValue={user.name} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Coordinate</label>
                      <input className="form-control" defaultValue={user.email} />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">Operational Bio</label>
                      <textarea className="form-control" rows="3" placeholder="Tell us about your environmental mission..."></textarea>
                    </div>
                  </form>
                  
                  <div className="flex-between mt-4" style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Last login: {new Date().toLocaleDateString()}</p>
                    <button className="btn btn-primary"><Save size={18} /> Save Changes</button>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="fade-in">
                  <h3 className="mb-8">Security & Encryption</h3>
                  <div className="card-glass mb-8" style={{ padding: '1.5rem' }}>
                    <div className="flex-between mb-8">
                      <div className="flex-center" style={{ gap: '1rem' }}>
                        <Shield size={24} color="var(--primary)" />
                        <div>
                          <p style={{ fontWeight: 700, margin: 0 }}>Two-Factor Authentication</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0 }}>Add an extra layer of security to your account.</p>
                        </div>
                      </div>
                      <div style={{ width: '40px', height: '22px', background: 'var(--border)', borderRadius: '11px', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: '2px', top: '2px', width: '18px', height: '18px', background: 'white', borderRadius: '50%' }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <input className="form-control" type="password" placeholder="••••••••" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Secure Password</label>
                    <input className="form-control" type="password" placeholder="••••••••" />
                  </div>
                  <button className="btn btn-outline" style={{ marginTop: '1rem' }}>Update Security Credentials</button>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="fade-in">
                  <h3 className="mb-8">Alert Configuration</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {[
                      { label: 'Intelligence Alerts', desc: 'Get notified about new environmental reports in your area.', active: true },
                      { label: 'Remediation Updates', desc: 'Receive status changes on reports you are following.', active: true },
                      { label: 'Community Milestones', desc: 'Get alerts for leaderboard changes and season awards.', active: false },
                      { label: 'System Maintenance', desc: 'Technical updates and platform announcements.', active: true }
                    ].map((item, i) => (
                      <div key={i} className="flex-between">
                        <div>
                          <p style={{ fontWeight: 700, margin: '0 0 0.25rem 0' }}>{item.label}</p>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', margin: 0 }}>{item.desc}</p>
                        </div>
                        <div style={{ width: '40px', height: '22px', background: item.active ? 'var(--primary)' : 'var(--border)', borderRadius: '11px', position: 'relative', transition: 'background 0.3s' }}>
                          <div style={{ position: 'absolute', left: item.active ? '20px' : '2px', top: '2px', width: '18px', height: '18px', background: 'white', borderRadius: '50%', transition: 'left 0.3s' }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="fade-in">
                  <h3 className="mb-8">Visual Preferences</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div className="card-glass" style={{ padding: '1.5rem', textAlign: 'center', border: '2px solid var(--primary)' }}>
                      <Moon size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                      <p style={{ fontWeight: 800 }}>Deep Night (Default)</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Premium glassmorphism theme optimized for low-light operations.</p>
                    </div>
                    <div className="card-glass" style={{ padding: '1.5rem', textAlign: 'center', opacity: 0.5 }}>
                      <Globe size={32} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
                      <p style={{ fontWeight: 800 }}>Clear Sky</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Light mode theme (Coming soon in Next-Gen update).</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </Layout>
  );
}
