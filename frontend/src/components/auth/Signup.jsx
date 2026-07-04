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
        <div className="fixed w-full h-full z-10 flex flex-col justify-center items-center lg:items-end bg-[url('/Image/authImg2.jpg')] bg-cover bg-center">
            
            <div className="flex flex-col items-center gap-6 w-full px-4 sm:px-0 lg:mr-45 lg:w-auto">

            <a
                href="/"
                className=" flex gap-2 text-white/70 hover:text-white transition-colors duration-300 items-center mb-4"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-move-left"><path d="M6 8L2 12L6 16"/><path d="M2 12H22"/></svg>
                Back to landing page
            </a>

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
                    <p className="text-center mb-1 text-lg tracking-wider">FareLens</p>
                    <h1 className="text-4xl sm:text-5xl font-bold text-center mb-2">
                        Create account
                    </h1>
                    <p className="text-base text-white/70 text-center mb-10">
                        Please enter your details
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
