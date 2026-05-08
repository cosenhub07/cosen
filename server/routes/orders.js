const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { supabase } = require('../config/db');

const COMMISSION = 0.10; // 10% platform fee

// ── Helpers ──────────────────────────────────────────────────

const mapOrder = (row) => {
  if (!row) return null;
  const { service, buyer, seller, ...order } = row;
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
    requirements: order.requirements,
    deliveryNote: order.delivery_note,
    disputeReason: order.dispute_reason,
    isReviewed: order.is_reviewed,
    deliveredAt: order.delivered_at,
    completedAt: order.completed_at,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    service: service ? {
      _id: service.id,
      title: service.title,
      price: service.price,
      deliveryDays: service.delivery_days,
      images: service.images,
      category: service.category,
    } : undefined,
    buyer: buyer ? {
      _id: buyer.id,
      name: buyer.name,
      email: buyer.email,
      avatar: { public_id: buyer.avatar_public_id || '', url: buyer.avatar_url || '' },
    } : undefined,
    seller: seller ? {
      _id: seller.id,
      name: seller.name,
      email: seller.email,
      avatar: { public_id: seller.avatar_public_id || '', url: seller.avatar_url || '' },
      department: seller.department,
      phone: seller.phone,
      isPhoneVerified: seller.is_phone_verified,
    } : undefined,
    buyerPhone: buyer?.phone || null,
    buyerPhoneVerified: buyer?.is_phone_verified || false,
  };
};

// ─────────────────────────────────────────────────────────────
// POST /api/orders — place a new order (protected)
// ─────────────────────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const { serviceId, requirements } = req.body;

    const { data: service, error: svcErr } = await supabase
      .from('services')
      .select('id, seller_id, price, is_active')
      .eq('id', serviceId)
      .maybeSingle();

    if (svcErr || !service || !service.is_active)
      return res.status(404).json({ success: false, message: 'Service not found' });

    if (service.seller_id === req.user._id)
      return res.status(400).json({ success: false, message: 'You cannot order your own service' });

    const price = service.price;
    const platformFee = Math.round(price * COMMISSION);
    const sellerEarnings = price - platformFee;

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        service_id: service.id,
        buyer_id: req.user._id,
        seller_id: service.seller_id,
        price,
        platform_fee: platformFee,
        seller_earnings: sellerEarnings,
        requirements: requirements || '',
        status: 'pending',
      })
      .select(`
        *,
        service:services!service_id(id, title, price, delivery_days),
        buyer:users!buyer_id(id, name, email, avatar_url, avatar_public_id, phone, is_phone_verified),
        seller:users!seller_id(id, name, email, avatar_url, avatar_public_id, phone, is_phone_verified)
      `)
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, order: mapOrder(order) });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/orders — list all orders for current user
// ─────────────────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        service:services!service_id(id, title, price, images, category),
        buyer:users!buyer_id(id, name, avatar_url, avatar_public_id),
        seller:users!seller_id(id, name, avatar_url, avatar_public_id)
      `)
      .or(`buyer_id.eq.${req.user._id},seller_id.eq.${req.user._id}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.status(200).json({ success: true, orders: orders.map(mapOrder) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/orders/:id — single order detail
// ─────────────────────────────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        service:services!service_id(id, title, price, delivery_days, images, category),
        buyer:users!buyer_id(id, name, email, avatar_url, avatar_public_id, phone, is_phone_verified),
        seller:users!seller_id(id, name, email, avatar_url, avatar_public_id, department, phone, is_phone_verified)
      `)
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const isParty =
      order.buyer_id === req.user._id || order.seller_id === req.user._id;
    if (!isParty && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Access denied' });

    res.status(200).json({ success: true, order: mapOrder(order) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/orders/:id/deliver — seller marks as delivered
// ─────────────────────────────────────────────────────────────
router.put('/:id/deliver', protect, async (req, res) => {
  try {
    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('id, seller_id, status')
      .eq('id', req.params.id)
      .maybeSingle();

    if (fetchErr || !order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.seller_id !== req.user._id)
      return res.status(403).json({ success: false, message: 'Only the seller can mark delivery' });
    if (order.status !== 'inProgress')
      return res.status(400).json({ success: false, message: 'Order must be in progress to deliver' });

    const { data: updated, error } = await supabase
      .from('orders')
      .update({ status: 'delivered', delivered_at: new Date().toISOString(), delivery_note: req.body.deliveryNote || '' })
      .eq('id', req.params.id)
      .select('*')
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, order: mapOrder(updated) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/orders/:id/complete — buyer confirms delivery
// ─────────────────────────────────────────────────────────────
router.put('/:id/complete', protect, async (req, res) => {
  try {
    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('id, buyer_id, status')
      .eq('id', req.params.id)
      .maybeSingle();

    if (fetchErr || !order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.buyer_id !== req.user._id)
      return res.status(403).json({ success: false, message: 'Only the buyer can confirm delivery' });
    if (order.status !== 'delivered')
      return res.status(400).json({ success: false, message: 'Order must be delivered first' });

    const { data: updated, error } = await supabase
      .from('orders')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select('*')
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, order: mapOrder(updated) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/orders/:id/dispute — buyer opens a dispute
// ─────────────────────────────────────────────────────────────
router.put('/:id/dispute', protect, async (req, res) => {
  try {
    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('id, buyer_id, status')
      .eq('id', req.params.id)
      .maybeSingle();

    if (fetchErr || !order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.buyer_id !== req.user._id)
      return res.status(403).json({ success: false, message: 'Only the buyer can open a dispute' });
    if (!['inProgress', 'delivered'].includes(order.status))
      return res.status(400).json({ success: false, message: 'Cannot dispute this order' });

    const { data: updated, error } = await supabase
      .from('orders')
      .update({ status: 'disputed', dispute_reason: req.body.reason || 'No reason provided' })
      .eq('id', req.params.id)
      .select('*')
      .single();

    if (error) throw error;
    res.status(200).json({ success: true, order: mapOrder(updated) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
