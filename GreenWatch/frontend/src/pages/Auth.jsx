import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Shield, User, ArrowRight, CheckCircle, Globe, Zap, Mail, Lock } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('citizen');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('greenwatch_current_user'));
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const res = await axios.post(`${API_URL}/auth/login`, { ...formData, role });
        localStorage.setItem('greenwatch_current_user', JSON.stringify(res.data));
        navigate(role === 'admin' ? '/admin' : '/dashboard');
      } else {
        const res = await axios.post(`${API_URL}/auth/register`, formData);
        localStorage.setItem('greenwatch_current_user', JSON.stringify(res.data));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      {/* Branding Header */}
      <div className="flex-center" style={{ position: 'absolute', top: 'var(--s-8)', left: 'var(--s-12)', gap: '0.75rem', zIndex: 10 }}>
        <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '0.75rem', display: 'flex' }}>
          <Leaf color="white" size={24} />
        </div>
        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>GreenWatch</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 450px', minHeight: '100vh', padding: '0 5% 0 10%', alignItems: 'center', gap: 'var(--s-16)' }}>
        
        {/* Hero Section */}
        <div className="fade-in">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--primary-glow)', color: 'var(--primary-light)', marginBottom: 'var(--s-8)', fontSize: '0.875rem', fontWeight: 600 }}>
            <Globe size={16} /> <span>Join 10,000+ environmental guardians</span>
          </div>
          
          <h1 className="text-gradient" style={{ fontSize: '4.5rem', marginBottom: 'var(--s-6)' }}>
            Empowering Action For A Greener Future.
          </h1>
          
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: 'var(--s-12)', maxWidth: '600px' }}>
            The premier platform for reporting environmental violations, tracking remediation, and building sustainable communities.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--s-8)' }}>
            <div className="flex-center" style={{ gap: 'var(--s-4)', justifyContent: 'flex-start' }}>
              <div style={{ color: 'var(--primary)' }}><CheckCircle size={28} /></div>
              <div>
                <h4 style={{ margin: 0 }}>Instant Reports</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>AI-verified environmental tracking</p>
              </div>
            </div>
            <div className="flex-center" style={{ gap: 'var(--s-4)', justifyContent: 'flex-start' }}>
              <div style={{ color: 'var(--info)' }}><Zap size={28} /></div>
              <div>
                <h4 style={{ margin: 0 }}>Smart Rewards</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Earn impact points for every action</p>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Card */}
        <div className="card fade-in" style={{ padding: 'var(--s-10)', background: 'rgba(30, 41, 59, 0.8)' }}>
          {/* Custom Toggle Switch */}
          <div style={{ position: 'relative', display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '0.25rem', borderRadius: 'var(--radius-md)', marginBottom: 'var(--s-8)' }}>
            <div style={{ 
              position: 'absolute', width: '50%', height: 'calc(100% - 0.5rem)', 
              background: 'var(--primary)', borderRadius: 'var(--radius-sm)', 
              transition: 'var(--transition-normal)', 
              left: role === 'citizen' ? '0.25rem' : 'calc(50% - 0.25rem)',
              zIndex: 0 
            }}></div>
            <button 
              onClick={() => {setRole('citizen'); setIsLogin(true);}}
              className={`btn-ghost`}
              style={{ flex: 1, zIndex: 1, color: role === 'citizen' ? 'white' : 'var(--text-muted)', padding: '0.6rem' }}
            >
              Citizen
            </button>
            <button 
              onClick={() => {setRole('admin'); setIsLogin(true);}}
              className={`btn-ghost`}
              style={{ flex: 1, zIndex: 1, color: role === 'admin' ? 'white' : 'var(--text-muted)', padding: '0.6rem' }}
            >
              Admin
            </button>
          </div>

          <h2 style={{ marginBottom: '0.5rem' }}>{isLogin ? 'Sign In' : 'Register'}</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--s-8)', fontSize: '0.95rem' }}>
            {isLogin ? `Access the ${role} command center` : 'Start your sustainability journey'}
          </p>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: 'var(--s-6)', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-4)' }}>
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                  <input type="text" className="form-control" style={{ paddingLeft: '2.75rem' }} required placeholder="Jane Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input type="email" className="form-control" style={{ paddingLeft: '2.75rem' }} required placeholder="jane@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input type="password" className="form-control" style={{ paddingLeft: '2.75rem' }} required placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--s-4)', padding: '1rem' }} disabled={loading}>
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')} <ArrowRight size={18} />
            </button>
          </form>

          {role === 'citizen' && (
            <div style={{ textAlign: 'center', marginTop: 'var(--s-8)' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {isLogin ? "New to GreenWatch? " : "Already have an account? "}
                <span style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }} onClick={() => setIsLogin(!isLogin)}>
                  {isLogin ? 'Create one now' : 'Sign in instead'}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
