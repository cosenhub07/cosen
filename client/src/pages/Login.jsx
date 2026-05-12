import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, AlertCircle, Loader, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import useAuthStore from '../store/authStore';
import BrandLogo from '../components/BrandLogo';

const EDU_REGEX = /^[^\s@]+@[^\s@]+\.(edu|ac\.in)$/i;

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuthStore();

  const [form, setForm]               = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [globalError, setGlobalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  /* ── Per-field validation ── */
  const validateField = (name, value) => {
    if (name === 'email') {
      if (!value.trim())            return 'Email is required.';
      if (!value.includes('@'))     return 'Enter a valid email address.';
      if (!EDU_REGEX.test(value))   return 'Must be a university email ending in .edu or .ac.in';
      return '';
    }
    if (name === 'password') {
      if (!value) return 'Password is required.';
      return '';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    clearError();
    setGlobalError('');
    setForm(f => ({ ...f, [name]: value }));
    // Clear field error while typing
    if (fieldErrors[name]) {
      setFieldErrors(f => ({ ...f, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setFieldErrors(f => ({ ...f, [name]: validateField(name, value) }));
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const emailErr    = validateField('email', form.email);
    const passwordErr = validateField('password', form.password);
    setFieldErrors({ email: emailErr, password: passwordErr });
    if (emailErr || passwordErr) return;

    const result = await login(form.email, form.password);
    if (result.success) {
      navigate('/browse');
    } else {
      // Make backend messages friendlier
      const raw = result.message || '';
      if (raw.toLowerCase().includes('invalid email or password')) {
        setGlobalError('Incorrect email or password. Please double-check and try again.');
      } else if (raw.toLowerCase().includes('server error')) {
        setGlobalError('Something went wrong on our end. Please try again in a moment.');
      } else {
        setGlobalError(raw || 'Sign-in failed. Please try again.');
      }
    }
  };

  /* ── Google ── */
  const handleGoogleSuccess = async (credentialResponse) => {
    setGlobalError('');
    const result = await useAuthStore.getState().loginWithGoogle(credentialResponse.credential);
    if (result.success) {
      navigate('/browse');
    } else {
      const raw = result.message || '';
      if (raw.toLowerCase().includes('university') || raw.toLowerCase().includes('ac.in')) {
        setGlobalError('Google sign-in failed: Only university emails (.edu / .ac.in) are allowed on Cosen.');
      } else {
        setGlobalError('Google sign-in failed. Please try again or use your email below.');
      }
    }
  };

  const displayError = globalError || error;

  /* ── Field style helper ── */
  const inputStyle = (field) => ({
    borderColor: fieldErrors[field] ? '#F87171' : undefined,
    boxShadow:   fieldErrors[field] ? '0 0 0 3px rgba(248,113,113,0.15)' : undefined,
  });

  return (
    <div className="auth-page">
      <div className="auth-grid"  aria-hidden="true" />
      <div className="auth-nodes" aria-hidden="true" />
      <div className="auth-orb auth-orb-1" aria-hidden="true" />
      <div className="auth-orb auth-orb-2" aria-hidden="true" />
      <div className="auth-orb auth-orb-3" aria-hidden="true" />
      <div className="auth-top-line" aria-hidden="true" />

      {/* Brand + heading */}
      <div className="auth-heading">
        <BrandLogo size="lg" />
        <h1 className="text-2xl font-bold mt-6 mb-1" style={{ color: '#fff' }}>Sign in to Cosen</h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>University email required (.edu / .ac.in)</p>
      </div>

      {/* Card */}
      <div className="auth-card">

        {/* Global error */}
        {displayError && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-400/30 text-red-300 rounded-lg px-4 py-3 mb-5 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{displayError}</span>
          </div>
        )}

        {/* Google login */}
        <div className="flex justify-center mb-5">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setGlobalError('Google sign-in was cancelled or failed. Please try again.')}
          />
        </div>

        <div className="flex items-center text-xs text-gray-400 mb-5 uppercase tracking-wider">
          <div className="flex-1 border-t border-gray-600" />
          <span className="mx-4">or continue with email</span>
          <div className="flex-1 border-t border-gray-600" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-1.5">University Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                style={{ color: fieldErrors.email ? '#F87171' : 'rgba(255,255,255,0.3)' }} />
              <input
                id="login-email"
                type="email"
                name="email"
                placeholder="you@college.ac.in"
                className="stripe-input pl-9"
                style={inputStyle('email')}
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="email"
                autoFocus
              />
            </div>
            {fieldErrors.email
              ? <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: '#F87171' }}>
                  <AlertCircle className="h-3 w-3 shrink-0" /> {fieldErrors.email}
                </p>
              : <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Must end in .edu or .ac.in</p>
            }
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-semibold">Password</label>
              <Link to="/forgot-password" className="text-xs hover:underline" style={{ color: '#A5A1FF' }}>
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                style={{ color: fieldErrors.password ? '#F87171' : 'rgba(255,255,255,0.3)' }} />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                className="stripe-input pl-9 pr-10"
                style={inputStyle('password')}
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="current-password"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: '#F87171' }}>
                <AlertCircle className="h-3 w-3 shrink-0" /> {fieldErrors.password}
              </p>
            )}
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className="btn-primary justify-center py-3 mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? <><Loader className="h-4 w-4 animate-spin" /> Signing in…</>
              : <>Sign in <ChevronRight className="h-4 w-4" /></>}
          </button>
        </form>

        <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Don't have an account?{' '}
            <Link to="/signup" id="login-to-signup" className="font-semibold hover:underline" style={{ color: '#A5A1FF' }}>
              Create one free
            </Link>
          </p>
        </div>
      </div>

      <p className="relative z-10 text-center text-xs mt-6 leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
        By signing in, you confirm you are a verified student at a participating university.
      </p>
    </div>
  );
}
