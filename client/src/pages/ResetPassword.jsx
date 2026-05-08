import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, AlertCircle, Loader } from 'lucide-react';
import useAuthStore from '../store/authStore';
import BrandLogo from '../components/BrandLogo';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { resetPassword, loading, error, clearError } = useAuthStore();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleChange = (setter) => (e) => {
    setLocalError('');
    clearError();
    setter(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setLocalError('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    const result = await resetPassword(token, password);
    if (result.success) {
      // Upon success, the user is logged in automatically by the backend payload
      navigate('/dashboard');
    }
  };

  const displayError = localError || error;

  return (
    <div className="auth-page">
      {/* Animated grid layer */}
      <div className="auth-grid" aria-hidden="true" />
      <div className="auth-nodes" aria-hidden="true" />
      <div className="auth-orb auth-orb-1" aria-hidden="true" />
      <div className="auth-orb auth-orb-2" aria-hidden="true" />
      <div className="auth-orb auth-orb-3" aria-hidden="true" />
      <div className="auth-top-line" aria-hidden="true" />

      <div className="auth-heading">
        <BrandLogo size="lg" />
        <h1 className="text-2xl font-bold mt-6 mb-1" style={{ color: '#fff' }}>Set a new password</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Must be at least 8 characters</p>
      </div>

      <div className="auth-card">
        {displayError && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-400/30 text-red-300 rounded-lg px-4 py-3 mb-5 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-semibold mb-1.5">New Password</label>
            <input
              id="reset-password"
              type="password"
              placeholder="••••••••"
              className="stripe-input"
              value={password}
              onChange={handleChange(setPassword)}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Confirm Password</label>
            <input
              id="reset-confirm-password"
              type="password"
              placeholder="••••••••"
              className="stripe-input"
              value={confirmPassword}
              onChange={handleChange(setConfirmPassword)}
            />
          </div>
          <button
            id="reset-submit"
            type="submit"
            disabled={loading}
            className="btn-primary justify-center py-3 mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <><Loader className="h-4 w-4 animate-spin" /> Resetting...</> : <>Reset password <ChevronRight className="h-4 w-4" /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
