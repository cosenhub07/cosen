import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Browse from './pages/Browse';
import ServiceDetail from './pages/ServiceDetail';
import PostService from './pages/PostService';
import Dashboard from './pages/Dashboard';
import PaymentSuccess from './pages/PaymentSuccess';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Messages from './pages/Messages';
import SellerProfile from './pages/SellerProfile';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pb-16 md:pb-0">
          <Routes>
            <Route path="/"                element={<Landing />} />
            <Route path="/login"           element={<Login />} />
            <Route path="/signup"          element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/browse"          element={<ProtectedRoute><Browse /></ProtectedRoute>} />
            <Route path="/services/new"    element={<ProtectedRoute><PostService /></ProtectedRoute>} />
            <Route path="/services/:id"    element={<ProtectedRoute><ServiceDetail /></ProtectedRoute>} />
            <Route path="/dashboard"       element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/profile"         element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/profile/:id"     element={<ProtectedRoute><SellerProfile /></ProtectedRoute>} />
            <Route path="/orders/:id"      element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
            <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
            <Route path="/onboarding"      element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/verify-email"    element={<ProtectedRoute><VerifyEmail /></ProtectedRoute>} />
            <Route path="/messages"        element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
