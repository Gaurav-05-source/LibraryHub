
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    BookOpen,
    User,
    Mail,
    Phone,
    Lock,
    Eye,
    EyeOff,
    UserPlus,
    ArrowLeft,
    CheckCircle2
} from 'lucide-react';

import authService from '../../services/authService';
import './Register.css';

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData(previous => ({
            ...previous,
            [name]: value
        }));

        setError('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');

        const name = formData.name.trim();
        const email = formData.email.trim();
        const phone = formData.phone.trim();

        if (!name || !email || !formData.password) {
            setError('Please fill in all required fields.');
            return;
        }

        if (name.length > 100) {
            setError('Name cannot exceed 100 characters.');
            return;
        }

        if (email.length > 150) {
            setError('Email cannot exceed 150 characters.');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        if (phone.length > 15) {
            setError('Phone number cannot exceed 15 characters.');
            return;
        }

        if (formData.password.length < 8 || formData.password.length > 100) {
            setError('Password must contain between 8 and 100 characters.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            await authService.register({
                name,
                email,
                password: formData.password,
                phone: phone || null
            });

            setSuccess('Your account has been created successfully!');

            setTimeout(() => {
                navigate('/login', {
                    state: { registered: true }
                });
            }, 1200);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data?.error ||
                'Registration failed. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">

                <div className="register-brand-panel">
                    <div className="register-brand-content">
                        <div className="register-logo">
                            <BookOpen size={25} />
                        </div>

                        <h1>LibraryHub</h1>
                        <p className="register-brand-tagline">
                            Your gateway to knowledge.
                        </p>

                        <div className="register-illustration">
                            <BookOpen size={105} strokeWidth={1.1} />
                            <div className="register-illustration-line" />
                        </div>

                        <h2>Discover. Read. Grow.</h2>
                        <p className="register-brand-description">
                            Join our library community and explore a world
                            of books, knowledge and new possibilities.
                        </p>

                        <div className="register-brand-footer">
                            A better reading experience starts here.
                        </div>
                    </div>
                </div>

                <div className="register-form-panel">
                    <div className="register-form-wrapper">

                        <Link to="/login" className="register-back-link">
                            <ArrowLeft size={16} />
                            Back to Login
                        </Link>

                        <div className="register-heading">
                            <span className="register-heading-icon">
                                <UserPlus size={21} />
                            </span>
                            <h2>Create Your Account</h2>
                            <p>
                                Register as a LibraryHub member to get started.
                            </p>
                        </div>

                        {error && (
                            <div className="register-message register-error">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="register-message register-success">
                                <CheckCircle2 size={17} />
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="register-field">
                                <label htmlFor="register-name">
                                    Full Name <span>*</span>
                                </label>

                                <div className="register-input-wrapper">
                                    <User size={18} />
                                    <input
                                        id="register-name"
                                        name="name"
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        maxLength={100}
                                        autoComplete="name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="register-field">
                                <label htmlFor="register-email">
                                    Email Address <span>*</span>
                                </label>

                                <div className="register-input-wrapper">
                                    <Mail size={18} />
                                    <input
                                        id="register-email"
                                        name="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        maxLength={150}
                                        autoComplete="email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="register-field">
                                <label htmlFor="register-phone">
                                    Phone Number
                                </label>

                                <div className="register-input-wrapper">
                                    <Phone size={18} />
                                    <input
                                        id="register-phone"
                                        name="phone"
                                        type="tel"
                                        placeholder="Enter your phone number"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        maxLength={15}
                                        autoComplete="tel"
                                    />
                                </div>
                            </div>

                            <div className="register-field">
                                <label htmlFor="register-password">
                                    Password <span>*</span>
                                </label>

                                <div className="register-input-wrapper">
                                    <Lock size={18} />
                                    <input
                                        id="register-password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Create a password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        minLength={8}
                                        maxLength={100}
                                        autoComplete="new-password"
                                        required
                                    />

                                    <button
                                        type="button"
                                        className="register-password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword
                                            ? <EyeOff size={18} />
                                            : <Eye size={18} />
                                        }
                                    </button>
                                </div>
                                <small>Use at least 8 characters.</small>
                            </div>

                            <div className="register-field">
                                <label htmlFor="register-confirm-password">
                                    Confirm Password <span>*</span>
                                </label>

                                <div className="register-input-wrapper">
                                    <Lock size={18} />
                                    <input
                                        id="register-confirm-password"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        placeholder="Confirm your password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        autoComplete="new-password"
                                        required
                                    />

                                    <button
                                        type="button"
                                        className="register-password-toggle"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showConfirmPassword
                                            ? <EyeOff size={18} />
                                            : <Eye size={18} />
                                        }
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="register-submit-btn"
                                disabled={loading}
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                                {!loading && <UserPlus size={17} />}
                            </button>
                        </form>

                        <p className="register-login-text">
                            Already have an account?{' '}
                            <Link to="/login">Sign in</Link>
                        </p>

                        <div className="register-security-note">
                            <Lock size={13} />
                            Your account password is securely encrypted.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
