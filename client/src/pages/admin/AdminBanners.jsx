import { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, Image, Loader, CheckCircle, AlertCircle, GripVertical } from 'lucide-react';
import api from '../../lib/api';

export default function AdminBanners() {
  const [banners, setBanners]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [uploading, setUploading]   = useState(false);
  const [preview, setPreview]       = useState(null);
  const [file, setFile]             = useState(null);
  const [label, setLabel]           = useState('');
  const [toast, setToast]           = useState(null); // { msg, type }
  const [deletingId, setDeletingId] = useState(null);
  const fileRef = useRef(null);
  const dropRef = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadBanners = async () => {
    try {
      const { data } = await api.get('/banners/admin/list');
      setBanners(data.banners || []);
    } catch {
      showToast('Failed to load banners', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBanners(); }, []);

  const handleFilePick = (f) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) { showToast('Only image files are allowed', 'error'); return; }
    if (f.size > 20 * 1024 * 1024) { showToast('File too large (max 20 MB)', 'error'); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dropRef.current?.classList.remove('drag-over');
    handleFilePick(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) { showToast('Please select a banner image first', 'error'); return; }
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('label', label.trim());
      await api.post('/banners/admin', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      showToast('Banner uploaded successfully!');
      setFile(null); setPreview(null); setLabel('');
      if (fileRef.current) fileRef.current.value = '';
      loadBanners();
    } catch (err) {
      showToast(err.response?.data?.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner? It will be removed from the Browse page immediately.')) return;
    setDeletingId(id);
    try {
      await api.delete(`/banners/admin/${id}`);
      showToast('Banner deleted');
      setBanners(prev => prev.filter(b => b.id !== id));
    } catch {
      showToast('Delete failed', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleActive = async (id, current) => {
    try {
      await api.patch(`/banners/admin/${id}/toggle`, { is_active: !current });
      setBanners(prev => prev.map(b => b.id === id ? { ...b, is_active: !b.is_active } : b));
    } catch {
      showToast('Toggle failed', 'error');
    }
  };

  return (
    <div className="space-y-6 relative">

      {/* Toast */}
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-semibold shadow-2xl animate-fade-in"
          style={{
            background: toast.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(0,212,170,0.15)',
            border: `1px solid ${toast.type === 'error' ? 'rgba(239,68,68,0.35)' : 'rgba(0,212,170,0.35)'}`,
            color: toast.type === 'error' ? '#FCA5A5' : '#00D4AA',
            backdropFilter: 'blur(12px)',
          }}
        >
          {toast.type === 'error'
            ? <AlertCircle className="w-4 h-4 shrink-0" />
            : <CheckCircle className="w-4 h-4 shrink-0" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
          🖼 Hero Banners
        </h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Upload 3780 × 1819 px banners that appear on the Browse page slider.
        </p>
      </div>

      {/* Upload Panel */}
      <div className="rounded-2xl p-6 space-y-4"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,91,255,0.2)' }}>
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Upload className="w-4 h-4 text-purple-400" /> Upload New Banner
        </h2>

        {/* Drop zone */}
        <div
          ref={dropRef}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); dropRef.current?.classList.add('ring-2', 'ring-purple-500'); }}
          onDragLeave={() => dropRef.current?.classList.remove('ring-2', 'ring-purple-500')}
          onDrop={handleDrop}
          className="relative cursor-pointer rounded-xl overflow-hidden transition-all"
          style={{
            border: '2px dashed rgba(99,91,255,0.35)',
            background: 'rgba(99,91,255,0.05)',
            minHeight: preview ? 'auto' : '160px',
          }}
        >
          {preview ? (
            <div className="relative">
              <img src={preview} alt="Preview" className="w-full rounded-xl object-cover" style={{ maxHeight: '260px' }} />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-xl">
                <span className="text-white text-sm font-semibold">Click to change</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(99,91,255,0.15)', border: '1px solid rgba(99,91,255,0.25)' }}>
                <Image className="w-7 h-7" style={{ color: '#A5A1FF' }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white">Drag & drop or click to select</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Recommended: 3780 × 1819 px · Max 20 MB</p>
              </div>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFilePick(e.target.files[0])} />
        </div>

        {/* Label input */}
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Banner Label (optional — shown as caption)
          </label>
          <input
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="e.g. Summer Fest 2025 · Study Month Special"
            className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          />
        </div>

        {/* Upload button */}
        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
          style={{
            background: 'linear-gradient(135deg, #635BFF, #00D4AA)',
            color: '#fff',
            boxShadow: '0 4px 16px rgba(99,91,255,0.3)',
          }}
        >
          {uploading
            ? <><Loader className="w-4 h-4 animate-spin" /> Uploading…</>
            : <><Upload className="w-4 h-4" /> Upload Banner</>
          }
        </button>
      </div>

      {/* Current banners list */}
      <div className="rounded-2xl p-6 space-y-4"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Image className="w-4 h-4 text-purple-400" />
          Active Banners
          <span className="text-xs font-normal px-2 py-0.5 rounded-full" style={{ background: 'rgba(99,91,255,0.2)', color: '#A5A1FF' }}>
            {banners.length} uploaded
          </span>
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 animate-spin" style={{ color: '#635BFF' }} />
          </div>
        ) : banners.length === 0 ? (
          <div className="text-center py-12">
            <Image className="w-10 h-10 mx-auto mb-3 opacity-20 text-white" />
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No banners yet. Upload your first banner above.</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>Until then, the Browse page shows a beautiful gradient placeholder.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {banners.map((b, idx) => (
              <div
                key={b.id}
                className="flex items-center gap-4 rounded-xl p-3 transition-all"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                {/* Thumbnail */}
                <div className="shrink-0 rounded-lg overflow-hidden" style={{ width: '96px', height: '48px' }}>
                  <img src={b.url} alt={b.label || `Banner ${idx + 1}`} className="w-full h-full object-cover" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {b.label || `Banner ${idx + 1}`}
                  </p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    {new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                {/* Active toggle */}
                <button
                  onClick={() => toggleActive(b.id, b.is_active)}
                  className="px-3 py-1 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: b.is_active ? 'rgba(0,212,170,0.15)' : 'rgba(255,255,255,0.06)',
                    color: b.is_active ? '#00D4AA' : 'rgba(255,255,255,0.35)',
                    border: `1px solid ${b.is_active ? 'rgba(0,212,170,0.3)' : 'rgba(255,255,255,0.1)'}`,
                  }}
                >
                  {b.is_active ? '● Live' : '○ Hidden'}
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(b.id)}
                  disabled={deletingId === b.id}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-red-500/20 text-red-400/50 hover:text-red-400 disabled:opacity-40"
                >
                  {deletingId === b.id
                    ? <Loader className="w-4 h-4 animate-spin" />
                    : <Trash2 className="w-4 h-4" />
                  }
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
