import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const Signup = () => {
    const { signup, verifyEmail } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const result = await signup(email, name, password);
            if (result.dev_verification_token) {
                // No real email provider configured yet (Brevo) — verify
                // immediately so the flow stays fully usable in dev/testing.
                await verifyEmail(result.dev_verification_token);
                toast.success('Account created and verified (dev mode) — please log in');
            } else {
                toast.success('Account created — check your email to verify before logging in');
            }
            navigate('/login');
        } catch (err) {
            const detail = err.response?.data?.detail;
            setError(typeof detail === 'string' ? detail : 'Could not create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-10 overflow-hidden flex">
            <img
                src="/Image/Auth2.jpg"
                alt=""
                className="absolute"
                style={{
                    width: '100%',
                    height: '100%',
                    top: 0,
                    left: 0,
                    objectFit: 'cover',
                    objectPosition: 'center',
                }}
            />
            <div className="flex-1" />
            <div className="relative z-10 w-1/2 flex flex-col items-center justify-center gap-6 py-8 px-8 overflow-y-auto">
            <div className="flex items-center">
                <span
                    style={{ fontFamily: "'Dancing Script', cursive" }}
                    className="text-4xl sm:text-5xl text-white drop-shadow-lg"
                >
                    FareLens
                </span>
            </div>

            <div className="relative z-10 w-full shadow-2xl" style={{ maxWidth: 480 }}>
                {/* Gradient ring only — masked so the center is fully cut out, instead of a
                    solid gradient div sitting behind the translucent content (which would
                    show through the 10%-opacity fill as a flat gray wash). */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        borderRadius: 13,
                        padding: 3,
                        background: 'linear-gradient(135deg, rgba(217,217,217,0.76), rgba(217,217,217,0.26))',
                        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                    }}
                />
                <div
                    className="relative w-full p-6 sm:p-10 text-white backdrop-blur-xl"
                    style={{
                        borderRadius: 13,
                        background: 'rgba(212, 212, 212, 0.10)',
                    }}
                >
                    <h1 className="text-3xl sm:text-4xl font-bold text-center mb-2">Create your account</h1>
                    <p className="text-sm text-white/70 text-center mb-6">
                        Track fares, save searches, and get real predictions
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1">Name</label>
                            <input
                                type="text"
                                className="w-full bg-transparent border-b border-white/40 pb-2 text-base text-white placeholder-white/40 focus:outline-none focus:border-white"
                                placeholder="Enter Your Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">E-mail</label>
                            <input
                                type="email"
                                className="w-full bg-transparent border-b border-white/40 pb-2 text-base text-white placeholder-white/40 focus:outline-none focus:border-white"
                                placeholder="Enter Your E-mail Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="w-full bg-transparent border-b border-white/40 pb-2 text-base text-white placeholder-white/40 focus:outline-none focus:border-white"
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={8}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Confirm password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="w-full bg-transparent border-b border-white/40 pb-2 text-base text-white placeholder-white/40 focus:outline-none focus:border-white"
                                placeholder="Re-enter your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                minLength={8}
                                required
                            />
                        </div>

                        <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showPassword}
                                onChange={(e) => setShowPassword(e.target.checked)}
                            />
                            see your password
                        </label>

                        {error && <p className="text-sm text-red-300 text-center">{error}</p>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="mx-auto mt-2 px-12 py-3.5 rounded-full border border-white/50 text-lg text-white font-semibold hover:bg-white/10 transition-colors duration-300"
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-white/70 mt-4">
                        Already have an account?{' '}
                        <Link to="/login" className="underline font-semibold hover:text-white transition-colors duration-300">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
            </div>
        </div>
    );
};

export default Signup;
