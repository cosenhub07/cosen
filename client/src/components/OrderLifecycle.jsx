import React, { useState } from 'react';
import { Loader } from 'lucide-react';

export default function OrderLifecycle({ order, isBuyer, onUpdateStatus, onReview }) {
  const [disputeReason, setDisputeReason] = useState('');
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputing, setDisputing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Status progression mapping
  const steps = [
    { id: 1, title: 'Placed', desc: 'Payment captured into escrow' },
    { id: 2, title: 'In progress', desc: 'Seller is working on it' },
    { id: 3, title: 'Delivered', desc: 'Seller submitted the work' },
    { id: 4, title: 'Completed', desc: 'Escrow released to seller' },
  ];

  const getStepLevel = () => {
    switch (order.status) {
      case 'pending':
      case 'pending_negotiation': return 1;
      case 'inProgress': return 2;
      case 'delivered': return 3;
      case 'completed': return 4;
      case 'disputed': return 3; // Typically disputed happens at delivered
      default: return 1;
    }
  };

  const currentLevel = getStepLevel();

  const handleDisputeSubmit = async (e) => {
    e.preventDefault();
    if (!disputeReason.trim()) return;
    setDisputing(true);
    await onUpdateStatus('dispute', { reason: disputeReason });
    setDisputing(false);
    setShowDisputeModal(false);
  };

  const handleAction = async (actionStr) => {
    setActionLoading(actionStr);
    await onUpdateStatus(actionStr);
    setActionLoading(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-7 shadow-sm mb-6 w-full">
      <h3 className="font-display font-bold text-stripe-slate text-lg mb-6">Order lifecycle</h3>
      
      {/* Stepper UI */}
      <div className="relative flex justify-between mb-10 max-w-4xl mx-auto">
        <div className="absolute left-0 top-5 w-full h-[2px] bg-slate-200 -z-0"></div>
        <div 
          className="absolute left-0 top-5 h-[2px] bg-[#635BFF] transition-all duration-500 ease-in-out -z-0"
          style={{ width: `${((currentLevel - 1) / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step, index) => {
          const isActive = step.id <= currentLevel;
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center text-center group" style={{ width: '25%' }}>
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-3 transition-colors duration-300
                  ${isActive 
                    ? 'bg-[#635BFF] text-white shadow-md' 
                    : 'bg-white text-slate-400 border-2 border-slate-200'
                  }
                `}
              >
                {step.id}
              </div>
              <div className="px-1">
                <p className={`font-bold text-sm ${isActive ? 'text-stripe-slate' : 'text-slate-400'}`}>
                  {step.title}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-tight max-w-[120px] mx-auto hidden sm:block">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Buttons Area */}
      <div className="flex flex-wrap gap-3 max-w-4xl mx-auto mt-6">
        
        {/* Seller Actions */}
        {!isBuyer && order.status === 'inProgress' && (
          <button 
            onClick={() => handleAction('deliver')}
            disabled={actionLoading === 'deliver'}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm text-white transition-all disabled:opacity-60"
            style={{ background: '#635BFF', boxShadow: '0 4px 12px rgba(99,91,255,0.25)' }}
          >
            {actionLoading === 'deliver' ? <Loader className="h-4 w-4 animate-spin" /> : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            )}
            Seller delivers
          </button>
        )}

        {/* Buyer Actions */}
        {isBuyer && order.status === 'delivered' && (
          <>
            <button 
              onClick={() => handleAction('complete')}
              disabled={actionLoading === 'complete'}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm text-white transition-all disabled:opacity-60 hover:bg-[#524ae3]"
              style={{ background: '#635BFF', boxShadow: '0 4px 12px rgba(99,91,255,0.25)' }}
            >
              {actionLoading === 'complete' ? <Loader className="h-4 w-4 animate-spin" /> : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              )}
              Accept & release escrow
            </button>
            <button 
              onClick={() => setShowDisputeModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all"
            >
              Raise a dispute
            </button>
          </>
        )}

        {/* Disputed State */}
        {order.status === 'disputed' && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-xs w-full max-w-md">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 mt-0.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            This order is currently disputed. Admin team is reviewing it.
          </div>
        )}

        {/* Completed State (Review) */}
        {isBuyer && order.status === 'completed' && !order.isReviewed && (
          <button 
            onClick={onReview}
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            Leave a review
          </button>
        )}

      </div>

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowDisputeModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95">
            <h2 className="text-xl font-display font-bold text-stripe-slate mb-2 text-red-600">Raise a Dispute</h2>
            <p className="text-sm text-stripe-muted mb-4">Please describe the issue with this order. Cosen admin will review your case.</p>
            
            <form onSubmit={handleDisputeSubmit}>
              <textarea
                className="stripe-input w-full min-h-[100px] resize-none mb-4"
                placeholder="What went wrong?"
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="btn-outline flex-1 justify-center py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={disputing || !disputeReason.trim()}
                  className="btn-primary flex-1 justify-center py-2 !bg-red-600 hover:!bg-red-700 disabled:opacity-50"
                >
                  {disputing ? <Loader className="h-4 w-4 animate-spin" /> : 'Submit Dispute'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
