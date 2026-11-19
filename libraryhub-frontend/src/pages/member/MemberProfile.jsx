
import { useEffect, useState } from 'react';
import {
    UserCircle, Mail, Phone, ShieldCheck, LockKeyhole,
    Pencil, Save, X, Eye, EyeOff, LoaderCircle
} from 'lucide-react';

import DashboardLayout from '../../layouts/DashboardLayout';
import profileService from '../../services/profileService';
import './MemberProfile.css';

function MemberProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [savingProfile, setSavingProfile] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [showPasswords, setShowPasswords] = useState(false);

    const [profileForm, setProfileForm] = useState({
        name: '',
        phone: ''
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [profileMessage, setProfileMessage] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');
    const [profileError, setProfileError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await profileService.getMyProfile();

            setProfile(data);
            setProfileForm({
                name: data.name || '',
                phone: data.phone || ''
            });
        } catch (error) {
            setProfileError(
                error.response?.data?.message || 'Unable to load profile.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleProfileChange = (e) => {
        setProfileForm({
            ...profileForm,
            [e.target.name]: e.target.value
        });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileMessage('');
        setProfileError('');

        try {
            setSavingProfile(true);

            const updatedProfile =
                await profileService.updateMyProfile(profileForm);

            setProfile(updatedProfile);
            setProfileForm({
                name: updatedProfile.name || '',
                phone: updatedProfile.phone || ''
            });

            setIsEditing(false);
            setProfileMessage('Profile updated successfully.');
        } catch (error) {
            setProfileError(
                error.response?.data?.message || 'Failed to update profile.'
            );
        } finally {
            setSavingProfile(false);
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordForm({
            ...passwordForm,
            [e.target.name]: e.target.value
        });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordMessage('');
        setPasswordError('');

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError('New password and confirm password do not match.');
            return;
        }

        if (passwordForm.newPassword.length < 8) {
            setPasswordError('Password must contain at least 8 characters.');
            return;
        }

        try {
            setChangingPassword(true);

            await profileService.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });

            setPasswordMessage('Password changed successfully.');
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            setPasswordError(
                error.response?.data?.message || 'Failed to change password.'
            );
        } finally {
            setChangingPassword(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="profile-loading">
                    <LoaderCircle className="spin-icon" size={28} />
                    <p>Loading your profile...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!profile) {
        return (
            <DashboardLayout>
                <div className="profile-error">
                    {profileError || 'Profile information is unavailable.'}
                    <button onClick={loadProfile}>Try Again</button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="member-profile-page">

                <div className="profile-page-header">
                    <div>
                        <h1>My Profile</h1>
                        <p>Manage your personal information and account security.</p>
                    </div>
                </div>

                <div className="profile-grid">

                    {/* Personal Information */}
                    <section className="profile-card">
                        <div className="profile-card-header">
                            <div className="profile-heading">
                                <div className="profile-icon">
                                    <UserCircle size={22} />
                                </div>
                                <div>
                                    <h2>Personal Information</h2>
                                    <p>Your account details</p>
                                </div>
                            </div>

                            {!isEditing && (
                                <button
                                    className="profile-edit-btn"
                                    onClick={() => {
                                        setProfileError('');
                                        setProfileMessage('');
                                        setIsEditing(true);
                                    }}
                                >
                                    <Pencil size={16} />
                                    Edit
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleProfileSubmit}>
                            <div className="profile-fields">

                                <div className="profile-field">
                                    <label>Full Name</label>
                                    <div className="profile-input-wrap">
                                        <UserCircle size={18} />
                                        <input
                                            type="text"
                                            name="name"
                                            value={profileForm.name}
                                            onChange={handleProfileChange}
                                            disabled={!isEditing}
                                            required
                                            maxLength={100}
                                        />
                                    </div>
                                </div>

                                <div className="profile-field">
                                    <label>Email Address</label>
                                    <div className="profile-input-wrap">
                                        <Mail size={18} />
                                        <input
                                            type="email"
                                            value={profile.email || ''}
                                            disabled
                                        />
                                    </div>
                                    <small>Email address cannot be changed here.</small>
                                </div>

                                <div className="profile-field">
                                    <label>Phone Number</label>
                                    <div className="profile-input-wrap">
                                        <Phone size={18} />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={profileForm.phone}
                                            onChange={handleProfileChange}
                                            disabled={!isEditing}
                                            maxLength={15}
                                        />
                                    </div>
                                </div>

                                <div className="profile-field">
                                    <label>Account Role</label>
                                    <div className="profile-input-wrap">
                                        <ShieldCheck size={18} />
                                        <input
                                            type="text"
                                            value={profile.roleName || 'MEMBER'}
                                            disabled
                                        />
                                    </div>
                                </div>

                            </div>

                            {profileMessage && (
                                <div className="profile-success">
                                    {profileMessage}
                                </div>
                            )}

                            {profileError && (
                                <div className="profile-alert-error">
                                    {profileError}
                                </div>
                            )}

                            {isEditing && (
                                <div className="profile-form-actions">
                                    <button
                                        type="button"
                                        className="profile-cancel-btn"
                                        onClick={() => {
                                            setProfileForm({
                                                name: profile.name || '',
                                                phone: profile.phone || ''
                                            });
                                            setIsEditing(false);
                                            setProfileError('');
                                        }}
                                    >
                                        <X size={16} />
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="profile-save-btn"
                                        disabled={savingProfile}
                                    >
                                        <Save size={16} />
                                        {savingProfile ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </form>
                    </section>

                    {/* Change Password */}
                    <section className="profile-card password-card">
                        <div className="profile-card-header">
                            <div className="profile-heading">
                                <div className="profile-icon security-icon">
                                    <LockKeyhole size={22} />
                                </div>
                                <div>
                                    <h2>Account Security</h2>
                                    <p>Update your password</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handlePasswordSubmit}>
                            <div className="profile-fields">

                                {[
                                    {
                                        label: 'Current Password',
                                        name: 'currentPassword'
                                    },
                                    {
                                        label: 'New Password',
                                        name: 'newPassword'
                                    },
                                    {
                                        label: 'Confirm New Password',
                                        name: 'confirmPassword'
                                    }
                                ].map((field) => (
                                    <div className="profile-field" key={field.name}>
                                        <label>{field.label}</label>
                                        <div className="profile-input-wrap password-input-wrap">
                                            <LockKeyhole size={18} />
                                            <input
                                                type={showPasswords ? 'text' : 'password'}
                                                name={field.name}
                                                value={passwordForm[field.name]}
                                                onChange={handlePasswordChange}
                                                placeholder={field.label}
                                                required
                                                minLength={field.name === 'currentPassword' ? undefined : 8}
                                                maxLength={100}
                                            />
                                            <button
                                                type="button"
                                                className="password-toggle"
                                                onClick={() => setShowPasswords(!showPasswords)}
                                                aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}
                                            >
                                                {showPasswords
                                                    ? <EyeOff size={18} />
                                                    : <Eye size={18} />
                                                }
                                            </button>
                                        </div>
                                    </div>
                                ))}

                            </div>

                            <div className="password-hint">
                                Use at least 8 characters for your new password.
                            </div>

                            {passwordMessage && (
                                <div className="profile-success">
                                    {passwordMessage}
                                </div>
                            )}

                            {passwordError && (
                                <div className="profile-alert-error">
                                    {passwordError}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="profile-save-btn password-submit-btn"
                                disabled={changingPassword}
                            >
                                <LockKeyhole size={16} />
                                {changingPassword ? 'Updating...' : 'Change Password'}
                            </button>
                        </form>
                    </section>

                </div>
            </div>
        </DashboardLayout>
    );
}

export default MemberProfile;
