
import { useState } from 'react';
import {
  BookOpen,
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  LibraryBig,
  BookMarked,
  Sparkles
} from 'lucide-react';

import {
  Routes,
  Route,
  Navigate,
  useNavigate
} from 'react-router-dom';

import './App.css';

import { useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

import MemberDashboard from './pages/member/MemberDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import BrowseBooks from './pages/member/BrowseBooks';
import MyReservations from './pages/member/MyReservations';
import BorrowingHistory from './pages/member/BorrowingHistory';
import MyFines from './pages/member/MyFines';
import AdminBooks from './pages/admin/AdminBooks';
import AdminBookCopies from './pages/admin/AdminBookCopies';
import AdminMembers from './pages/admin/AdminMembers';
import AdminBorrowRecords from './pages/admin/AdminBorrowRecords';
import AdminReservations from './pages/admin/AdminReservations';
import AdminFines from './pages/admin/AdminFines';
import AdminCategories from './pages/admin/AdminCategories';
import Register from './pages/auth/Register';
import MemberProfile from './pages/member/MemberProfile';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const user = await login({
        email: email.trim(),
        password: password
      });

      console.log('Authenticated user:', user);

      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'MEMBER') {
        navigate('/member/dashboard', { replace: true });
      } else {
        setError('Unknown user role. Please contact the administrator.');
      }

    } catch (error) {
      console.error('Login error:', error);

      if (error.response) {
        setError(
          error.response.data.message || 'Invalid email or password.'
        );
      } else {
        setError('Unable to connect to the server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">

      {/* Left Branding Section */}
      <section className="login-visual">

        <div className="brand">
          <div className="brand-icon">
            <BookOpen size={25} />
          </div>
          <span>
            Library<span className="brand-highlight">Hub</span>
          </span>
        </div>

        <div className="visual-content">
          <span className="welcome-label">
            <Sparkles size={15} />
            YOUR DIGITAL LIBRARY
          </span>

          <h1>
            Discover a world
            <br />
            of <span>knowledge.</span>
          </h1>

          <p>
            Your next great read is just a page away.
            Explore, discover and manage your reading
            journey with LibraryHub.
          </p>

          <div className="book-illustration">
            <div className="illustration-glow"></div>

            <div className="floating-book book-one">
              <BookOpen size={39} />
            </div>

            <div className="floating-book book-two">
              <BookMarked size={31} />
            </div>

            <div className="main-book">
              <div className="book-cover">
                <LibraryBig size={63} strokeWidth={1.2} />
                <span>LIBRARYHUB</span>
                <small>KNOWLEDGE • DISCOVERY</small>
              </div>
            </div>

            <div className="floating-dot dot-one"></div>
            <div className="floating-dot dot-two"></div>
            <div className="floating-dot dot-three"></div>
          </div>
        </div>

        <div className="visual-footer">
          <span>Read more. Discover more. Grow more.</span>
          <span>© 2026 LibraryHub</span>
        </div>

      </section>

      {/* Right Login Section */}
      <section className="login-form-section">

        <div className="mobile-brand">
          <div className="brand-icon">
            <BookOpen size={23} />
          </div>
          <span>
            Library<span className="brand-highlight">Hub</span>
          </span>
        </div>

        <div className="login-form-wrapper">

          <div className="form-heading">
            <span className="form-tag">WELCOME BACK</span>
            <h2>Sign in to your account</h2>
            <p>
              Enter your details to access your LibraryHub account.
            </p>
          </div>

          <form onSubmit={handleLogin}>

            <div className="form-group">
              <label htmlFor="email">Email address</label>

              <div className="input-wrapper">
                <Mail size={19} className="input-icon" />

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="password-label">
                <label htmlFor="password">Password</label>
                <a href="#forgot-password">Forgot password?</a>
              </div>

              <div className="input-wrapper">
                <Lock size={19} className="input-icon" />

                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-option">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <span>Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
              {!loading && <ArrowRight size={19} />}
            </button>

            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}

            {message && (
              <p className="form-message" role="status">
                {message}
              </p>
            )}

          </form>

          <div className="register-link">
            Don't have an account?
            <a href="/register"> Create account</a>
          </div>

          <div className="security-note">
            <Lock size={14} />
            Secure access to your personal library
          </div>

        </div>

      </section>

    </main>
  );
}

function App() {
  return (
    <Routes>


      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<LoginPage />} />

      {/* Member Protected Routes */}
      <Route element={<ProtectedRoute allowedRole="MEMBER" />}>

        <Route
          path="/member/dashboard"
          element={<MemberDashboard />}
        />

        <Route
          path="/member/profile"
          element={<MemberProfile />}
        />

        <Route
          path="/member/books"
          element={<BrowseBooks />}
        />
        <Route
          path="/member/reservations"
          element={<MyReservations />}
        />

        <Route
          path="/member/history"
          element={<BorrowingHistory />}
        />

        <Route
          path="/member/fines"
          element={<MyFines />}
        />

      </Route>

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRole="ADMIN" />}>
        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/books"
          element={<AdminBooks />}
        />

        <Route
          path="/admin/categories"
          element={<AdminCategories />}
        />

        <Route
          path="/admin/book-copies"
          element={<AdminBookCopies />}
        />

        <Route
          path="/admin/members"
          element={<AdminMembers />}
        />

        <Route
          path="/admin/borrow-records"
          element={<AdminBorrowRecords />}
        />

        <Route
          path="/admin/reservations"
          element={<AdminReservations />}
        />

        <Route
          path="/admin/fines"
          element={<AdminFines />}
        />
      </Route>

      {/* Unknown Routes */}
      <Route path="*" element={<Navigate to="/login" replace />} />

      <Route path="/register" element={<Register />} />

    </Routes>
  );
}

export default App;
