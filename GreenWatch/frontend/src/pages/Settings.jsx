import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { User as UserIcon, Settings as SettingsIcon, Bell, Moon, Sun, Shield, Award, MapPin, CheckCircle, Smartphone, Mail, Globe, Lock } from 'lucide-react';
import { toast } from '../utils/toastService';

const API_URL = 'http://localhost:5000/api';

export default function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);

  // Local Settings State
  const [preferences, setPreferences] = useState({
    darkMode: true,
    emailNotifs: true,
    pushNotifs: false,
    publicProfile: true,
    shareLocation: true
  });

  useEffect(() => {
    const userStr = localStorage.getItem('greenwatch_current_user');
    if (!userStr) {
      navigate('/');
      return;
    }
    const u = JSON.parse(userStr);
    setUser(u);
    
    // Load preferences from local storage if they exist
    const savedPrefs = localStorage.getItem(`greenwatch_prefs_${u.id}`);
    if (savedPrefs) {
      const parsedPrefs = JSON.parse(savedPrefs);
      setPreferences(parsedPrefs);
      if (!parsedPrefs.darkMode) {
        document.body.classList.add('light-theme');
      }
    }

    if (u.role === 'citizen') {
      fetchComplaints(u.id);
    }
  }, [navigate]);

  const fetchComplaints = async (citizenId) => {
    try {
      const res = await axios.get(`${API_URL}/complaints`);
      const userComplaints = res.data.filter(c => c.citizenId === citizenId || (c.citizen && c.citizen.id === citizenId));
      setComplaints(userComplaints);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = (key) => {
    setPreferences(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem(`greenwatch_prefs_${user.id}`, JSON.stringify(updated));
      
      // Handle dark mode side effect immediately
      if (key === 'darkMode') {
        if (updated.darkMode) {
          document.body.classList.remove('light-theme');
          toast.success("Dark mode enabled");
        } else {
          document.body.classList.add('light-theme');
          toast.success("Light mode enabled");
        }
      } else {
        toast.info("Preference saved locally.");
      }
      return updated;
    });
  };

  if (!user) return null;

  // Profile Analytics
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;
  const totalPoints = (resolvedCount * 50) + (complaints.length * 10) + (user.points || 0);

  let impactLevel = "Novice Reporter";
  if (totalPoints > 200) impactLevel = "Active Contributor";
  if (totalPoints > 500) impactLevel = "Environmental Advocate";
  if (totalPoints > 1000) impactLevel = "Green Guardian";

  return (
    <div className="dashboard-bg" style={{ minHeight: '100vh' }}>
      <Layout>
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '3rem' }}>
          
          <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <SettingsIcon size={32} color="var(--primary)" />
            <h2 style={{ color: 'white', fontSize: '2rem', margin: 0 }}>Profile & Settings</h2>
          </div>

          {/* Profile Header Card */}
          <div className="card" style={{ padding: '2rem', marginBottom: '2.5rem', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ 
              width: '100px', height: '100px', borderRadius: '50%', 
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.5rem', fontWeight: 'bold', color: 'white',
              boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)'
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            
            {/* Info */}
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.75rem', margin: '0 0 0.25rem 0', color: 'white' }}>{user.name}</h3>
              <p style={{ color: 'var(--text-muted)', margin: '0 0 1rem 0', fontSize: '1rem' }}>{user.email} &bull; <span style={{textTransform:'capitalize'}}>{user.role}</span></p>
              
              {user.role === 'citizen' && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--primary)', padding: '0.4rem 1rem', borderRadius: '99px', color: 'var(--primary-light)', fontSize: '0.85rem', fontWeight: 600 }}>
                  <Award size={16} /> {impactLevel}
                </div>
              )}
            </div>

            {/* Stats */}
            {user.role === 'citizen' && (
              <div style={{ display: 'flex', gap: '1.5rem', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.5rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>{complaints.length}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>REPORTS</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success)' }}>{resolvedCount}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RESOLVED</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{totalPoints}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>POINTS</span>
                </div>
              </div>
            )}
          </div>

          {/* Settings Grid */}
          <div className="settings-grid">
            
            {/* Appearance */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                <Sun size={20} color="var(--primary)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Appearance</h3>
              </div>
              
              <div className="settings-row">
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem' }}>Dark Mode</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Switch between light and dark themes.</p>
                </div>
                <button className={`toggle-btn ${preferences.darkMode ? 'active' : ''}`} onClick={() => handleToggle('darkMode')}>
                  <div className="toggle-circle"></div>
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                <Bell size={20} color="var(--warning)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Notifications</h3>
              </div>
              
              <div className="settings-row">
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', display: 'flex', alignItems:'center', gap:'0.4rem' }}><Mail size={16}/> Email Alerts</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Receive major updates via email.</p>
                </div>
                <button className={`toggle-btn ${preferences.emailNotifs ? 'active' : ''}`} onClick={() => handleToggle('emailNotifs')}>
                  <div className="toggle-circle"></div>
                </button>
              </div>

              <div className="settings-row">
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', display: 'flex', alignItems:'center', gap:'0.4rem' }}><Smartphone size={16}/> Push Notifications</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Instant alerts on your device.</p>
                </div>
                <button className={`toggle-btn ${preferences.pushNotifs ? 'active' : ''}`} onClick={() => handleToggle('pushNotifs')}>
                  <div className="toggle-circle"></div>
                </button>
              </div>
            </div>

            {/* Privacy */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                <Shield size={20} color="var(--success)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Privacy</h3>
              </div>
              
              <div className="settings-row">
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', display: 'flex', alignItems:'center', gap:'0.4rem' }}><Globe size={16}/> Public Profile</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Allow others to see your green impact.</p>
                </div>
                <button className={`toggle-btn ${preferences.publicProfile ? 'active' : ''}`} onClick={() => handleToggle('publicProfile')}>
                  <div className="toggle-circle"></div>
                </button>
              </div>

              <div className="settings-row">
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', display: 'flex', alignItems:'center', gap:'0.4rem' }}><MapPin size={16}/> Share Location</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Automatically detect your location.</p>
                </div>
                <button className={`toggle-btn ${preferences.shareLocation ? 'active' : ''}`} onClick={() => handleToggle('shareLocation')}>
                  <div className="toggle-circle"></div>
                </button>
              </div>
            </div>

            {/* Account Info (Read Only) */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                <Lock size={20} color="var(--danger)" />
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Account Security</h3>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Email Address</label>
                <input type="email" className="form-control" value={user.email} disabled style={{ opacity: 0.7 }} />
              </div>

              <div>
                <label className="form-label">Password</label>
                <input type="password" className="form-control" value="********" disabled style={{ opacity: 0.7 }} />
                <button className="btn btn-outline" style={{ marginTop: '0.75rem', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }} onClick={() => toast.error("Password reset is currently disabled.")}>
                  Request Password Reset
                </button>
              </div>
            </div>

          </div>

        </div>
      </Layout>
    </div>
  );
}
