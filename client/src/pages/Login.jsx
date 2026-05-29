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
    borderColor: fieldErrors[field] ? '#F87171' : '#E2E8F0',
    boxShadow:   fieldErrors[field] ? '0 0 0 3px rgba(248,113,113,0.15)' : undefined,
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      {/* Top Navigation Bar */}
      <header style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'center' }}>
        <BrandLogo size="lg" />
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          {/* Card */}
          <div style={{ background: '#fff', borderRadius: '1.25rem', padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.02)', border: '1px solid #F1F5F9' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
                Welcome back
              </h1>
              <p style={{ fontSize: '0.95rem', color: '#64748B', margin: 0 }}>
                Sign in with your university email
              </p>
            </div>

            {/* Global error */}
            {displayError && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', borderRadius: '0.75rem', padding: '1rem', marginBottom: '1.5rem', fontSize: '0.875rem', lineHeight: 1.5 }}>
                <AlertCircle style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2 }} />
                <span>{displayError}</span>
              </div>
            )}

            {/* Google login */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setGlobalError('Google sign-in was cancelled or failed. Please try again.')}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              <div style={{ flex: 1, height: '1px', background: '#F1F5F9' }} />
              <span style={{ margin: '0 1rem' }}>or continue with email</span>
              <div style={{ flex: 1, height: '1px', background: '#F1F5F9' }} />
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} noValidate>

              {/* Email */}
              <div>
                <label htmlFor="login-email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                  University Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: fieldErrors.email ? '#F87171' : '#94A3B8', pointerEvents: 'none' }} />
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    placeholder="you@college.ac.in"
                    className="stripe-input"
                    style={{ ...inputStyle('email'), paddingLeft: '2.75rem', background: '#FAFBFF' }}
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="email"
                    autoFocus
                  />
                </div>
                {fieldErrors.email
                  ? <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: 4, color: '#DC2626', fontWeight: 500 }}>
                      <AlertCircle style={{ width: 12, height: 12, flexShrink: 0 }} /> {fieldErrors.email}
                    </p>
                  : <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: '#94A3B8' }}>Must end in .edu or .ac.in</p>
                }
              </div>

              {/* Password */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label htmlFor="login-password" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>Password</label>
                  <Link to="/forgot-password" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#635BFF', textDecoration: 'none' }}
                    onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: fieldErrors.password ? '#F87171' : '#94A3B8', pointerEvents: 'none' }} />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••"
                    className="stripe-input"
                    style={{ ...inputStyle('password'), paddingLeft: '2.75rem', paddingRight: '2.75rem', background: '#FAFBFF' }}
                    value={form.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(s => !s)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {showPassword ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: 4, color: '#DC2626', fontWeight: 500 }}>
                    <AlertCircle style={{ width: 12, height: 12, flexShrink: 0 }} /> {fieldErrors.password}
                  </p>
                )}
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  background: '#635BFF', color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                  padding: '0.875rem', borderRadius: '0.5rem', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1, transition: 'all 0.2s', marginTop: '0.5rem',
                  boxShadow: '0 4px 12px rgba(99,91,255,0.25)'
                }}
                onMouseEnter={e => { if(!loading) e.currentTarget.style.background = '#4F3EFF'; }}
                onMouseLeave={e => { if(!loading) e.currentTarget.style.background = '#635BFF'; }}
              >
                {loading
                  ? <><Loader style={{ width: 18, height: 18 }} className="animate-spin" /> Signing in…</>
                  : <>Sign in <ChevronRight style={{ width: 18, height: 18 }} /></>}
              </button>
            </form>
          </div>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p style={{ fontSize: '0.9rem', color: '#64748B', margin: 0 }}>
              Don't have an account?{' '}
              <Link to="/signup" id="login-to-signup" style={{ fontWeight: 700, color: '#635BFF', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
              >
                Create one free
              </Link>
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
