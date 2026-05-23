import { useState, useEffect, useCallback } from 'react';
import {
  Search, Users, ShieldOff, Shield, ChevronLeft, ChevronRight,
  Star, Crown, AlertTriangle, CheckCircle, XCircle
} from 'lucide-react';
import adminApi from '../../lib/adminApi';

const ROLE_BADGE = {
  admin: { color: '#635BFF', bg: 'rgba(99,91,255,0.2)', label: 'Admin' },
  student: { color: 'rgba(255,255,255,0.5)', bg: 'rgba(255,255,255,0.07)', label: 'Student' },
  seller: { color: '#00D4AA', bg: 'rgba(0,212,170,0.12)', label: 'Seller' },
  buyer: { color: '#4FC3F7', bg: 'rgba(79,195,247,0.12)', label: 'Buyer' },
  both: { color: '#FF9F43', bg: 'rgba(255,159,67,0.12)', label: 'Buyer+Seller' },
};

const STATUS_BADGE = {
  approved: { color: '#00D4AA', bg: 'rgba(0,212,170,0.12)', label: 'Verified', Icon: CheckCircle },
  pending: { color: '#FF9F43', bg: 'rgba(255,159,67,0.12)', label: 'Pending', Icon: AlertTriangle },
  rejected: { color: '#EF4444', bg: 'rgba(239,68,68,0.12)', label: 'Rejected', Icon: XCircle },
  unsubmitted: { color: 'rgba(255,255,255,0.3)', bg: 'rgba(255,255,255,0.05)', label: 'No ID', Icon: Shield },
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState('');
  const [confirmPromote, setConfirmPromote] = useState(null);
  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({ search, role: roleFilter, id_card_status: statusFilter, page, limit: LIMIT });
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, roleFilter, statusFilter, page]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { load(); }, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const handleSuspend = async (userId) => {
    setActionLoading(userId);
    try {
      const res = await adminApi.suspendUser(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_suspended: res.data.suspended } : u));
    } catch (err) { alert(err.response?.data?.message || 'Failed to update suspension'); }
    finally { setActionLoading(''); }
  };

  const handlePromote = async (userId, role) => {
    setActionLoading(userId + role);
    try {
      await adminApi.updateUserRole(userId, role);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
      setConfirmPromote(null);
    } catch (err) { alert(err.response?.data?.message || 'Failed to update role'); }
    finally { setActionLoading(''); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>User Directory</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{total.toLocaleString('en-IN')} total students</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
          <input
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          />
        </div>
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: roleFilter ? '#fff' : 'rgba(255,255,255,0.4)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="seller">Seller</option>
          <option value="buyer">Buyer</option>
          <option value="both">Buyer+Seller</option>
          <option value="admin">Admin</option>
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: statusFilter ? '#fff' : 'rgba(255,255,255,0.4)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          <option value="">All Statuses</option>
          <option value="pending">Pending Review</option>
          <option value="approved">Verified</option>
          <option value="rejected">Rejected</option>
          <option value="unsubmitted">No ID</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Student', 'Role', 'ID Status', 'Rating', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: 'rgba(255,255,255,0.35)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.06)', width: j === 0 ? '60%' : '40%' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : users.map(user => {
                    const roleBadge = ROLE_BADGE[user.role] || ROLE_BADGE.student;
                    const statusBadge = STATUS_BADGE[user.id_card_status] || STATUS_BADGE.unsubmitted;
                    const StatusIcon = statusBadge.Icon;
                    return (
                      <tr key={user.id} className="transition-colors hover:bg-white/[0.02]"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', opacity: user.is_suspended ? 0.6 : 1 }}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-white/10 shrink-0">
                              {user.avatar_url
                                ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
                                    style={{ background: 'linear-gradient(135deg,#635BFF,#00D4AA)' }}>{user.name?.[0]}</div>
                              }
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-white font-semibold text-xs truncate max-w-[120px]">{user.name}</p>
                                {user.is_suspended && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                  style={{ background: 'rgba(239,68,68,0.2)', color: '#F87171' }}>Suspended</span>}
                              </div>
                              <p className="text-[11px] truncate max-w-[140px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded-lg text-[11px] font-bold"
                            style={{ background: roleBadge.bg, color: roleBadge.color }}>{roleBadge.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1.5 text-[11px] font-semibold w-fit px-2 py-1 rounded-lg"
                            style={{ background: statusBadge.bg, color: statusBadge.color }}>
                            <StatusIcon className="w-3 h-3" />{statusBadge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {Number(user.rating || 0).toFixed(1)}
                            <span className="text-[10px]">({user.review_count})</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSuspend(user.id)}
                              disabled={actionLoading === user.id || user.role === 'admin'}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                              style={{
                                background: user.is_suspended ? 'rgba(0,212,170,0.15)' : 'rgba(239,68,68,0.15)',
                                border: `1px solid ${user.is_suspended ? 'rgba(0,212,170,0.3)' : 'rgba(239,68,68,0.3)'}`,
                                color: user.is_suspended ? '#00D4AA' : '#F87171',
                              }}>
                              {actionLoading === user.id
                                ? <span className="w-3 h-3 border border-t-transparent rounded-full animate-spin" />
                                : user.is_suspended ? <><Shield className="w-3 h-3" /> Restore</> : <><ShieldOff className="w-3 h-3" /> Suspend</>}
                            </button>
                            {user.role !== 'admin' && (
                              <button
                                onClick={() => setConfirmPromote(user)}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                                style={{ background: 'rgba(99,91,255,0.15)', border: '1px solid rgba(99,91,255,0.3)', color: '#A5A1FF' }}>
                                <Crown className="w-3 h-3" /> Promote
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
              }
              {!loading && users.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  No users found matching your filters
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 rounded-xl disabled:opacity-40 transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(99,91,255,0.2)', border: '1px solid rgba(99,91,255,0.3)', color: '#A5A1FF' }}>
              {page} / {totalPages}
            </span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-2 rounded-xl disabled:opacity-40 transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Promote confirm modal */}
      {confirmPromote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}>
          <div className="w-full max-w-sm rounded-2xl p-6 space-y-5"
            style={{ background: '#0D1426', border: '1px solid rgba(99,91,255,0.25)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(99,91,255,0.2)' }}>
                <Crown className="w-5 h-5" style={{ color: '#A5A1FF' }} />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Promote to Admin</h3>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {confirmPromote.name}
                </p>
              </div>
            </div>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              This will grant full admin access to this student. Are you sure?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmPromote(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                Cancel
              </button>
              <button onClick={() => handlePromote(confirmPromote.id, 'admin')}
                disabled={actionLoading === confirmPromote.id + 'admin'}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #635BFF, #A78BFA)', color: '#fff' }}>
                {actionLoading === confirmPromote.id + 'admin' ? 'Promoting...' : 'Promote to Admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
