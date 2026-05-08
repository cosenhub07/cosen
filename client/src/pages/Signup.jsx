import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight, CheckCircle, AlertCircle, Loader,
  User, BookOpen, GraduationCap, Code, Palette, PenTool,
  Database, Music, ArrowLeft,
} from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import useAuthStore from '../store/authStore';
import BrandLogo from '../components/BrandLogo';

const DEPARTMENTS = [
  'Computer Science', 'Information Technology', 'Electronics & Communication',
  'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering',
  'Business Administration', 'Commerce', 'Fine Arts', 'Mathematics',
  'Physics', 'Chemistry', 'Biology', 'Psychology', 'Law', 'Medicine',
  'Architecture', 'Other',
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'];

const ROLES = [
  { id: 'buyer',  label: 'I want to hire', desc: 'Find campus talent for projects & assignments', icon: User, color: '#00D4AA' },
  { id: 'seller', label: 'I want to earn',  desc: 'Offer my skills and services to classmates',    icon: GraduationCap, color: '#635BFF' },
  { id: 'both',   label: 'Both',            desc: 'Hire and offer services as needed',              icon: CheckCircle, color: '#FF9F43' },
];

const SKILL_OPTIONS = [
  { label: 'Coding & Dev',   icon: Code,     id: 'coding' },
  { label: 'Art & Design',   icon: Palette,  id: 'design' },
  { label: 'Writing & CV',   icon: PenTool,  id: 'writing' },
  { label: 'Study Help',     icon: BookOpen, id: 'study' },
  { label: 'Data & Research',icon: Database, id: 'data' },
  { label: 'Music & More',   icon: Music,    id: 'music' },
];

const STEPS = ['Account', 'Your Profile', 'Interests'];

export default function Signup() {
  const navigate = useNavigate();
  const { register, loading, error, clearError } = useAuthStore();

  const [step, setStep] = useState(1);

  /* ── Step 1 ── */
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  /* ── Step 2 ── */
  const [profile, setProfile] = useState({ department: '', yearOfStudy: '', bio: '' });

  /* ── Step 3 ── */
  const [role, setRole]     = useState('');
  const [skills, setSkills] = useState([]);

  const [localError, setLocalError] = useState('');
  const [success,    setSuccess]    = useState('');

  const handleChange = (e) => {
    clearError();
    setLocalError('');
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const toggleSkill = (id) =>
    setSkills(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  /* ── Step validation ── */
  const validateStep1 = () => {
    if (!form.name.trim())     return 'Full name is required.';
    if (!form.email.trim())    return 'Email is required.';
    if (form.password.length < 8) return 'Password must be at least 8 characters.';
    return '';
  };

  const nextStep = () => {
    const err = step === 1 ? validateStep1() : '';
    if (err) { setLocalError(err); return; }
    setLocalError('');
    setStep(s => s + 1);
  };

  /* ── Final submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      department:  profile.department,
      yearOfStudy: profile.yearOfStudy,
      bio:         profile.bio,
      role:        role || 'both',
      interests:   skills,
    };
    const result = await register(payload);
    if (result.success) {
      setSuccess(result.message || 'Account created! Redirecting…');
      setTimeout(() => navigate('/dashboard'), 1500);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const result = await useAuthStore.getState().loginWithGoogle(credentialResponse.credential);
    if (result.success) {
      setSuccess('Google signup successful! Redirecting…');
      setTimeout(() => navigate('/dashboard'), 1500);
    } else {
      setLocalError('Google signup failed. Please try email registration.');
    }
  };

  const displayError = localError || error;

  /* ────────────────────────────────────────────────────────── */
  return (
    <div className="auth-page">
      <div className="auth-grid" aria-hidden="true" />
      <div className="auth-nodes" aria-hidden="true" />
      <div className="auth-orb auth-orb-1" aria-hidden="true" />
      <div className="auth-orb auth-orb-2" aria-hidden="true" />
      <div className="auth-orb auth-orb-3" aria-hidden="true" />
      <div className="auth-top-line" aria-hidden="true" />

      {/* Brand */}
      <div className="auth-heading">
        <BrandLogo size="lg" />
        <h1 className="text-2xl font-bold mt-6 mb-1" style={{ color: '#fff' }}>
          Create your free account
        </h1>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Join your campus marketplace · Step {step} of {STEPS.length}
        </p>
      </div>

      {/* Step indicator */}
      <div className="relative z-10 flex justify-center gap-0 mb-6">
        {STEPS.map((label, i) => {
          const idx = i + 1;
          const done    = step > idx;
          const current = step === idx;
          return (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: done ? '#00D4AA' : current ? '#635BFF' : 'rgba(255,255,255,0.1)',
                    color: done || current ? '#fff' : 'rgba(255,255,255,0.4)',
                    boxShadow: current ? '0 0 0 3px rgba(99,91,255,0.35)' : 'none',
                  }}
                >
                  {done ? <CheckCircle className="h-4 w-4" /> : idx}
                </div>
                <span className="text-[10px] mt-1 font-semibold"
                  style={{ color: current ? '#fff' : 'rgba(255,255,255,0.4)' }}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-14 h-px mx-1 mb-4 transition-all"
                  style={{ background: done ? '#00D4AA' : 'rgba(255,255,255,0.15)' }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Card */}
      <div className="auth-card">
        {/* Success */}
        {success && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 rounded-lg px-4 py-3 mb-5 text-sm">
            <CheckCircle className="h-4 w-4 shrink-0" /> {success}
          </div>
        )}
        {/* Error */}
        {displayError && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-400/30 text-red-300 rounded-lg px-4 py-3 mb-5 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" /> {displayError}
          </div>
        )}

        {/* ══ STEP 1 — Account ══ */}
        {step === 1 && (
          <>
            <div className="flex justify-center mb-5">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setLocalError('Google Registration Failed')}
              />
            </div>
            <div className="flex items-center text-xs text-gray-400 mb-5 uppercase tracking-wider">
              <div className="flex-1 border-t border-gray-600" />
              <span className="mx-4">or sign up with email</span>
              <div className="flex-1 border-t border-gray-600" />
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Full Name</label>
                <input id="signup-name" type="text" name="name" placeholder="Ankit Rajput"
                  className="stripe-input" value={form.name} onChange={handleChange} autoFocus />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">University Email</label>
                <input id="signup-email" type="email" name="email" placeholder="ankit@university.ac.in"
                  className="stripe-input" value={form.email} onChange={handleChange} />
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Must be a .edu or .ac.in address</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Password</label>
                <input id="signup-password" type="password" name="password" placeholder="Min. 8 characters"
                  className="stripe-input" value={form.password} onChange={handleChange} />
              </div>
              <button id="signup-next" type="button" onClick={nextStep}
                className="btn-primary justify-center py-3 mt-1">
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Already have an account?{' '}
                <Link to="/login" id="signup-to-login" className="font-semibold hover:underline" style={{ color: '#A5A1FF' }}>Sign in</Link>
              </p>
            </div>
          </>
        )}

        {/* ══ STEP 2 — Your Profile ══ */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Help classmates know who they're working with. This builds trust and speeds up hirings.
            </p>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Department / Major</label>
              <select
                className="stripe-input"
                value={profile.department}
                onChange={e => setProfile(p => ({ ...p, department: e.target.value }))}
              >
                <option value="">Select your department…</option>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Year of Study</label>
              <div className="flex flex-wrap gap-2">
                {YEARS.map(y => (
                  <button key={y} type="button"
                    onClick={() => setProfile(p => ({ ...p, yearOfStudy: y }))}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                    style={{
                      borderColor: profile.yearOfStudy === y ? '#635BFF' : 'rgba(255,255,255,0.2)',
                      background:  profile.yearOfStudy === y ? '#635BFF' : 'transparent',
                      color:       profile.yearOfStudy === y ? '#fff' : 'rgba(255,255,255,0.6)',
                    }}
                  >{y}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Short Bio <span style={{ color: 'rgba(255,255,255,0.35)' }}>(optional)</span></label>
              <textarea
                rows={3}
                className="stripe-input resize-none"
                placeholder="e.g. CSE 3rd year, love solving DSA problems and building projects…"
                value={profile.bio}
                onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
              />
            </div>

            <div className="flex gap-3 mt-2">
              <button type="button" onClick={() => setStep(1)}
                className="btn-ghost flex-1 justify-center py-3 text-sm">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button type="button" onClick={nextStep}
                className="btn-primary flex-1 justify-center py-3">
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP 3 — Interests ══ */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
              How do you plan to use Cosen?
            </p>

            {/* Role picker */}
            <div className="grid grid-cols-1 gap-2">
              {ROLES.map(r => (
                <button key={r.id} type="button"
                  onClick={() => setRole(r.id)}
                  className="flex items-center gap-3 p-3 rounded-xl border text-left transition-all"
                  style={{
                    borderColor: role === r.id ? r.color : 'rgba(255,255,255,0.15)',
                    background:  role === r.id ? `${r.color}18` : 'transparent',
                  }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: role === r.id ? r.color : 'rgba(255,255,255,0.08)' }}>
                    <r.icon className="h-4 w-4" style={{ color: role === r.id ? '#fff' : 'rgba(255,255,255,0.5)' }} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: role === r.id ? '#fff' : 'rgba(255,255,255,0.8)' }}>{r.label}</div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{r.desc}</div>
                  </div>
                  {role === r.id && <CheckCircle className="h-4 w-4 ml-auto shrink-0" style={{ color: r.color }} />}
                </button>
              ))}
            </div>

            {/* Skills multi-select */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Skills you have / need{' '}
                <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>(pick any)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {SKILL_OPTIONS.map(s => {
                  const active = skills.includes(s.id);
                  return (
                    <button key={s.id} type="button" onClick={() => toggleSkill(s.id)}
                      className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-semibold transition-all"
                      style={{
                        borderColor: active ? '#635BFF' : 'rgba(255,255,255,0.15)',
                        background:  active ? 'rgba(99,91,255,0.18)' : 'rgba(255,255,255,0.04)',
                        color:       active ? '#A5A1FF' : 'rgba(255,255,255,0.5)',
                      }}
                    >
                      <s.icon className="h-5 w-5" style={{ color: active ? '#A5A1FF' : 'rgba(255,255,255,0.3)' }} />
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)}
                className="btn-ghost flex-1 justify-center py-3 text-sm">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button id="signup-submit" type="submit" disabled={loading}
                className="btn-primary flex-1 justify-center py-3 disabled:opacity-60">
                {loading
                  ? <><Loader className="h-4 w-4 animate-spin" /> Creating…</>
                  : <>Finish & Enter <ChevronRight className="h-4 w-4" /></>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
