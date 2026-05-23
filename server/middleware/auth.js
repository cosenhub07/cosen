const jwt = require('jsonwebtoken');
const { supabase } = require('../config/db');

// Helper: map Supabase row id → _id for frontend compatibility
const mapId = (row) => (row ? { ...row, _id: row.id } : null);

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, avatar_url, avatar_public_id, department, year_of_study, bio, skills, role, rating, review_count, is_email_verified, dob, id_card_image_url, id_card_status, id_card_rejection_reason, is_suspended, instagram_url, facebook_url, youtube_url, x_url, platform_agreement_accepted, is_onboarding_complete')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }

    // Block suspended users
    if (user.is_suspended) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended for violating platform guidelines. Please contact support to appeal.' });
    }

    req.user = mapId(user);
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired.' });
  }
};


// Admin only
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Admin access required.' });
};

module.exports = { protect, adminOnly };
