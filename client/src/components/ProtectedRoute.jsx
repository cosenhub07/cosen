import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function ProtectedRoute({ children }) {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 1. Email Verification Check
  if (!user.isEmailVerified && location.pathname !== '/verify-email') {
    return <Navigate to="/verify-email" replace />;
  }
  
  // If verified but trying to access the verify-email page
  if (user.isEmailVerified && location.pathname === '/verify-email') {
    return <Navigate to="/onboarding" replace />;
  }

  // 2. Onboarding Check - Removed global gating to allow exploration
  // If onboarding is complete but trying to access the onboarding page
  if (user.isOnboardingComplete && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
