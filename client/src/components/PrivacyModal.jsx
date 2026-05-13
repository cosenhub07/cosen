import { Shield, X, CheckCircle } from 'lucide-react';

export default function PrivacyModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(10,37,64,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-2xl overflow-hidden"
        style={{ maxHeight: '90vh', boxShadow: '0 -8px 60px rgba(0,0,0,0.3)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b z-10" style={{ borderColor: '#E6EBF1' }}>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-stripe-purple" />
            <span className="font-bold text-stripe-slate text-base">Privacy Policy &amp; User Agreement</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-stripe-bg transition-colors">
            <X className="h-4 w-4 text-stripe-muted" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 py-5 text-sm space-y-5" style={{ maxHeight: 'calc(90vh - 70px)', color: '#425466' }}>

          <p className="text-xs text-stripe-muted"><strong>Platform:</strong> Cosen – The Campus Marketplace Built for Students &nbsp;·&nbsp; Governed by Indian law (IT Act 2000, DPDPA 2023)</p>

          <div className="p-4 rounded-xl" style={{ background: '#635BFF08', border: '1px solid #635BFF20' }}>
            <p className="text-sm font-semibold text-stripe-slate">By creating an account you confirm that you have read, understood, and agree to this Privacy Policy and the terms described below.</p>
          </div>

          <section>
            <h3 className="font-bold text-stripe-slate mb-1">1. Who We Are</h3>
            <p>Cosen is a peer-to-peer student services marketplace connecting verified university students across India. Students can buy and sell services — from tutoring and coding to design and writing — within a trusted, campus-verified community. Contact: <strong>privacy@cosen.in</strong></p>
          </section>

          <section>
            <h3 className="font-bold text-stripe-slate mb-1">2. Information We Collect</h3>
            <p className="mb-1"><strong>You provide:</strong> Full name, university email, password (stored as a secure hash — never readable by us), profile info (department, year, photo), student ID card (for verification only), service listings, optional social links, and messages.</p>
            <p><strong>We collect automatically:</strong> Usage data, login timestamps, IP addresses, and an authentication token stored in a secure HTTP-only cookie.</p>
          </section>

          <section>
            <h3 className="font-bold text-stripe-slate mb-1">3. How We Use Your Information</h3>
            <ul className="list-disc list-inside space-y-1 text-stripe-steel">
              <li>Authentication &amp; account management</li>
              <li>Student verification via email domain and ID card</li>
              <li>Processing orders, payments (via Razorpay — we never store card/UPI details), and communications</li>
              <li>Sending verification emails and platform notifications</li>
              <li>Safety, dispute resolution, and platform improvement</li>
            </ul>
            <p className="mt-1 font-semibold text-stripe-slate">We do NOT use your information for advertising and do NOT sell your data to third parties.</p>
          </section>

          <section>
            <h3 className="font-bold text-stripe-slate mb-1">4. Student ID &amp; Sensitive Data</h3>
            <p>Your student ID image is used solely to verify your enrolled student status. It is stored securely on Cloudinary, accessible only by platform administrators for verification disputes, and deleted within 30 days of account deletion. No facial recognition or automated analysis is performed on it.</p>
          </section>

          <section>
            <h3 className="font-bold text-stripe-slate mb-1">5. Data Sharing</h3>
            <p>We share data only with: <strong>Supabase</strong> (database hosting), <strong>Cloudinary</strong> (image storage), <strong>Razorpay</strong> (payment processing), <strong>Google</strong> (if you use Google login), and our email provider. We never sell your data, share your student ID with other users, or transfer data outside India-compliant services.</p>
          </section>

          <section>
            <h3 className="font-bold text-stripe-slate mb-1">6. Cookies &amp; Sessions</h3>
            <p>We use a single essential cookie — a JWT stored in an HTTP-only cookie (protected against XSS). It contains your user ID and session info, not your password or payment details. It expires on sign-out or inactivity.</p>
          </section>

          <section>
            <h3 className="font-bold text-stripe-slate mb-1">7. Data Retention</h3>
            <ul className="list-disc list-inside space-y-1 text-stripe-steel">
              <li>Active accounts: retained while account is active</li>
              <li>Deleted accounts: PII removed within 30 days</li>
              <li>Transaction records: retained 7 years (Indian tax law)</li>
              <li>Chat history: retained 2 years for dispute support</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-stripe-slate mb-1">8. Your Rights (DPDPA 2023)</h3>
            <p>You have the right to access, correct, erase, and withdraw consent for your personal data. To exercise any right, email <strong>privacy@cosen.in</strong> with subject "Data Rights Request."</p>
          </section>

          <section>
            <h3 className="font-bold text-stripe-slate mb-1">9. Security</h3>
            <p>We use bcryptjs password hashing, HTTP-only JWT cookies, Supabase Row Level Security, Razorpay PCI DSS compliance, Cloudinary secure uploads, and HTTPS/TLS for all data in transit.</p>
          </section>

          <section>
            <h3 className="font-bold text-stripe-slate mb-1">10. Age Restrictions</h3>
            <p>Cosen is exclusively for enrolled university/college students. We do not knowingly collect data from individuals under 18. Accounts found to belong to minors will be suspended and data deleted.</p>
          </section>

          <section>
            <h3 className="font-bold text-stripe-slate mb-1">11. Policy Updates</h3>
            <p>We will notify you by email and in-app notice at least 7 days before significant changes. Continued use after the effective date constitutes acceptance.</p>
          </section>

          <section>
            <h3 className="font-bold text-stripe-slate mb-1">12. Contact</h3>
            <p><strong>Cosen Privacy Team</strong><br />Email: privacy@cosen.in &nbsp;·&nbsp; Platform: www.cosen.in<br />We respond to all privacy queries within 15 business days.</p>
          </section>

          <p className="text-xs text-stripe-muted pt-2 border-t" style={{ borderColor: '#E6EBF1' }}>
            Governed by the Information Technology Act 2000, IT (SPDI) Rules 2011, and the Digital Personal Data Protection Act 2023.
          </p>
        </div>

        {/* Footer CTA */}
        <div className="sticky bottom-0 bg-white px-6 py-4 border-t" style={{ borderColor: '#E6EBF1' }}>
          <button onClick={onClose} className="w-full btn-primary justify-center py-3">
            <CheckCircle className="h-4 w-4" /> Got it, close
          </button>
        </div>
      </div>
    </div>
  );
}
