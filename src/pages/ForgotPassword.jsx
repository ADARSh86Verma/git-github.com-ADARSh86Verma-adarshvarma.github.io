import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, verifyOTP, resetPassword } from '../api';
import { Mail, Key, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await forgotPassword({ email });
      if (res.data.otp_demo) setDemoOtp(res.data.otp_demo); // remove in prod
      setStep(2);
      toast.success('OTP sent to your email');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await verifyOTP({ email, otp });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPass !== confirmPass) { setError('Passwords do not match'); return; }
    if (newPass.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true); setError('');
    try {
      await resetPassword({ email, otp, new_password: newPass });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">🔐</div>
          <h1>Reset Password</h1>
          <p>Step {step} of 3</p>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {[1,2,3].map(s => (
            <div key={s} style={{
              flex: 1, height: 4, borderRadius: 99,
              background: s <= step ? 'var(--accent-primary)' : 'var(--bg-elevated)',
              transition: 'background 0.3s'
            }} />
          ))}
        </div>

        {error && <div className="alert alert--error">⚠️ {error}</div>}

        {step === 1 && (
          <form onSubmit={handleSendOTP}>
            <h2>Enter your email</h2>
            <p className="subtitle">We'll send a 6-digit OTP to reset your password</p>
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrap">
                <Mail className="input-icon" size={16} />
                <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <h2>Enter OTP</h2>
            <p className="subtitle">Check your email for the 6-digit code</p>
            {demoOtp && (
              <div className="alert alert--info">
                🔑 Demo OTP: <strong style={{ fontFamily: 'var(--font-mono)' }}>{demoOtp}</strong>
              </div>
            )}
            <div className="form-group">
              <label>6-Digit OTP</label>
              <div className="input-wrap">
                <Key className="input-icon" size={16} />
                <input type="text" placeholder="000000" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} required style={{ fontFamily: 'var(--font-mono)', letterSpacing: 8, fontSize: 20, textAlign: 'center' }} />
              </div>
            </div>
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleReset}>
            <h2>New Password</h2>
            <p className="subtitle">Choose a strong password (min 8 characters)</p>
            <div className="form-group">
              <label>New Password</label>
              <div className="input-wrap">
                <Lock className="input-icon" size={16} />
                <input type="password" placeholder="New password" value={newPass} onChange={e => setNewPass(e.target.value)} required minLength={8} />
              </div>
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <div className="input-wrap">
                <Lock className="input-icon" size={16} />
                <input type="password" placeholder="Confirm password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} required />
              </div>
            </div>
            <button type="submit" className="btn btn--primary" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link to="/login" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontSize: 14 }}>← Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
