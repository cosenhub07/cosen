import { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, XCircle, CheckCircle, Eye, ZoomIn, X,
  Calendar, GraduationCap, Mail, ChevronDown, AlertTriangle, Loader
} from 'lucide-react';
import adminApi from '../../lib/adminApi';

// ── ID Card Inspection Modal ───────────────────────────────────
function InspectionModal({ user, onClose, onResolve }) {
  const [verdict, setVerdict] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [imgZoom, setImgZoom] = useState(false);
  const [error, setError] = useState('');

  const handleResolve = async () => {
    if (verdict === 'rejected' && !reason.trim()) {
      setError('Please provide a rejection reason so the student knows how to fix their submission.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await adminApi.resolveVerification(user.id, verdict, reason);
      onResolve(user.id, verdict);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit verdict');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden"
        style={{ background: '#0D1426', border: '1px solid rgba(99,91,255,0.25)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,91,255,0.2)' }}>
              <Eye className="w-4 h-4" style={{ color: '#A5A1FF' }} />
            </div>
            <div>
              <h2 className="text-white font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>Student ID Review</h2>
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Inspect and verify student identity</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Student info */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-purple-500/20 shrink-0">
              {user.avatar_url
                ? <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl"
                    style={{ background: 'linear-gradient(135deg, #635BFF, #00D4AA)' }}>{user.name?.[0]}</div>
              }
            </div>
            <div className="flex-1 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-[10px] font-medium mb-0.5 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>Name</p>
                <p className="text-white font-semibold">{user.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium mb-0.5 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>Email</p>
                <p className="font-medium truncate" style={{ color: '#A5A1FF' }}>{user.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium mb-0.5 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>Department</p>
                <p className="text-white/70">{user.department || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium mb-0.5 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>Year</p>
                <p className="text-white/70">{user.year_of_study || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium mb-0.5 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>Date of Birth</p>
                <p className="text-white/70">{user.dob ? new Date(user.dob).toLocaleDateString('en-IN') : '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium mb-0.5 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>Joined</p>
                <p className="text-white/70">{new Date(user.created_at).toLocaleDateString('en-IN')}</p>
              </div>
            </div>
          </div>

          {/* ID Card display */}
          <div>
            <p className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Student ID Card</p>
            {user.id_card_image_url ? (
              <div className="relative group cursor-pointer rounded-xl overflow-hidden" style={{ border: '1px solid rgba(99,91,255,0.2)' }}
                onClick={() => setImgZoom(true)}>
                <img src={user.id_card_image_url} alt="Student ID" className="w-full max-h-52 object-contain"
                  style={{ background: '#060D1A' }} />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(0,0,0,0.5)' }}>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                    style={{ background: 'rgba(99,91,255,0.8)' }}>
                    <ZoomIn className="w-4 h-4" /> Click to zoom
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 rounded-xl text-sm"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }}>
                No ID card uploaded
              </div>
            )}
          </div>

          {/* Verdict selection */}
          <div>
            <p className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Verdict</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setVerdict('approved')}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: verdict === 'approved' ? 'rgba(0,212,170,0.2)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${verdict === 'approved' ? 'rgba(0,212,170,0.5)' : 'rgba(255,255,255,0.08)'}`,
                  color: verdict === 'approved' ? '#00D4AA' : 'rgba(255,255,255,0.5)',
                }}>
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
              <button onClick={() => setVerdict('rejected')}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: verdict === 'rejected' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${verdict === 'rejected' ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  color: verdict === 'rejected' ? '#F87171' : 'rgba(255,255,255,0.5)',
                }}>
                <XCircle className="w-4 h-4" /> Reject
              </button>
            </div>

            {verdict === 'rejected' && (
              <div className="mt-3">
                <textarea
                  rows={2}
                  placeholder="Explain why the ID was rejected so the student can fix it..."
                  value={reason}
                  onChange={e => { setReason(e.target.value); setError(''); }}
                  className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: '#fff',
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                  }}
                />
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm px-4 py-3 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#F87171' }}>
              <AlertTriangle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
            Cancel
          </button>
          <button
            onClick={handleResolve}
            disabled={!verdict || submitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: verdict === 'approved' ? 'linear-gradient(135deg, #00D4AA, #00B890)' : verdict === 'rejected' ? 'linear-gradient(135deg, #EF4444, #DC2626)' : 'rgba(99,91,255,0.3)',
              color: verdict ? '#fff' : 'rgba(255,255,255,0.4)',
            }}>
            {submitting ? <Loader className="w-4 h-4 animate-spin" /> : verdict === 'approved' ? <><CheckCircle className="w-4 h-4" /> Approve Student</> : verdict === 'rejected' ? <><XCircle className="w-4 h-4" /> Send Rejection</> : 'Select a Verdict'}
          </button>
        </div>
      </div>

      {/* Full-screen zoom overlay */}
      {imgZoom && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.95)' }}
          onClick={() => setImgZoom(false)}>
          <img src={user.id_card_image_url} alt="ID Card" className="max-w-full max-h-full rounded-xl object-contain" />
          <button className="absolute top-4 right-4 text-white/60 hover:text-white" onClick={() => setImgZoom(false)}>
            <X className="w-7 h-7" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────
export default function AdminVerifications() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [selected, setSelected] = useState(null);

  const load = useCallback(async (status) => {
    setLoading(true);
    try {
      const res = await adminApi.getVerifications(status);
      setUsers(res.data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(filterStatus); }, [filterStatus, load]);

  const handleResolve = (userId, verdict) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };

  const STATUS_TABS = [
    { value: 'pending', label: 'Pending', color: '#FF9F43' },
    { value: 'approved', label: 'Approved', color: '#00D4AA' },
    { value: 'rejected', label: 'Rejected', color: '#EF4444' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Student Verifications</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Review and approve student ID cards to grant marketplace access</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2">
        {STATUS_TABS.map(tab => (
          <button key={tab.value} onClick={() => setFilterStatus(tab.value)}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
            style={{
              background: filterStatus === tab.value ? `${tab.color}20` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${filterStatus === tab.value ? `${tab.color}50` : 'rgba(255,255,255,0.08)'}`,
              color: filterStatus === tab.value ? tab.color : 'rgba(255,255,255,0.4)',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#635BFF', borderTopColor: 'transparent' }} />
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <ShieldCheck className="w-12 h-12 mb-3" style={{ color: 'rgba(255,255,255,0.15)' }} />
          <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>No {filterStatus} verifications</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {users.map(u => (
            <div key={u.id} className="rounded-2xl p-4 flex flex-col gap-4 transition-all hover:scale-[1.01] cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              onClick={() => setSelected(u)}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-purple-500/20 shrink-0">
                  {u.avatar_url
                    ? <img src={u.avatar_url} alt={u.name} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-white font-bold"
                        style={{ background: 'linear-gradient(135deg, #635BFF, #00D4AA)' }}>{u.name?.[0]}</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{u.name}</p>
                  <p className="text-[11px] truncate" style={{ color: '#A5A1FF' }}>{u.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <GraduationCap className="w-3 h-3 shrink-0" />
                  <span className="truncate">{u.department || 'No dept'}</span>
                </div>
                <div className="flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <Calendar className="w-3 h-3 shrink-0" />
                  <span>{u.year_of_study || '—'}</span>
                </div>
              </div>

              {u.id_card_image_url ? (
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  <img src={u.id_card_image_url} alt="ID" className="w-full h-24 object-cover" />
                </div>
              ) : (
                <div className="flex items-center justify-center h-12 rounded-xl text-xs"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.25)' }}>
                  No ID card
                </div>
              )}

              <button className="w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: 'rgba(99,91,255,0.2)', border: '1px solid rgba(99,91,255,0.3)', color: '#A5A1FF' }}>
                <Eye className="w-3.5 h-3.5" /> Review ID
              </button>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <InspectionModal user={selected} onClose={() => setSelected(null)} onResolve={handleResolve} />
      )}
    </div>
  );
}
