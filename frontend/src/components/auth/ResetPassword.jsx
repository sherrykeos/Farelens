import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { resetPassword } from '../../api/client';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialToken = searchParams.get('token') || '';

    const [token, setToken] = useState(initialToken);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await resetPassword(token, newPassword);
            toast.success('Password updated — sign in with your new password');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid or expired reset token');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-card">
            <div className="auth-logo">
                <ShieldCheck size={32} className="auth-logo-icon" />
            </div>
            <h1 className="auth-title gradient-text">Set a new password</h1>
            <p className="auth-subtitle">
                {initialToken ? 'Choose a new password for your account' : 'Paste your reset token and choose a new password'}
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
                {!initialToken && (
                    <div className="form-group">
                        <label className="form-label">Reset token</label>
                        <input
                            type="text"
                            className="input"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                )}
                <div className="form-group">
                    <label className="form-label">New password</label>
                    <input
                        type="password"
                        className="input"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        minLength={8}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Confirm new password</label>
                    <input
                        type="password"
                        className="input"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        minLength={8}
                        required
                    />
                </div>

                {error && <p className="auth-error">{error}</p>}

                <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Password'}
                </button>
            </form>

            <p className="auth-footer">
                <Link to="/login" className="auth-link">
                    Back to sign in
                </Link>
            </p>
        </div>
    );
};

export default ResetPassword;
