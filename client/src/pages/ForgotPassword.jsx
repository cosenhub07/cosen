import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, AlertCircle, Loader, CheckCircle } from 'lucide-react';
import useAuthStore from '../store/authStore';
import BrandLogo from '../components/BrandLogo';

export default function ForgotPassword() {
  const { forgotPassword, loading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setLocalError('');
    clearError();
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setLocalError('Please enter your university email.');
      return;
    }
    const result = await forgotPassword(email);
    if (result.success) {
      setSuccess(true);
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
        <h1 className="text-2xl font-bold mt-6 mb-1" style={{ color: '#fff' }}>Reset your password</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Enter your email to receive a reset link</p>
      </div>

      <div className="auth-card">
        {displayError && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-400/30 text-red-300 rounded-lg px-4 py-3 mb-5 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {displayError}
          </div>
        )}

        {success ? (
          <div className="text-center py-4">
            <div className="flex justify-center mb-4 text-green-400">
              <CheckCircle className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Check your email</h3>
            <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
              If an account exists for {email}, you will receive a password reset link shortly.
            </p>
            <Link to="/login" className="btn-secondary justify-center py-3 w-full">
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-semibold mb-1.5">University Email</label>
              <input
                id="forgot-email"
                type="email"
                name="email"
                placeholder="student@university.edu"
                className="stripe-input"
                value={email}
                onChange={handleChange}
                autoFocus
              />
            </div>
            <button
              id="forgot-submit"
              type="submit"
              disabled={loading}
              className="btn-primary justify-center py-3 mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <><Loader className="h-4 w-4 animate-spin" /> Sending...</> : <>Send reset link <ChevronRight className="h-4 w-4" /></>}
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Remember your password?{' '}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: '#A5A1FF' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
