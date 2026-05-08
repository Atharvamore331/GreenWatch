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
      <div className="flex-center" style={{ position: 'absolute', top: 'var(--s-6)', left: 'max(var(--s-6), 5vw)', gap: '0.75rem', zIndex: 10 }}>
        <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '0.75rem', display: 'flex' }}>
          <Leaf color="white" size={24} />
        </div>
        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>GreenWatch</span>
      </div>

      <div className="auth-container">
        
        {/* Hero Section */}
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-6)' }}>
          <div style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--primary-glow)', color: 'var(--primary-light)', fontSize: '0.875rem', fontWeight: 600 }}>
            <Globe size={16} /> <span>Join 10,000+ environmental guardians</span>
          </div>
          
          <h1 className="text-gradient" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 1.1 }}>
            Empowering Action For A Greener Future.
          </h1>
          
          <p style={{ fontSize: '1.125rem', color: 'var(--text-muted)', maxWidth: '600px', lineHeight: 1.6 }}>
            The premier platform for reporting environmental violations, tracking remediation, and building sustainable communities.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--s-6)', marginTop: 'var(--s-2)' }}>
            <div className="card card-interactive flex-center" style={{ gap: 'var(--s-4)', justifyContent: 'flex-start', padding: '1.25rem', height: '100%' }}>
              <div style={{ color: 'var(--primary)', background: 'rgba(16,185,129,0.1)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}><CheckCircle size={24} /></div>
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>Instant Reports</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', margin: 0 }}>AI-verified tracking</p>
              </div>
            </div>
            <div className="card card-interactive flex-center" style={{ gap: 'var(--s-4)', justifyContent: 'flex-start', padding: '1.25rem', height: '100%' }}>
              <div style={{ color: 'var(--info)', background: 'rgba(14,165,233,0.1)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}><Zap size={24} /></div>
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>Smart Rewards</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', margin: 0 }}>Earn impact points</p>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Card */}
        <div className="card fade-in" style={{ padding: 'var(--s-8) var(--s-10)', background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-lg)' }}>
          {/* Custom Toggle Switch */}
          <div style={{ position: 'relative', display: 'flex', background: 'rgba(0,0,0,0.4)', padding: '0.35rem', borderRadius: 'var(--radius-md)', marginBottom: 'var(--s-8)' }}>
            <div style={{ 
              position: 'absolute', width: 'calc(50% - 0.35rem)', height: 'calc(100% - 0.7rem)', 
              background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', 
              borderRadius: 'var(--radius-sm)', 
              transition: 'var(--transition-bounce)', 
              left: role === 'citizen' ? '0.35rem' : 'calc(50%)',
              boxShadow: 'var(--shadow-md)',
              zIndex: 0 
            }}></div>
            <button 
              onClick={(e) => { e.preventDefault(); setRole('citizen'); setIsLogin(true); }}
              style={{ flex: 1, padding: '0.6rem', border: 'none', background: 'transparent', zIndex: 1, color: role === 'citizen' ? 'white' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', transition: 'color var(--transition-normal)' }}
              type="button"
            >
              Citizen
            </button>
            <button 
              onClick={(e) => { e.preventDefault(); setRole('admin'); setIsLogin(true); }}
              style={{ flex: 1, padding: '0.6rem', border: 'none', background: 'transparent', zIndex: 1, color: role === 'admin' ? 'white' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', transition: 'color var(--transition-normal)' }}
              type="button"
            >
              Admin
            </button>
          </div>

          <h2 style={{ marginBottom: '0.5rem', fontSize: '1.75rem' }}>{isLogin ? 'Sign In' : 'Register'}</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--s-8)', fontSize: '0.95rem' }}>
            {isLogin ? `Access the ${role} command center` : 'Start your sustainability journey'}
          </p>

          {error && (
            <div className="fade-in" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: 'var(--s-6)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ flex: 1 }}>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-5)' }}>
            {!isLogin && (
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                  <input type="text" className="form-control" style={{ paddingLeft: '2.75rem', height: '48px' }} required placeholder="Jane Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
              </div>
            )}
            
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input type="email" className="form-control" style={{ paddingLeft: '2.75rem', height: '48px' }} required placeholder="jane@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input type="password" className="form-control" style={{ paddingLeft: '2.75rem', height: '48px' }} required placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 'var(--s-2)', height: '52px', fontSize: '1rem' }} disabled={loading}>
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')} <ArrowRight size={18} />
            </button>
          </form>

          {role === 'citizen' && (
            <div style={{ textAlign: 'center', marginTop: 'var(--s-6)' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {isLogin ? "New to GreenWatch? " : "Already have an account? "}
                <span style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', transition: 'color var(--transition-fast)' }} onClick={() => setIsLogin(!isLogin)} className="text-hover">
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
