import { useState, useEffect, useCallback } from 'react';
import {
  Search, Package, ChevronLeft, ChevronRight, Star,
  Eye, EyeOff, ExternalLink
} from 'lucide-react';
import adminApi from '../../lib/adminApi';

const CATEGORY_COLORS = {
  Design: '#635BFF',
  Development: '#00D4AA',
  Writing: '#FF9F43',
  Music: '#FF6B9D',
  Video: '#4FC3F7',
  Photography: '#A855F7',
  Teaching: '#34D399',
  Playground: '#F59E0B',
  Other: '#6B7280',
};

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState('');
  const LIMIT = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: LIMIT };
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (statusFilter !== '') params.is_active = statusFilter;
      const res = await adminApi.getServices(params);
      setServices(res.data.services);
      setTotal(res.data.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search, categoryFilter, statusFilter, page]);

  useEffect(() => {
    const t = setTimeout(() => { load(); }, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const handleToggle = async (serviceId) => {
    setActionLoading(serviceId);
    try {
      const res = await adminApi.toggleServiceStatus(serviceId);
      setServices(prev => prev.map(s => s.id === serviceId ? { ...s, is_active: res.data.isActive } : s));
    } catch (err) { alert(err.response?.data?.message || 'Failed to update service'); }
    finally { setActionLoading(''); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  const CATEGORIES = ['Design', 'Development', 'Writing', 'Music', 'Video', 'Photography', 'Teaching', 'Playground', 'Other'];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Service Moderation</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{total.toLocaleString('en-IN')} total services</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.3)' }} />
          <input
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by service title..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          />
        </div>
        <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: categoryFilter ? '#fff' : 'rgba(255,255,255,0.4)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: statusFilter !== '' ? '#fff' : 'rgba(255,255,255,0.4)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          <option value="">All Statuses</option>
          <option value="true">Active</option>
          <option value="false">Suspended</option>
        </select>
      </div>

      {/* Service cards grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden animate-pulse"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="h-28" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <div className="p-4 space-y-2">
                <div className="h-4 rounded" style={{ background: 'rgba(255,255,255,0.06)', width: '70%' }} />
                <div className="h-3 rounded" style={{ background: 'rgba(255,255,255,0.04)', width: '40%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <Package className="w-12 h-12 mb-3" style={{ color: 'rgba(255,255,255,0.15)' }} />
          <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>No services found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(service => {
            const catColor = CATEGORY_COLORS[service.category] || '#6B7280';
            const img = service.images?.[0];
            const seller = service.seller;
            return (
              <div key={service.id}
                className="rounded-2xl overflow-hidden flex flex-col transition-all"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${service.is_active ? 'rgba(255,255,255,0.07)' : 'rgba(239,68,68,0.15)'}`,
                  opacity: service.is_active ? 1 : 0.7,
                }}>
                {/* Thumbnail */}
                <div className="relative h-28 overflow-hidden" style={{ background: '#060D1A' }}>
                  {img ? (
                    <img src={img} alt={service.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"
                      style={{ background: `${catColor}15` }}>
                      <Package className="w-8 h-8" style={{ color: `${catColor}60` }} />
                    </div>
                  )}
                  {!service.is_active && (
                    <div className="absolute inset-0 flex items-center justify-center"
                      style={{ background: 'rgba(0,0,0,0.5)' }}>
                      <span className="px-2 py-1 rounded-lg text-[11px] font-bold"
                        style={{ background: 'rgba(239,68,68,0.8)', color: '#fff' }}>SUSPENDED</span>
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold"
                      style={{ background: `${catColor}30`, color: catColor, backdropFilter: 'blur(4px)', border: `1px solid ${catColor}40` }}>
                      {service.category}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex flex-col gap-3 flex-1">
                  <div>
                    <p className="text-white font-semibold text-sm leading-snug line-clamp-2">{service.title}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-semibold text-yellow-400">{Number(service.rating || 0).toFixed(1)}</span>
                      <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>({service.review_count})</span>
                    </div>
                  </div>

                  {seller && (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
                        {seller.avatar_url
                          ? <img src={seller.avatar_url} alt={seller.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-white text-[10px] font-bold"
                              style={{ background: 'linear-gradient(135deg,#635BFF,#00D4AA)' }}>{seller.name?.[0]}</div>
                        }
                      </div>
                      <span className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>{seller.name}</span>
                      <span className="ml-auto text-sm font-bold" style={{ color: '#00D4AA' }}>₹{service.price}</span>
                    </div>
                  )}

                  <div className="flex gap-2 mt-auto">
                    <a
                      href={`/services/${service.id}`}
                      target="_blank" rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
                      <ExternalLink className="w-3 h-3" /> View
                    </a>
                    <button
                      onClick={() => handleToggle(service.id)}
                      disabled={actionLoading === service.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                      style={{
                        background: service.is_active ? 'rgba(239,68,68,0.15)' : 'rgba(0,212,170,0.15)',
                        border: `1px solid ${service.is_active ? 'rgba(239,68,68,0.3)' : 'rgba(0,212,170,0.3)'}`,
                        color: service.is_active ? '#F87171' : '#00D4AA',
                      }}>
                      {actionLoading === service.id
                        ? <span className="w-3 h-3 border border-t-transparent rounded-full animate-spin" style={{ borderColor: service.is_active ? '#F87171' : '#00D4AA' }} />
                        : service.is_active ? <><EyeOff className="w-3 h-3" /> Suspend</> : <><Eye className="w-3 h-3" /> Activate</>}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, total)} of {total}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="p-2 rounded-xl disabled:opacity-40"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(99,91,255,0.2)', border: '1px solid rgba(99,91,255,0.3)', color: '#A5A1FF' }}>
              {page} / {totalPages}
            </span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="p-2 rounded-xl disabled:opacity-40"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
