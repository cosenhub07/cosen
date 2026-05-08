const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { protect } = require('../middleware/auth');
const { supabase } = require('../config/db');

// Initialise Razorpay instance
const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const COMMISSION = parseFloat(process.env.PLATFORM_COMMISSION) || 0.10;

// ── Helpers ──────────────────────────────────────────────────

const mapOrder = (row) => {
  if (!row) return null;
  const { service, seller, ...order } = row;
  return {
    ...order,
    _id: order.id,
    serviceId: order.service_id,
    buyerId: order.buyer_id,
    sellerId: order.seller_id,
    platformFee: order.platform_fee,
    sellerEarnings: order.seller_earnings,
    razorpayOrderId: order.razorpay_order_id,
    razorpayPaymentId: order.razorpay_payment_id,
    createdAt: order.created_at,
    service: service ? { _id: service.id, title: service.title, price: service.price, deliveryDays: service.delivery_days } : undefined,
    seller: seller ? { _id: seller.id, name: seller.name, email: seller.email } : undefined,
  };
};

// ─────────────────────────────────────────────────────────────
// POST /api/payments/create-order
// ─────────────────────────────────────────────────────────────
router.post('/create-order', protect, async (req, res) => {
  try {
    const { serviceId, requirements } = req.body;

    const { data: service, error: svcErr } = await supabase
      .from('services')
      .select('id, seller_id, price, title, is_active')
      .eq('id', serviceId)
      .maybeSingle();

    if (svcErr || !service || !service.is_active)
      return res.status(404).json({ success: false, message: 'Service not found' });

    if (service.seller_id === req.user._id)
      return res.status(400).json({ success: false, message: 'You cannot order your own service' });

    const amountPaise = Math.round(service.price * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount:   amountPaise,
      currency: 'INR',
      receipt:  `cosen_${serviceId.slice(0,8)}_${Date.now().toString().slice(-8)}`,
      notes: {
        buyerId:      req.user._id,
        sellerId:     service.seller_id,
        serviceId:    serviceId,
        serviceTitle: service.title,
      },
    });

    res.status(200).json({
      success:         true,
      razorpayOrderId: razorpayOrder.id,
      amount:          razorpayOrder.amount,
      amountINR:       service.price,
      currency:        razorpayOrder.currency,
      keyId:           process.env.RAZORPAY_KEY_ID,
      serviceTitle:    service.title,
      requirements:    requirements || '',
    });
  } catch (error) {
    console.error('Create Razorpay order error:', error);
    // Surface the real Razorpay error in development
    const razorMsg = error?.error?.description || error?.message || 'Payment initiation failed.';
    res.status(500).json({ success: false, message: razorMsg });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/payments/verify
// ─────────────────────────────────────────────────────────────
router.post('/verify', protect, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      serviceId,
      requirements,
    } = req.body;

    // 1. Verify HMAC-SHA256 signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
    }

    // 2. Load service to get price & seller
    const { data: service, error: svcErr } = await supabase
      .from('services')
      .select('id, seller_id, price')
      .eq('id', serviceId)
      .maybeSingle();

    if (svcErr || !service)
      return res.status(404).json({ success: false, message: 'Service not found' });

    const price          = service.price;
    const platformFee    = Math.round(price * COMMISSION);
    const sellerEarnings = price - platformFee;

    // 3. Create Order in Supabase
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        service_id:           service.id,
        buyer_id:             req.user._id,
        seller_id:            service.seller_id,
        price,
        platform_fee:         platformFee,
        seller_earnings:      sellerEarnings,
        status:               'inProgress',
        requirements:         requirements || '',
        razorpay_order_id:    razorpay_order_id,
        razorpay_payment_id:  razorpay_payment_id,
      })
      .select(`
        *,
        service:services!service_id(id, title, price, delivery_days),
        seller:users!seller_id(id, name, email)
      `)
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, order: mapOrder(order) });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: 'Could not confirm payment. Contact support.' });
  }
});

// ─────────────────────────────────────────────────────────────
// POST /api/payments/webhook
// ─────────────────────────────────────────────────────────────
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body      = req.body;

    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    if (signature !== expectedSig) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const event = JSON.parse(body);
    console.log('Razorpay webhook event:', event.event);

    switch (event.event) {
      case 'payment.captured':
        console.log('Payment captured:', event.payload.payment.entity.id);
        break;
      case 'payment.failed':
        console.log('Payment failed:', event.payload.payment.entity.id);
        break;
      default:
        break;
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
