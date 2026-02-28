import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');
    setLoading(true);
    try {
      const user = await signIn(email, password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.must_change_password) {
        navigate('/change-password');
      } else {
        navigate(`/${user.role}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">🎓</div>
          <h1>Greenwood Public School</h1>
          <p>QR Attendance Management System</p>
        </div>

        <h2>Welcome back</h2>
        <p className="subtitle">Sign in to your account to continue</p>

        {error && (
          <div className="alert alert--error">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} method="post">
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrap">
              <Mail className="input-icon" size={16} />
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrap" style={{ position: 'relative' }}>
              <Lock className="input-icon" size={16} />
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center',
                }}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginTop: -12, marginBottom: 24 }}>
            <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--accent-primary)', textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn--primary"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? '⏳ Signing in...' : '→  Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 28, padding: 16, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)' }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Demo Credentials</p>
          <div style={{ display: 'grid', gap: 6 }}>
            {[
              { role: 'Admin', email: 'admin@school.com', pass: 'Admin@123' },
            ].map(c => (
              <button
                key={c.role}
                type="button"
                style={{ background: 'none', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '6px 12px', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer', textAlign: 'left' }}
                onClick={() => { setEmail(c.email); setPassword(c.pass); }}
              >
                <strong style={{ color: 'var(--accent-primary)' }}>{c.role}</strong>: {c.email} / {c.pass}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
