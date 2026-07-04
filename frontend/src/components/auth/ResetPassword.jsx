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
        <div className="fixed w-full h-full z-10 flex flex-col justify-center items-center lg:items-end bg-[url('/Image/authImg2.jpg')] bg-cover bg-center">
            
          <div className="flex flex-col items-center gap-6 w-full px-4 sm:px-0 lg:mr-45 lg:w-auto">

          <a
            href="/"
            className=" flex gap-2 text-white/70 hover:text-white transition-colors duration-300 items-center mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-move-left"><path d="M6 8L2 12L6 16"/><path d="M2 12H22"/></svg>
            Back to landing page
          </a>

          <div
            className="relative z-10 w-full shadow-2xl"
            style={{ maxWidth: 480 }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                borderRadius: 13,
                padding: 3,
                background:
                  "linear-gradient(135deg, rgba(217,217,217,0.76), rgba(217,217,217,0.26))",
                WebkitMask:
                  "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
              }}
            />
            <div
              className="relative w-full p-8 sm:p-14 text-white backdrop-blur-xl"
              style={{
                borderRadius: 13,
                background: "rgba(212, 212, 212, 0.10)",
              }}
            >
            <p className="text-center mb-1 text-lg tracking-wider">FareLens</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-center mb-2">
                Set password
            </h1>
            <p className="text-base text-white/70 text-center mb-10">
                {initialToken ? 'Choose a new password' : 'Paste your token & set a password'}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-7">
                {!initialToken && (
                    <div>
                        <label className="block text-base font-semibold mb-2">Reset token</label>
                        <input
                            type="text"
                            className="w-full bg-transparent border-b border-white/40 pb-3 text-lg text-white placeholder-white/40 focus:outline-none focus:border-white"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>
                )}
                <div>
                    <label className="block text-base font-semibold mb-2">New password</label>
                    <input
                        type="password"
                        className="w-full bg-transparent border-b border-white/40 pb-3 text-lg text-white placeholder-white/40 focus:outline-none focus:border-white"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        minLength={8}
                        required
                    />
                </div>
                <div>
                    <label className="block text-base font-semibold mb-2">Confirm new password</label>
                    <input
                        type="password"
                        className="w-full bg-transparent border-b border-white/40 pb-3 text-lg text-white placeholder-white/40 focus:outline-none focus:border-white"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        minLength={8}
                        required
                    />
                </div>

                {error && <p className="text-sm text-red-300 text-center">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="mx-auto mt-2 px-12 py-3.5 rounded-full border border-white/50 text-lg text-white font-semibold hover:bg-white/10 transition-colors duration-300"
                >
                    {loading ? 'Updating...' : 'Update Password'}
                </button>
            </form>

            <p className="text-center text-sm text-white/70 mt-8">
                <Link to="/login" className="underline font-semibold hover:text-white transition-colors duration-300">
                    Back to sign in
                </Link>
            </p>
            </div>
          </div>
          </div>
        </div>
    );
};

export default ResetPassword;
