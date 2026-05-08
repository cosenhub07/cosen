import { useCallback } from 'react';

// Dynamically loads the official Razorpay checkout.js script
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById('razorpay-sdk')) return resolve(true);
    const script = document.createElement('script');
    script.id  = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

/**
 * useRazorpay — opens the Razorpay checkout popup.
 *
 * Usage:
 *   const openCheckout = useRazorpay();
 *   openCheckout({ options, onSuccess, onDismiss });
 *
 * options must include: key, amount, currency, order_id, name, description, prefill
 * onSuccess(response) — called with { razorpay_payment_id, razorpay_order_id, razorpay_signature }
 * onDismiss()         — called when user closes the popup without paying
 */
const useRazorpay = () => {
  const openCheckout = useCallback(async ({ options, onSuccess, onDismiss }) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      alert('Failed to load Razorpay. Check your network connection.');
      return;
    }

    const rzp = new window.Razorpay({
      ...options,
      handler: (response) => {
        if (onSuccess) onSuccess(response);
      },
      modal: {
        ondismiss: () => { if (onDismiss) onDismiss(); },
      },
      theme: { color: '#635BFF' },
    });

    rzp.on('payment.failed', (response) => {
      console.error('Razorpay payment failed:', response.error);
      alert(`Payment failed: ${response.error.description}`);
    });

    rzp.open();
  }, []);

  return openCheckout;
};

export default useRazorpay;
