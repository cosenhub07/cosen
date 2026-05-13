import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronRight, AlertCircle, Loader, Eye, EyeOff, Lock, TimerOff, CheckCircle } from 'lucide-react';
import useAuthStore from '../store/authStore';
import BrandLogo from '../components/BrandLogo';

const getStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: '' };
  let s = 0;
  if (pw.length >= 8)  s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 1) return { score: s, label: 'Weak',   color: '#EF4444' };
  if (s <= 3) return { score: s, label: 'Medium', color: '#F59E0B' };
  return               { score: s, label: 'Strong', color: '#10B981' };
};

export default function ResetPassword() {
  const { token } = useParams();
  const navigate  = useNavigate();
  const { resetPassword, loading, error, clearError } = useAuthStore();

  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw,          setShowPw]          = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [localError,      setLocalError]      = useState('');
  const [linkExpired,     setLinkExpired]     = useState(false);

  const strength = getStrength(password);

  const handleChange = (setter) => (e) => {
    setLocalError('');
    clearError();
    setter(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setLocalError('Please fill in both fields.');
      return;
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match. Please re-enter.');
      return;
    }

    const result = await resetPassword(token, password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      // Detect expired / invalid link
      const msg = result.message || '';
      if (msg.toLowerCase().includes('invalid') || msg.toLowerCase().includes('expired')) {
        setLinkExpired(true);
      } else {
        setLocalError(msg || 'Something went wrong. Please try again.');
      }
    }
  };

  const displayError = localError || (!linkExpired ? error : '');

  /* ── Expired Link Screen ── */
  if (linkExpired) {
    return (
      <div className="auth-page">
        <div className="auth-grid"  aria-hidden="true" />
        <div className="auth-nodes" aria-hidden="true" />
        <div className="auth-orb auth-orb-1" aria-hidden="true" />
        <div className="auth-orb auth-orb-2" aria-hidden="true" />
        <div className="auth-orb auth-orb-3" aria-hidden="true" />
        <div className="auth-top-line" aria-hidden="true" />

        <div className="auth-heading">
          <BrandLogo size="lg" />
        </div>

        <div className="auth-card text-center">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)' }}>
              <TimerOff className="h-7 w-7" style={{ color: '#F87171' }} />
            </div>
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#fff' }}>Link Expired</h2>
          <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.55)' }}>
            This password reset link has expired or has already been used.<br />
            Reset links are only valid for <strong style={{ color: '#F87171' }}>5 minutes</strong>.
          </p>
          <Link
            to="/forgot-password"
            className="btn-primary justify-center py-3 w-full"
          >
            Request a new reset link <ChevronRight className="h-4 w-4" />
          </Link>
          <p className="text-xs mt-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Or <Link to="/login" className="hover:underline" style={{ color: '#A5A1FF' }}>go back to Sign In</Link>
          </p>
        </div>
      </div>
    );
  }

  /* ── Normal Reset Form ── */
  return (
    <div className="auth-page">
      <div className="auth-grid"  aria-hidden="true" />
      <div className="auth-nodes" aria-hidden="true" />
      <div className="auth-orb auth-orb-1" aria-hidden="true" />
      <div className="auth-orb auth-orb-2" aria-hidden="true" />
      <div className="auth-orb auth-orb-3" aria-hidden="true" />
      <div className="auth-top-line" aria-hidden="true" />

      <div className="auth-heading">
        <BrandLogo size="lg" />
        <h1 className="text-2xl font-bold mt-6 mb-1" style={{ color: '#fff' }}>Set a new password</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Minimum 8 characters</p>
      </div>

      <div className="auth-card">
        {displayError && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-400/30 text-red-300 rounded-lg px-4 py-3 mb-5 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{displayError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>

          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold mb-1.5">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                style={{ color: 'rgba(255,255,255,0.3)' }} />
              <input
                id="reset-password"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                className="stripe-input pl-9 pr-10"
                value={password}
                onChange={handleChange(setPassword)}
                autoFocus
              />
              <button type="button" tabIndex={-1} onClick={() => setShowPw(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'rgba(255,255,255,0.4)' }}>
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Strength bar */}
            {password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="flex-1 h-1 rounded-full transition-all"
                      style={{ background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.1)' }} />
                  ))}
                </div>
                <p className="text-xs font-semibold" style={{ color: strength.color }}>{strength.label} password</p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                style={{ color: 'rgba(255,255,255,0.3)' }} />
              <input
                id="reset-confirm-password"
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                className="stripe-input pl-9 pr-10"
                style={{
                  borderColor: confirmPassword && confirmPassword !== password ? '#F87171' : undefined,
                  boxShadow: confirmPassword && confirmPassword !== password ? '0 0 0 3px rgba(248,113,113,0.15)' : undefined,
                }}
                value={confirmPassword}
                onChange={handleChange(setConfirmPassword)}
              />
              <button type="button" tabIndex={-1} onClick={() => setShowConfirm(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'rgba(255,255,255,0.4)' }}>
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword && confirmPassword !== password && (
              <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: '#F87171' }}>
                <AlertCircle className="h-3 w-3 shrink-0" /> Passwords do not match
              </p>
            )}
            {confirmPassword && confirmPassword === password && (
              <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: '#10B981' }}>
                <CheckCircle className="h-3 w-3 shrink-0" /> Passwords match
              </p>
            )}
          </div>

          <button
            id="reset-submit"
            type="submit"
            disabled={loading}
            className="btn-primary justify-center py-3 mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? <><Loader className="h-4 w-4 animate-spin" /> Resetting…</>
              : <>Reset password <ChevronRight className="h-4 w-4" /></>}
          </button>
        </form>

        <p className="text-xs text-center mt-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Remembered it?{' '}
          <Link to="/login" className="hover:underline" style={{ color: '#A5A1FF' }}>Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}
