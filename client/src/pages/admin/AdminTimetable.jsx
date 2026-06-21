import { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, FileSpreadsheet, Loader, CheckCircle, AlertCircle, Database, Clock, Hash } from 'lucide-react';
import api from '../../lib/api';

export default function AdminTimetable() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [semesterLabel, setSemesterLabel] = useState('Timetable 2026-2027');
  const [toast, setToast] = useState(null);
  const [clearing, setClearing] = useState(false);
  const fileRef = useRef(null);
  const dropRef = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadMeta = async () => {
    try {
      const { data } = await api.get('/timetable/admin/meta');
      setUploads(data.uploads || []);
    } catch {
      showToast('Failed to load upload history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMeta(); }, []);

  const handleFilePick = (f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls'].includes(ext)) {
      showToast('Only Excel files (.xlsx / .xls) are allowed', 'error');
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      showToast('File too large (max 20 MB)', 'error');
      return;
    }
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dropRef.current?.classList.remove('ring-2', 'ring-purple-500');
    handleFilePick(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) { showToast('Please select an Excel file first', 'error'); return; }
    if (!semesterLabel.trim()) { showToast('Please enter a semester label', 'error'); return; }

    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('semester_label', semesterLabel.trim());
      const { data } = await api.post('/timetable/admin/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      showToast(data.message || 'Timetable uploaded successfully!');
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
      loadMeta();
    } catch (err) {
      showToast(err.response?.data?.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('⚠️ This will DELETE all timetable data and upload history. Students will see an empty timetable. Are you sure?')) return;
    setClearing(true);
    try {
      await api.delete('/timetable/admin/clear');
      showToast('All timetable data cleared.');
      setUploads([]);
    } catch {
      showToast('Clear failed', 'error');
    } finally {
      setClearing(false);
    }
  };

  const activeUpload = uploads.find(u => u.is_active);

  return (
    <div className="space-y-6 relative">

      {/* Toast */}
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-semibold shadow-2xl"
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
          📅 Timetable Manager
        </h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Upload the PPSU SOE Master Timetable Excel file to update the Free Room Finder for all students.
        </p>
      </div>

      {/* Active timetable status */}
      {activeUpload && (
        <div className="rounded-2xl p-5 flex items-center gap-4"
          style={{ background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.25)' }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(0,212,170,0.15)' }}>
            <Database className="w-5 h-5" style={{ color: '#00D4AA' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white">{activeUpload.semester_label}</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {activeUpload.row_count?.toLocaleString()} slots · Uploaded {new Date(activeUpload.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: 'rgba(0,212,170,0.15)', color: '#00D4AA', border: '1px solid rgba(0,212,170,0.3)' }}>
            ● LIVE
          </span>
        </div>
      )}

      {/* Format Guide */}
      <div className="rounded-2xl p-5"
        style={{ background: 'rgba(99,91,255,0.07)', border: '1px solid rgba(99,91,255,0.2)' }}>
        <p className="text-xs font-bold mb-3" style={{ color: '#A5A1FF', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Required Excel Format (Sheet 1)
        </p>
        <div className="overflow-x-auto">
          <table style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                {['Program', 'Year', 'Class Code', 'Section', 'Day', 'Start Time', 'End Time', 'Subject', 'Session Type', 'Room', 'Teacher'].map(col => (
                  <th key={col} style={{ padding: '4px 10px', background: 'rgba(99,91,255,0.15)', fontWeight: 700, color: '#A5A1FF', textAlign: 'left', borderRadius: 4, whiteSpace: 'nowrap' }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ opacity: 0.7 }}>
                {['BTech', '3rd Year', 'DCE5', 'A', 'MON', '09:50', '10:45', 'Data Structures', 'Lecture', 'H801', 'Dr. RAJ KUMAR'].map((v, i) => (
                  <td key={i} style={{ padding: '4px 10px', whiteSpace: 'nowrap' }}>{v}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Day values: MON TUE WED THU FRI SAT · Time format: HH:MM (24-hour) · Session Type: Lecture / Tutorial / Lab
        </p>
      </div>

      {/* Upload Panel */}
      <div className="rounded-2xl p-6 space-y-4"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,91,255,0.2)' }}>
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Upload className="w-4 h-4 text-purple-400" />
          Upload New Timetable
        </h2>

        {/* Drop zone */}
        <div
          ref={dropRef}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); dropRef.current?.classList.add('ring-2', 'ring-purple-500'); }}
          onDragLeave={() => dropRef.current?.classList.remove('ring-2', 'ring-purple-500')}
          onDrop={handleDrop}
          className="relative cursor-pointer rounded-xl overflow-hidden transition-all"
          style={{ border: '2px dashed rgba(99,91,255,0.35)', background: 'rgba(99,91,255,0.05)', minHeight: file ? 'auto' : '140px' }}
        >
          {file ? (
            <div className="flex items-center gap-4 p-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(0,212,170,0.15)', border: '1px solid rgba(0,212,170,0.25)' }}>
                <FileSpreadsheet className="w-6 h-6" style={{ color: '#00D4AA' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{file.name}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {(file.size / 1024).toFixed(1)} KB · Click to change
                </p>
              </div>
              <CheckCircle className="w-5 h-5 shrink-0" style={{ color: '#00D4AA' }} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(99,91,255,0.15)', border: '1px solid rgba(99,91,255,0.25)' }}>
                <FileSpreadsheet className="w-7 h-7" style={{ color: '#A5A1FF' }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white">Drag & drop or click to select Excel file</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>.xlsx or .xls · Max 20 MB</p>
              </div>
            </div>
          )}
          <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden"
            onChange={e => handleFilePick(e.target.files[0])} />
        </div>

        {/* Semester label */}
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Semester Label <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <input
            type="text"
            value={semesterLabel}
            onChange={e => setSemesterLabel(e.target.value)}
            placeholder="e.g. Timetable 2026-2027 · Even Sem Jan–May 2026"
            className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
          />
        </div>

        {/* Upload button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleUpload}
            disabled={uploading || !file}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #635BFF, #00D4AA)', color: '#fff', boxShadow: '0 4px 16px rgba(99,91,255,0.3)' }}
          >
            {uploading
              ? <><Loader className="w-4 h-4 animate-spin" /> Uploading & Parsing…</>
              : <><Upload className="w-4 h-4" /> Upload Timetable</>
            }
          </button>
          {uploading && (
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
              This may take a few seconds while we parse and import all slots…
            </p>
          )}
        </div>
      </div>

      {/* Upload history */}
      <div className="rounded-2xl p-6 space-y-4"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-400" />
            Upload History
            <span className="text-xs font-normal px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(99,91,255,0.2)', color: '#A5A1FF' }}>
              {uploads.length} total
            </span>
          </h2>
          {uploads.length > 0 && (
            <button
              onClick={handleClear}
              disabled={clearing}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
              style={{ color: '#FCA5A5', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              {clearing ? <Loader className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              Clear All Data
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader className="w-6 h-6 animate-spin" style={{ color: '#635BFF' }} />
          </div>
        ) : uploads.length === 0 ? (
          <div className="text-center py-10">
            <FileSpreadsheet className="w-10 h-10 mx-auto mb-3 opacity-20 text-white" />
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No timetables uploaded yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {uploads.map((u) => (
              <div key={u.id} className="flex items-center gap-4 rounded-xl p-4 transition-all"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${u.is_active ? 'rgba(0,212,170,0.2)' : 'rgba(255,255,255,0.07)'}` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: u.is_active ? 'rgba(0,212,170,0.12)' : 'rgba(255,255,255,0.05)' }}>
                  <Database className="w-5 h-5" style={{ color: u.is_active ? '#00D4AA' : 'rgba(255,255,255,0.3)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{u.semester_label}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      <Hash className="w-3 h-3" /> {u.row_count?.toLocaleString()} slots
                    </span>
                    <span className="text-xs flex items-center gap-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      <Clock className="w-3 h-3" />
                      {new Date(u.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                {u.is_active && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold shrink-0"
                    style={{ background: 'rgba(0,212,170,0.15)', color: '#00D4AA', border: '1px solid rgba(0,212,170,0.3)' }}>
                    ● Active
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
