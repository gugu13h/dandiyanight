// App.jsx - Main application with routing
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';

// Public pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import EventDetailsPage from './pages/EventDetailsPage';
import VenuePage from './pages/VenuePage';
import BookTicketsPage from './pages/BookTicketsPage';
import ContactPage from './pages/ContactPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import VolunteersPage from './pages/VolunteersPage';

// Auth pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AdminLoginPage from './pages/AdminLoginPage';

// User dashboard
import UserDashboardLayout from './pages/dashboard/UserDashboardLayout';
import UserDashboardHome from './pages/dashboard/UserDashboardHome';
import UserBookings from './pages/dashboard/UserBookings';
import UserTickets from './pages/dashboard/UserTickets';
import UserProfile from './pages/dashboard/UserProfile';
import UserNotifications from './pages/dashboard/UserNotifications';
import UserPayment from './pages/dashboard/UserPayment';

// Admin dashboard
import AdminDashboardLayout from './pages/admin/AdminDashboardLayout';
import AdminDashboardHome from './pages/admin/AdminDashboardHome';
import AdminBookings from './pages/admin/AdminBookings';
import AdminTickets from './pages/admin/AdminTickets';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPayments from './pages/admin/AdminPayments';
import AdminEventSettings from './pages/admin/AdminEventSettings';
import AdminPaymentSettings from './pages/admin/AdminPaymentSettings';
import AdminCheckIn from './pages/admin/AdminCheckIn';
import AdminReports from './pages/admin/AdminReports';
import AdminLogs from './pages/admin/AdminLogs';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<><HomePage /><Footer /></>} />
          <Route path="/about" element={<><AboutPage /><Footer /></>} />
          <Route path="/event" element={<><EventDetailsPage /><Footer /></>} />
          <Route path="/venue" element={<><VenuePage /><Footer /></>} />
          <Route path="/book" element={<><BookTicketsPage /><Footer /></>} />
          <Route path="/contact" element={<><ContactPage /><Footer /></>} />
          <Route path="/terms" element={<><TermsPage /><Footer /></>} />
          <Route path="/privacy" element={<><PrivacyPage /><Footer /></>} />
          <Route path="/volunteers" element={<><VolunteersPage /><Footer /></>} />

          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* User dashboard routes */}
          <Route path="/dashboard" element={<ProtectedRoute><UserDashboardLayout /></ProtectedRoute>}>
            <Route index element={<UserDashboardHome />} />
            <Route path="bookings" element={<UserBookings />} />
            <Route path="tickets" element={<UserTickets />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="notifications" element={<UserNotifications />} />
            <Route path="payment" element={<UserPayment />} />
          </Route>

          {/* Admin dashboard routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboardLayout /></AdminRoute>}>
            <Route index element={<AdminDashboardHome />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="tickets" element={<AdminTickets />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="event-settings" element={<AdminEventSettings />} />
            <Route path="payment-settings" element={<AdminPaymentSettings />} />
            <Route path="check-in" element={<AdminCheckIn />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="logs" element={<AdminLogs />} />
          </Route>
        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a24',
              color: '#f0f0f5',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              fontSize: '0.9rem',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#1a1a24' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#1a1a24' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
