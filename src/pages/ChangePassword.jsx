import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

export default function ChangePassword() {
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, updateUser, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPass !== confirm) { setError('Passwords do not match'); return; }
    if (newPass.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true); setError('');

    try {
      await api.post('/api/changePassword.php', { current_password: current, new_password: newPass });
      toast.success('Password changed successfully!');
      updateUser({ must_change_password: false });
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">🔑</div>
          <h1>Greenwood Public School</h1>
          <p>You must change your password before continuing</p>
        </div>

        <div className="alert alert--info">
          This is your first login. Please set a new secure password.
        </div>

        {error && <div className="alert alert--error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Current Password</label>
            <div className="input-wrap">
              <Lock className="input-icon" size={16} />
              <input type="password" placeholder="Your default password" value={current} onChange={e => setCurrent(e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label>New Password</label>
            <div className="input-wrap">
              <Lock className="input-icon" size={16} />
              <input type="password" placeholder="At least 8 characters" value={newPass} onChange={e => setNewPass(e.target.value)} required minLength={8} />
            </div>
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <div className="input-wrap">
              <Lock className="input-icon" size={16} />
              <input type="password" placeholder="Repeat new password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
            </div>
          </div>
          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? 'Changing...' : 'Set New Password'}
          </button>
        </form>

        <button onClick={() => { signOut(); navigate('/login'); }} style={{ width: '100%', marginTop: 12, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13 }}>
          Logout instead
        </button>
      </div>
    </div>
  );
}
