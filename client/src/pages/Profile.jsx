import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Camera, Edit3, Save, X, Star, MapPin, BookOpen,
  CheckCircle, AlertCircle, Phone, Shield, Loader,
  ChevronRight, LogIn, Plus, ExternalLink, User,
  Grid3X3, Award, MessageCircle, Settings, Heart,
  Calendar, Mail, Briefcase, GraduationCap, Sparkles,
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../lib/api';

const SKILL_SUGGESTIONS = [
  'React', 'Python', 'Node.js', 'Graphic Design', 'UI/UX',
  'Figma', 'Data Analysis', 'Machine Learning', 'Copywriting',
  'Video Editing', 'Photography', 'Mathematics', 'Physics',
  'JavaScript', 'Java', 'C++', 'Content Writing', 'SEO',
];

const initials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';

function AvatarPlaceholder({ name, size = 96 }) {
  return (
    <div className="flex items-center justify-center rounded-full font-bold text-white select-none"
      style={{ width: size, height: size, fontSize: size * 0.35,
        background: 'linear-gradient(135deg, #635BFF 0%, #00D4AA 100%)',
        boxShadow: '0 8px 24px rgba(99,91,255,0.35)' }}>
      {initials(name)}
    </div>
  );
}

function SkillChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
      style={{ background: 'rgba(99,91,255,0.08)', color: '#635BFF', border: '1px solid rgba(99,91,255,0.15)' }}>
      {label}
      {onRemove && <button type="button" onClick={onRemove} className="hover:opacity-70 ml-0.5">×</button>}
    </span>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════ */
