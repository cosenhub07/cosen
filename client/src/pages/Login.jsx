import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, AlertCircle, Loader } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import useAuthStore from '../store/authStore';
import BrandLogo from '../components/BrandLogo';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    setLocalError('');
    clearError();
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setLocalError('Please enter your email and password.');
      return;
    }
    const result = await login(form.email, form.password);
    if (result.success) {
      navigate('/browse');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const result = await useAuthStore.getState().loginWithGoogle(credentialResponse.credential);
    if (result.success) {
      navigate('/browse');
    }
  };

  const displayError = localError || error;

  return (
    <div className="auth-page">
      {/* Animated grid layer */}
      <div className="auth-grid" aria-hidden="true" />
      {/* Grid intersection dots */}
      <div className="auth-nodes" aria-hidden="true" />
      {/* Glowing orbs */}
      <div className="auth-orb auth-orb-1" aria-hidden="true" />
      <div className="auth-orb auth-orb-2" aria-hidden="true" />
      <div className="auth-orb auth-orb-3" aria-hidden="true" />
      {/* Shimmer top line */}
      <div className="auth-top-line" aria-hidden="true" />

      {/* Brand + heading */}
      <div className="auth-heading">
        <BrandLogo size="lg" />
        <h1 className="text-2xl font-bold mt-6 mb-1" style={{ color: '#fff' }}>Sign in to your account</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>University email required</p>
      </div>

      {/* Glassmorphism card */}
      <div className="auth-card">
        {/* Error banner */}
        {displayError && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-400/30 text-red-300 rounded-lg px-4 py-3 mb-5 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {displayError}
          </div>
        )}

        <div className="flex justify-center mb-5">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setLocalError('Google Login Failed')}
          />
        </div>

        <div className="flex items-center text-xs text-gray-400 mb-5 uppercase tracking-wider">
          <div className="flex-1 border-t border-gray-600"></div>
          <span className="mx-4">or continue with email</span>
          <div className="flex-1 border-t border-gray-600"></div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-semibold mb-1.5">University Email</label>
            <input
              id="login-email"
              type="email"
              name="email"
              placeholder="student@university.edu"
              className="stripe-input"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              autoFocus
            />
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Must end in .edu or .ac.in</p>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-semibold">Password</label>
              <Link to="/forgot-password" className="text-xs hover:underline" style={{ color: '#A5A1FF' }}>Forgot password?</Link>
            </div>
            <input
              id="login-password"
              type="password"
              name="password"
              placeholder="••••••••"
              className="stripe-input"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>
          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="btn-primary justify-center py-3 mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? <><Loader className="h-4 w-4 animate-spin" /> Signing in...</> : <>Sign in <ChevronRight className="h-4 w-4" /></>}
          </button>
        </form>

        <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Don't have an account?{' '}
            <Link to="/signup" id="login-to-signup" className="font-semibold hover:underline" style={{ color: '#A5A1FF' }}>Create one free</Link>
          </p>
        </div>
      </div>

      <p className="relative z-10 text-center text-xs mt-6 leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
        By signing in, you confirm you are a verified student at a participating university.
      </p>
    </div>
  );
}
