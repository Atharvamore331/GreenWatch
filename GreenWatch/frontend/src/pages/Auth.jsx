import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Shield, User, ArrowRight, CheckCircle, Globe, Zap } from 'lucide-react';
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
      <div style={{ position: 'absolute', top: '2rem', left: '3rem', display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 10 }}>
        <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Leaf color="white" size={24} />
        </div>
        <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'white' }}>GreenWatch</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 450px', minHeight: '100vh', padding: '0 5% 0 10%', alignItems: 'center', gap: '5rem' }}>
        {/* Left Side: Hero */}
        <div style={{ maxWidth: '700px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.5rem 1rem', borderRadius: '999px', border: '1px solid var(--primary-glow)', color: 'var(--primary-light)', marginBottom: '2rem', fontSize: '0.9rem', fontWeight: 600 }}>
            <Globe size={16} /> <span>Join 10,000+ citizens protecting our planet</span>
          </div>
          
          <h1 style={{ fontSize: '4.5rem', lineHeight: 1.1, fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
            Empowering <span style={{ background: 'linear-gradient(to right, var(--primary-light), var(--secondary-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Action</span> For A Greener Future.
          </h1>
          
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '600px' }}>
            The AI-powered platform for reporting environmental violations, tracking progress, and earning rewards for a sustainable world.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ color: 'var(--primary)' }}><CheckCircle size={24} /></div>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Instant Reporting</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Snap a photo and pin the location in seconds.</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ color: 'var(--secondary-light)' }}><Zap size={24} /></div>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>Dynamic Rewards</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Earn impact points for every resolved report.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Card */}
        <div className="card" style={{ padding: '3rem', width: '100%', maxWidth: '450px', background: 'rgba(30, 41, 59, 0.8)' }}>
          {/* Role Toggle */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', padding: '0.3rem', borderRadius: '1rem', marginBottom: '2.5rem', position: 'relative' }}>
            <div style={{ position: 'absolute', width: '50%', height: 'calc(100% - 0.6rem)', background: 'var(--primary)', borderRadius: '0.75rem', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', left: role === 'citizen' ? '0.3rem' : 'calc(50% - 0.3rem)', zIndex: 0 }}></div>
            <button 
              onClick={() => {setRole('citizen'); setIsLogin(true);}}
              style={{ flex: 1, padding: '0.75rem', border: 'none', background: 'transparent', color: role === 'citizen' ? 'white' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', zIndex: 1, position: 'relative', transition: 'color 0.3s' }}
            >
              Citizen
            </button>
            <button 
              onClick={() => {setRole('admin'); setIsLogin(true);}}
              style={{ flex: 1, padding: '0.75rem', border: 'none', background: 'transparent', color: role === 'admin' ? 'white' : 'var(--text-muted)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', zIndex: 1, position: 'relative', transition: 'color 0.3s' }}
            >
              Admin
            </button>
          </div>

          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 700 }}>{isLogin ? 'Sign In' : 'Join GreenWatch'}</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            {isLogin ? `Access your ${role} control panel` : 'Start making a difference today'}
          </p>

          {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', padding: '0.75rem', borderRadius: '0.75rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {!isLogin && (
              <div className="form-group">
                <label className="form-label" style={{ color: 'var(--text-muted)' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input type="text" className="form-control" style={{ paddingLeft: '2.75rem' }} required placeholder="Alex Rivera" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
              </div>
            )}
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--text-muted)' }}>Work Email</label>
              <input type="email" className="form-control" required placeholder="alex@greenwatch.org" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: 'var(--text-muted)' }}>Secure Password</label>
              <input type="password" className="form-control" required placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '1rem' }} disabled={loading}>
              {loading ? 'Authenticating...' : (isLogin ? 'Enter Workspace' : 'Create Account')} <ArrowRight size={18} />
            </button>
          </form>

          {role === 'citizen' && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                {isLogin ? "Don't have an account? " : "Already registered? "}
                <span style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }} onClick={() => setIsLogin(!isLogin)}>
                  {isLogin ? 'Sign Up' : 'Sign In'}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
