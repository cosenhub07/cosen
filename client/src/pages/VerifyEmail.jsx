import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, CheckCircle, AlertCircle, Loader, RefreshCw } from 'lucide-react';
import useAuthStore from '../store/authStore';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { verifyOtp, resendOtp, user, clearError, error: authError } = useAuthStore();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState('');
  const inputRefs = useRef([]);

  const handleChange = (index, value) => {
    setLocalError('');
    clearError();
    const newOtp = [...otp];
    // Allow only numbers
    if (!/^[0-9]*$/.test(value)) return;
    
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) {
      setLocalError('Please enter all 6 digits.');
      return;
    }
    
    setLoading(true);
    const result = await verifyOtp(code);
    setLoading(false);
    
    if (result.success) {
      setSuccess('Email verified successfully!');
      setTimeout(() => navigate('/onboarding'), 1500);
    }
  };

  const handleResend = async () => {
    setLocalError('');
    clearError();
    setSuccess('');
    setResendLoading(true);
    const result = await resendOtp();
    setResendLoading(false);
    
    if (result.success) {
      setSuccess('A new OTP has been sent to your email.');
    }
  };

  const displayError = localError || authError;

  return (
    <div className="auth-page">
      <div className="auth-grid" aria-hidden="true" />
      <div className="auth-nodes" aria-hidden="true" />
      <div className="auth-orb auth-orb-1" aria-hidden="true" />
      
      <div className="w-full max-w-md mx-auto p-6 relative z-10 pt-20 flex flex-col items-center">
        <div className="bg-[#A5A1FF]/20 p-4 rounded-full mb-6 text-[#A5A1FF]">
           <Mail className="h-8 w-8" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Check your email</h1>
        <p className="text-gray-400 text-center mb-8">
           We've sent a 6-digit verification code to<br/>
           <span className="text-white font-medium">{user?.email || 'your email'}</span>
        </p>

        <div className="auth-card w-full p-8">
           {success && (
             <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 rounded-lg px-4 py-3 mb-5 text-sm">
               <CheckCircle className="h-4 w-4 shrink-0" />
               <p>{success}</p>
             </div>
           )}
           {displayError && (
             <div className="flex items-center gap-2 bg-red-500/10 border border-red-400/30 text-red-300 rounded-lg px-4 py-3 mb-5 text-sm">
               <AlertCircle className="h-4 w-4 shrink-0" />
               <p>{displayError}</p>
             </div>
           )}

           <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex justify-between gap-2">
                 {otp.map((digit, index) => (
                   <input
                     key={index}
                     ref={(el) => (inputRefs.current[index] = el)}
                     type="text"
                     maxLength="1"
                     value={digit}
                     onChange={(e) => handleChange(index, e.target.value)}
                     onKeyDown={(e) => handleKeyDown(index, e)}
                     className="w-12 h-14 text-center text-xl font-bold bg-white/5 border border-white/10 rounded-lg focus:border-[#A5A1FF] focus:ring-1 focus:ring-[#A5A1FF] transition-all outline-none"
                   />
                 ))}
              </div>

              <button 
                type="submit" 
                disabled={loading || otp.join('').length < 6}
                className="btn-primary justify-center py-3 disabled:opacity-50"
              >
                {loading ? <Loader className="h-4 w-4 animate-spin" /> : 'Verify Email'}
              </button>
           </form>

           <div className="mt-8 pt-6 text-center border-t border-white/10">
              <p className="text-sm text-gray-400">
                Didn't receive the code?{' '}
                <button 
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="font-medium text-[#A5A1FF] hover:text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-1 mx-auto mt-1"
                >
                  {resendLoading && <RefreshCw className="h-3 w-3 animate-spin"/>} Resend Code
                </button>
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
