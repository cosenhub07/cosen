import { Link, useLocation, Navigate } from 'react-router-dom';
import { CheckCircle, ChevronRight, ShoppingBag, MessageCircle, Copy } from 'lucide-react';
import { useState } from 'react';

export default function PaymentSuccess() {
  const { state } = useLocation();
  const [copied, setCopied] = useState(false);

  // Redirect if no state (accessed directly)
  if (!state?.order) return <Navigate to="/browse" replace />;

  const { order, paymentId } = state;
  const orderId = String(order._id).slice(-8).toUpperCase();

  const copyPaymentId = () => {
    navigator.clipboard.writeText(paymentId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-stripe-bg flex items-center justify-center px-4 pt-20 pb-12">
      <div className="w-full max-w-lg">

        {/* Success card */}
        <div className="stripe-card bg-white p-8 text-center">
          {/* Animated tick */}
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>

          <h1 className="font-display font-bold text-stripe-slate text-2xl mb-2">
            Payment Successful! 🎉
          </h1>
          <p className="text-stripe-muted mb-8">
            Your order has been placed. The seller has been notified and will start working shortly.
          </p>

          {/* Order summary */}
          <div className="bg-stripe-bg rounded-xl p-5 text-left mb-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-stripe-muted">Service</span>
              <span className="font-semibold text-stripe-slate text-right max-w-xs truncate">
                {order.service?.title}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stripe-muted">Amount Paid</span>
              <span className="font-bold text-stripe-slate">₹{order.price?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stripe-muted">Order ID</span>
              <span className="font-semibold text-stripe-slate">#{orderId}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-stripe-muted">Payment ID</span>
              <button
                onClick={copyPaymentId}
                className="flex items-center gap-1.5 text-stripe-purple font-semibold hover:underline text-xs"
              >
                <Copy className="h-3.5 w-3.5" />
                {copied ? 'Copied!' : paymentId?.slice(0, 20) + '...'}
              </button>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t" style={{ borderColor: '#E6EBF1' }}>
              <span className="text-stripe-muted">Status</span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">
                In Progress
              </span>
            </div>
          </div>

          {/* Escrow info */}
          <div className="flex items-start gap-3 bg-stripe-purple/5 border border-stripe-purple/20 rounded-xl p-4 text-left mb-8">
            <div className="w-8 h-8 rounded-lg bg-stripe-purple/10 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-sm">🔒</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-stripe-slate mb-1">Your payment is protected</p>
              <p className="text-xs text-stripe-muted leading-relaxed">
                ₹{order.price?.toLocaleString('en-IN')} is held securely in escrow. The seller receives it only after you confirm delivery.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link to="/dashboard" id="success-view-order" className="btn-primary justify-center py-3">
              <ShoppingBag className="h-4 w-4" /> View My Orders <ChevronRight className="h-4 w-4" />
            </Link>
            <Link to={`/orders/${order._id}`} id="success-contact-seller" className="btn-outline justify-center py-3">
              <MessageCircle className="h-4 w-4" /> Message Seller
            </Link>
            <Link to="/browse" className="text-sm text-stripe-muted hover:text-stripe-purple transition-colors mt-1">
              Continue browsing services →
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-stripe-muted mt-6">
          A confirmation has been sent to your university email.
        </p>
      </div>
    </div>
  );
}