export default function Profile() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const [profile,   setProfile]   = useState(null);
  const [services,  setServices]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [editing,   setEditing]   = useState(false);
  const [toast,     setToast]     = useState(null); // { type:'success'|'error', msg }
  const [skillInput,setSkillInput]= useState('');
  const [avatarPrev,setAvatarPrev]= useState(null);
  const [avatarFile,setAvatarFile]= useState(null);
  const [bannerPrev,setBannerPrev]= useState(null);
  const [bannerFile,setBannerFile]= useState(null);
  const [activeTab, setActiveTab] = useState('services');

  // Form state mirrors profile
  const [form, setForm] = useState({
    name: '', department: '', yearOfStudy: '', bio: '', phone: '', skills: [],
  });

  /* ── Load data ─────────────────────────────────────────── */
  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const [profRes, svcRes] = await Promise.all([
          api.get('/users/me'),
          api.get(`/services/user/${user._id}`),
        ]);
        const p = profRes.data.user;
        setProfile(p);
        setUser(p);
        setServices(svcRes.data.services || []);
        setForm({
          name:        p.name        || '',
          department:  p.department  || '',
          yearOfStudy: p.yearOfStudy || '',
          bio:         p.bio         || '',
          phone:       p.phone       || '',
          skills:      Array.isArray(p.skills) ? p.skills : [],
        });
      } catch {
        showToast('error', 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user?._id]);

  /* ── Toast helper ─────────────────────────────────────── */
  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── Avatar preview ───────────────────────────────────── */
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPrev(URL.createObjectURL(file));
    setEditing(true);
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPrev(URL.createObjectURL(file));
    setEditing(true);
  };

  /* ── Skill management ─────────────────────────────────── */
  const addSkill = (skill) => {
    const s = skill.trim();
    if (!s || form.skills.includes(s)) return;
    setForm(f => ({ ...f, skills: [...f.skills, s] }));
    setSkillInput('');
  };
  const removeSkill = (skill) =>
    setForm(f => ({ ...f, skills: f.skills.filter(s => s !== skill) }));

  /* ── Save ─────────────────────────────────────────────── */
  const handleSave = async () => {
    setSaving(true);
    try {
      let avatarUrl = profile?.avatar?.url;
      let bannerUrl = profile?.bannerUrl;

      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);
        try {
          const uploadRes = await api.post('/upload/image', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
          avatarUrl = uploadRes.data.url;
        } catch {
          showToast('error', 'Avatar upload failed. Other changes still saved.');
        }
      }

      if (bannerFile) {
        const formData = new FormData();
        formData.append('file', bannerFile);
        try {
          const uploadRes = await api.post('/upload/image', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
          bannerUrl = uploadRes.data.url;
        } catch {
          showToast('error', 'Banner upload failed.');
        }
      }

      const { data } = await api.put('/users/me', {
        name:        form.name,
        department:  form.department,
        yearOfStudy: form.yearOfStudy,
        bio:         form.bio,
        phone:       form.phone,
        skills:      form.skills,
        avatarUrl,
        bannerUrl,
      });

      setProfile(data.user);
      setUser(data.user);
      setEditing(false);
      setAvatarFile(null);
      setBannerFile(null);
      showToast('success', 'Profile saved successfully!');
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setAvatarFile(null);
    setAvatarPrev(null);
    setBannerFile(null);
    setBannerPrev(null);
    setForm({
      name:        profile?.name        || '',
      department:  profile?.department  || '',
      yearOfStudy: profile?.yearOfStudy || '',
      bio:         profile?.bio         || '',
      phone:       profile?.phone       || '',
      skills:      Array.isArray(profile?.skills) ? profile.skills : [],
    });
  };

  /* ── Guard: not logged in ─────────────────────────────── */
  if (!user) return (
    <div className="min-h-screen bg-stripe-bg flex items-center justify-center pt-16 px-4">
      <div className="stripe-card p-10 text-center max-w-sm w-full">
        <div className="w-14 h-14 rounded-2xl bg-stripe-purple/10 flex items-center justify-center mx-auto mb-5">
          <LogIn className="h-7 w-7 text-stripe-purple" />
        </div>
        <h2 className="font-display font-bold text-stripe-slate text-xl mb-2">Sign in to view your profile</h2>
        <p className="text-stripe-muted text-sm mb-6">Manage your info, skills, and listed services.</p>
        <Link to="/login" className="btn-primary justify-center w-full py-3">
          Sign in <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-stripe-bg flex items-center justify-center pt-16">
      <Loader className="h-6 w-6 text-stripe-purple animate-spin" />
    </div>
  );

  const displayAvatar = avatarPrev || profile?.avatar?.url;
  const totalReviews  = services.reduce((s, sv) => s + (sv.reviewCount || 0), 0);
  const avgRating     = profile?.rating?.toFixed(1) || '—';
  const memberSince   = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="min-h-screen pt-16 pb-16" style={{ background: '#F6F9FC' }}>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium
          ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {toast.type === 'success' ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* ══ COVER BANNER ══ */}
      <div className="relative w-full h-52 sm:h-64 group" style={{
        background: (bannerPrev || profile?.bannerUrl)
          ? `url(${bannerPrev || profile?.bannerUrl}) center/cover no-repeat`
          : 'linear-gradient(135deg, #0A2540 0%, #635BFF 50%, #00D4AA 100%)',
        backgroundSize: (bannerPrev || profile?.bannerUrl) ? 'cover' : '200% 200%',
        animation: (bannerPrev || profile?.bannerUrl) ? 'none' : 'gradient-shift 8s ease infinite',
      }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <button onClick={() => bannerInputRef.current?.click()}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-white/30 shadow-lg"
          title="Change banner"><Camera className="h-4 w-4" /></button>
        <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">

        {/* ══ PROFILE HEADER — Instagram Style ══ */}
        <div className="relative -mt-20 mb-6">
          <div className="bg-white rounded-2xl shadow-lg border p-6 sm:p-8" style={{ borderColor: '#E6EBF1' }}>
            <div className="flex flex-col sm:flex-row gap-6">

              {/* Avatar with gradient ring */}
              <div className="relative shrink-0 -mt-20 sm:-mt-16 self-center sm:self-start">
                <div className="p-1 rounded-full" style={{ background: 'linear-gradient(135deg, #635BFF, #00D4AA, #FF6B9D, #635BFF)', padding: '3px' }}>
                  <div className="rounded-full p-0.5 bg-white">
                    {displayAvatar
                      ? <img src={displayAvatar} alt={profile?.name} className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover" />
                      : <AvatarPlaceholder name={profile?.name} size={128} />}
                  </div>
                </div>
                <button onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-stripe-purple text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform border-2 border-white"
                  title="Change avatar"><Camera className="h-3.5 w-3.5" /></button>
                <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>

              {/* Info + Stats */}
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                  {editing
                    ? <input className="stripe-input text-xl font-bold py-2" value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" />
                    : <h1 className="text-2xl font-bold text-stripe-slate">{profile?.name}</h1>}
                  {profile?.isEmailVerified && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 self-center sm:self-auto">
                      <CheckCircle className="h-3 w-3" /> Verified Student
                    </span>
                  )}
                </div>

                {/* Instagram-style stats row */}
                <div className="flex justify-center sm:justify-start gap-6 sm:gap-8 mb-4">
                  {[
                    { val: services.length, lbl: 'services' },
                    { val: avgRating, lbl: 'rating' },
                    { val: totalReviews, lbl: 'reviews' },
                  ].map(s => (
                    <div key={s.lbl} className="text-center">
                      <div className="text-xl font-bold text-stripe-slate">{s.val}</div>
                      <div className="text-xs text-stripe-muted capitalize">{s.lbl}</div>
                    </div>
                  ))}
                </div>

                {/* Meta tags */}
                <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-xs text-stripe-muted mb-4">
                  {profile?.department && <span className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" /> {profile.department}</span>}
                  {profile?.yearOfStudy && <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {profile.yearOfStudy}</span>}
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Joined {memberSince}</span>
                  {profile?.email && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {profile.email}</span>}
                </div>

                {/* Bio */}
                {editing
                  ? <textarea rows={2} className="stripe-input resize-none text-sm w-full" placeholder="Write a short bio…" value={form.bio}
                      onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
                  : profile?.bio && <p className="text-sm text-stripe-steel leading-relaxed">{profile.bio}</p>}

                {/* Action Buttons */}
                <div className="flex justify-center sm:justify-start gap-3 mt-4">
                  {editing ? (<>
                    <button onClick={cancelEdit} className="btn-outline py-2 px-5 text-sm flex items-center gap-2"><X className="h-4 w-4" /> Cancel</button>
                    <button onClick={handleSave} disabled={saving} className="btn-primary py-2 px-5 text-sm flex items-center gap-2 disabled:opacity-60">
                      {saving ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </>) : (<>
                    <button onClick={() => setEditing(true)} className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2"><Edit3 className="h-4 w-4" /> Edit Profile</button>
                    <Link to="/messages" className="btn-outline py-2.5 px-5 text-sm flex items-center gap-2"><MessageCircle className="h-4 w-4" /> Messages</Link>
                    <Link to="/dashboard" className="btn-ghost py-2.5 px-4 text-sm flex items-center gap-2"><Settings className="h-4 w-4" /></Link>
                  </>)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ INSTAGRAM-STYLE TABS ══ */}
        <div className="bg-white rounded-2xl shadow-sm border mb-6" style={{ borderColor: '#E6EBF1' }}>
          <div className="flex border-b" style={{ borderColor: '#E6EBF1' }}>
            {[
              { id: 'services', label: 'Services', icon: Grid3X3 },
              { id: 'skills', label: 'Skills', icon: Sparkles },
              { id: 'about', label: 'About', icon: User },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'text-stripe-purple border-stripe-purple bg-purple-50/30'
                    : 'text-stripe-muted border-transparent hover:text-stripe-slate hover:bg-gray-50'}`}>
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {tab.id === 'services' && services.length > 0 && (
                  <span className="text-[10px] bg-stripe-purple text-white px-1.5 py-0.5 rounded-full">{services.length}</span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">

            {/* ── Services Tab (Ecommerce Grid) ── */}
            {activeTab === 'services' && (
              services.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-50 to-teal-50 flex items-center justify-center mx-auto mb-5 border border-stripe-border">
                    <Briefcase className="h-8 w-8 text-stripe-muted" />
                  </div>
                  <h3 className="font-bold text-stripe-slate text-lg mb-2">No services yet</h3>
                  <p className="text-stripe-muted text-sm mb-5 max-w-xs mx-auto">Start selling your skills to verified campus peers.</p>
                  <Link to="/services/new" className="btn-primary py-2.5 px-6"><Plus className="h-4 w-4" /> Post Your First Service</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {services.map(s => (
                    <Link key={s._id} to={`/services/${s._id}`}
                      className="group rounded-xl border overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all"
                      style={{ borderColor: '#E6EBF1' }}>
                      <div className="aspect-[4/3] bg-stripe-bg relative overflow-hidden">
                        {s.images?.[0]
                          ? <img src={s.images[0]} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          : <div className="w-full h-full flex items-center justify-center"><BookOpen className="h-10 w-10 text-stripe-muted opacity-40" /></div>}
                        <div className="absolute top-3 right-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md shadow ${s.isActive !== false ? 'bg-emerald-500/90 text-white' : 'bg-gray-500/80 text-white'}`}>
                            {s.isActive !== false ? 'Active' : 'Paused'}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-stripe-slate text-sm truncate mb-2 group-hover:text-stripe-purple transition-colors">{s.title}</h4>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-stripe-muted">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="font-medium">{s.rating?.toFixed(1) || '0.0'}</span>
                            <span>({s.reviewCount || 0})</span>
                          </div>
                          <span className="text-sm font-bold text-stripe-slate">₹{s.price?.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {/* Add new service card */}
                  <Link to="/services/new"
                    className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-8 hover:border-stripe-purple hover:bg-purple-50/30 transition-all group min-h-[200px]"
                    style={{ borderColor: '#E6EBF1' }}>
                    <div className="w-12 h-12 rounded-2xl bg-stripe-bg flex items-center justify-center mb-3 group-hover:bg-stripe-purple/10 transition-colors">
                      <Plus className="h-6 w-6 text-stripe-muted group-hover:text-stripe-purple transition-colors" />
                    </div>
                    <span className="text-sm font-semibold text-stripe-muted group-hover:text-stripe-purple transition-colors">Add New Service</span>
                  </Link>
                </div>
              )
            )}

            {/* ── Skills Tab ── */}
            {activeTab === 'skills' && (
              <div>
                <div className="flex flex-wrap gap-2.5 mb-5">
                  {form.skills.length === 0 && !editing && (
                    <div className="text-center py-10 w-full">
                      <Sparkles className="h-8 w-8 text-stripe-muted mx-auto mb-3 opacity-40" />
                      <p className="text-stripe-muted text-sm">No skills listed yet. Click Edit Profile to add your skills.</p>
                    </div>
                  )}
                  {form.skills.map(s => (
                    <SkillChip key={s} label={s} onRemove={editing ? () => removeSkill(s) : null} />
                  ))}
                </div>
                {editing && (<>
                  <div className="flex gap-2 mb-3">
                    <input className="stripe-input flex-1 py-2 text-sm" placeholder="Type a skill and press Enter…"
                      value={skillInput} onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }} />
                    <button type="button" onClick={() => addSkill(skillInput)} className="btn-primary px-4 py-2 text-sm"><Plus className="h-4 w-4" /></button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {SKILL_SUGGESTIONS.filter(s => !form.skills.includes(s)).slice(0, 12).map(s => (
                      <button key={s} type="button" onClick={() => addSkill(s)}
                        className="text-xs px-3 py-1.5 rounded-full border text-stripe-steel hover:border-stripe-purple hover:text-stripe-purple hover:bg-purple-50/50 transition-all"
                        style={{ borderColor: '#E6EBF1' }}>+ {s}</button>
                    ))}
                  </div>
                </>)}
              </div>
            )}

            {/* ── About Tab ── */}
            {activeTab === 'about' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bio */}
                <div className="rounded-xl border p-5" style={{ borderColor: '#E6EBF1' }}>
                  <h3 className="font-bold text-stripe-slate mb-3 flex items-center gap-2"><User className="h-4 w-4 text-stripe-purple" /> Bio</h3>
                  {editing
                    ? <textarea rows={4} className="stripe-input resize-none text-sm" placeholder="Tell buyers about yourself…" value={form.bio}
                        onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
                    : <p className="text-sm text-stripe-steel leading-relaxed">{profile?.bio || <span className="text-stripe-muted italic">No bio yet.</span>}</p>}
                </div>
                {/* Education */}
                <div className="rounded-xl border p-5" style={{ borderColor: '#E6EBF1' }}>
                  <h3 className="font-bold text-stripe-slate mb-3 flex items-center gap-2"><GraduationCap className="h-4 w-4 text-stripe-purple" /> Education</h3>
                  {editing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-stripe-muted uppercase tracking-wider mb-1.5">Department / Major</label>
                        <input className="stripe-input" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="e.g. Computer Science" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stripe-muted uppercase tracking-wider mb-1.5">Year of Study</label>
                        <select className="stripe-input cursor-pointer" value={form.yearOfStudy} onChange={e => setForm(f => ({ ...f, yearOfStudy: e.target.value }))}>
                          <option value="">Select year</option>
                          {['1st Year','2nd Year','3rd Year','4th Year','Postgraduate'].map(y => <option key={y}>{y}</option>)}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 text-sm">
                      {[
                        { icon: Briefcase, lbl: 'Department', val: profile?.department },
                        { icon: BookOpen, lbl: 'Year', val: profile?.yearOfStudy },
                        { icon: Mail, lbl: 'Email', val: profile?.email },
                      ].map(r => (
                        <div key={r.lbl} className="flex items-center gap-3">
                          <r.icon className="h-4 w-4 text-stripe-muted shrink-0" />
                          <span className="text-stripe-muted">{r.lbl}</span>
                          <span className="font-medium text-stripe-slate ml-auto truncate max-w-[180px]">{r.val || '—'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* WhatsApp */}
                <div className="rounded-xl border p-5 md:col-span-2" style={{ borderColor: '#E6EBF1' }}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-stripe-slate flex items-center gap-2"><Phone className="h-4 w-4 text-stripe-purple" /> WhatsApp</h3>
                    {profile?.isPhoneVerified && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                        <Shield className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </div>
                  {editing ? (
                    <div>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stripe-muted" />
                        <input type="tel" className="stripe-input pl-10" placeholder="+91 98765 43210" value={form.phone}
                          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                      </div>
                      <p className="text-xs text-stripe-muted mt-1.5">Both parties must add a phone for WhatsApp chat.</p>
                    </div>
                  ) : (
                    profile?.phone
                      ? <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-stripe-muted" /><span className="font-medium text-stripe-slate">{profile.phone}</span></div>
                      : <p className="text-stripe-muted text-sm">No phone added. Add your WhatsApp number to enable direct chat on orders.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap justify-center gap-4 text-sm text-stripe-muted">
          <Link to="/dashboard" className="hover:text-stripe-purple transition-colors">Dashboard</Link>
          <span>·</span>
          <Link to="/browse" className="hover:text-stripe-purple transition-colors">Browse Services</Link>
          <span>·</span>
          <button onClick={() => { useAuthStore.getState().logout(); navigate('/'); }}
            className="hover:text-red-500 transition-colors">Logout</button>
        </div>

      </div>
    </div>
  );
}
