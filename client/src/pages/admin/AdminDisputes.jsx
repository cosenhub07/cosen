import { useState, useEffect, useCallback } from 'react';
import {
  Gavel, MessageSquare, CheckCircle, RefreshCw,
  Trophy, X, AlertTriangle, Loader, Clock, DollarSign,
  User, ChevronRight
} from 'lucide-react';
import adminApi from '../../lib/adminApi';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const STATUS_COLOR = { disputed: '#EF4444', cancelled: '#6B7280', completed: '#00D4AA' };

// ── Chat Transcript ────────────────────────────────────────────
function ChatTranscript({ messages, loading }) {
  if (loading) return (
    <div className="flex items-center justify-center h-32">
      <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#635BFF', borderTopColor: 'transparent' }} />
    </div>
  );
  if (!messages.length) return (
    <div className="flex items-center justify-center h-24 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
      No messages in this order
    </div>
  );
  return (
    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
      {messages.map(m => (
        <div key={m._id} className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-full overflow-hidden shrink-0">
            {m.sender?.avatar?.url
              ? <img src={m.sender.avatar.url} alt={m.sender.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ background: 'linear-gradient(135deg,#635BFF,#00D4AA)' }}>{m.sender?.name?.[0] || '?'}</div>
            }
          </div>
          <div>
            <p className="text-[10px] font-semibold mb-0.5" style={{ color: '#A5A1FF' }}>
              {m.sender?.name || 'Unknown'} · {new Date(m.createdAt).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
            </p>
            <div className="px-3 py-2 rounded-xl text-xs leading-relaxed"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)' }}>
              {m.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Resolution Console Modal ───────────────────────────────────
function ResolutionModal({ order, onClose, onResolve }) {
  const [messages, setMessages] = useState([]);
  const [msgLoading, setMsgLoading] = useState(true);
  const [verdict, setVerdict] = useState('');
  const [winnerId, setWinnerId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isPlayground = order.service?.category === 'Playground';

  useEffect(() => {
    adminApi.getDisputeMessages(order._id)
      .then(res => setMessages(res.data.messages))
      .catch(() => {})
      .finally(() => setMsgLoading(false));
  }, [order._id]);

  const handleResolve = async () => {
    if (!verdict) return setError('Please select a verdict');
    if (verdict === 'settle_playground' && !winnerId) return setError('Please select the winning player');
    setSubmitting(true);
    setError('');
    try {
      await adminApi.resolveDispute(order._id, verdict, winnerId || undefined);
      onResolve(order._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resolve dispute');
    } finally {
      setSubmitting(false);
    }
  };

  const VERDICTS = isPlayground
    ? [{ value: 'settle_playground', label: '🏆 Settle Match (Pick Winner)', color: '#FF9F43' }]
    : [
        { value: 'refund_buyer', label: '↩ Refund Buyer', color: '#EF4444' },
        { value: 'release_seller', label: '✅ Release to Seller', color: '#00D4AA' },
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: '#0D1426', border: '1px solid rgba(99,91,255,0.25)', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
          style={{ background: '#0D1426', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <h2 className="text-white font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>Dispute Resolution Console</h2>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{order.service?.title}</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Order summary */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Order Value</p>
              <p className="text-white font-bold text-base">{fmt(order.price)}</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Buyer</p>
              <p className="text-white font-semibold truncate">{order.buyer?.name}</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>Seller</p>
              <p className="text-white font-semibold truncate">{order.seller?.name}</p>
            </div>
          </div>

          {/* Dispute reason */}
          {order.disputeReason && (
            <div className="rounded-xl p-4 text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <p className="text-[10px] uppercase tracking-wider mb-1 font-bold" style={{ color: '#F87171' }}>Dispute Reason</p>
              <p className="text-white/80">{order.disputeReason}</p>
            </div>
          )}

          {/* Chat transcript */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4" style={{ color: '#A5A1FF' }} />
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.5)' }}>Order Chat Transcript</p>
            </div>
            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <ChatTranscript messages={messages} loading={msgLoading} />
            </div>
          </div>

          {/* Playground special: pick winner */}
          {isPlayground && verdict === 'settle_playground' && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Select Match Winner</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: order.buyer?._id, name: order.buyer?.name, role: 'Challenger' },
                  { id: order.seller?._id, name: order.seller?.name, role: 'Host' },
                ].map(p => (
                  <button key={p.id} onClick={() => setWinnerId(p.id)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: winnerId === p.id ? 'rgba(255,159,67,0.2)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${winnerId === p.id ? 'rgba(255,159,67,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      color: winnerId === p.id ? '#FF9F43' : 'rgba(255,255,255,0.5)',
                    }}>
                    <Trophy className="w-4 h-4 shrink-0" />
                    <div className="text-left min-w-0">
                      <p className="truncate">{p.name}</p>
                      <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{p.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Verdict selection */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Issue Verdict</p>
            <div className={`grid grid-cols-${VERDICTS.length} gap-3`}>
              {VERDICTS.map(v => (
                <button key={v.value} onClick={() => setVerdict(v.value)}
                  className="px-4 py-3 rounded-xl text-sm font-semibold transition-all text-center"
                  style={{
                    background: verdict === v.value ? `${v.color}20` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${verdict === v.value ? `${v.color}50` : 'rgba(255,255,255,0.08)'}`,
                    color: verdict === v.value ? v.color : 'rgba(255,255,255,0.5)',
                  }}>
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm px-4 py-3 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#F87171' }}>
              <AlertTriangle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
            Cancel
          </button>
          <button onClick={handleResolve} disabled={!verdict || submitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #635BFF, #00D4AA)', color: '#fff' }}>
            {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <><Gavel className="w-4 h-4" /> Issue Verdict</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────
export default function AdminDisputes() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    adminApi.getDisputes()
      .then(res => setOrders(res.data.orders))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleResolve = (orderId) => setOrders(prev => prev.filter(o => o._id !== orderId));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Dispute Mediation</h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Review disputed orders and issue fair escrow verdicts</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#635BFF', borderTopColor: 'transparent' }} />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <Gavel className="w-12 h-12 mb-3" style={{ color: 'rgba(255,255,255,0.15)' }} />
          <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>No open disputes — great!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order._id}
              className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all hover:scale-[1.005]"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(239,68,68,0.15)' }}
              onClick={() => setSelected(order)}>
              {/* Category badge */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <AlertTriangle className="w-5 h-5" style={{ color: '#F87171' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-white font-semibold text-sm truncate">{order.service?.title || 'Deleted Service'}</p>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0"
                    style={{ background: 'rgba(99,91,255,0.2)', color: '#A5A1FF' }}>{order.service?.category}</span>
                </div>
                <div className="flex items-center gap-3 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  <span className="flex items-center gap-1"><User className="w-3 h-3" />{order.buyer?.name} → {order.seller?.name}</span>
                  <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{fmt(order.price)}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(order.updatedAt).toLocaleDateString('en-IN')}</span>
                </div>
                {order.disputeReason && (
                  <p className="text-[11px] mt-1.5 truncate" style={{ color: '#F87171' }}>"{order.disputeReason}"</p>
                )}
              </div>
              <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all hover:opacity-80"
                style={{ background: 'rgba(99,91,255,0.2)', border: '1px solid rgba(99,91,255,0.3)', color: '#A5A1FF' }}>
                Mediate <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <ResolutionModal order={selected} onClose={() => setSelected(null)} onResolve={handleResolve} />
      )}
    </div>
  );
}
