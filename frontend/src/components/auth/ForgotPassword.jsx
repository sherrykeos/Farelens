git pull origin mainimport React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { forgotPassword } from '../../api/client';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [devToken, setDevToken] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await forgotPassword(email);
            setSubmitted(true);
            setDevToken(result.dev_reset_token || null);
            toast.success(result.detail);
        } catch {
            toast.error('Something went wrong. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-10 overflow-hidden flex items-center justify-between gap-4 sm:gap-6 px-4 sm:px-12 lg:px-24 py-6">
            {/* Same rotated-photo background as Login/Signup — source photo is portrait
                (736x920), rotated -90deg to fill this landscape page, sized in vmax +
                centered via translate so it always covers the viewport on any screen size. */}
            <img
                src="/Image/auth1.png"
                alt=""
                className="absolute"
                style={{
                    width: '140vmax',
                    maxWidth: 'none',
                    height: '175vmax',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%) rotate(-90deg)',
                    opacity: 1,
                    objectFit: 'cover',
                }}
            />
            <div className="relative z-10 flex items-center gap-2 sm:gap-3 shrink-0">
                <span
                    style={{ fontFamily: "'Dancing Script', cursive" }}
                    className="text-2xl sm:text-4xl lg:text-6xl text-white"
                >
                    FareLens
                </span>
            </div>

            <div className="relative z-10 w-lg shadow-2xl" style={{ maxWidth: 716 }}>
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
                    className="relative w-full p-8 sm:p-14 text-white backdrop-blur-xl"
                    style={{
                        borderRadius: 13,
                        background: 'rgba(212, 212, 212, 0.10)',
                    }}
                >
                    <h1 className="text-4xl sm:text-5xl font-bold text-center mb-2">Reset your password</h1>
                    <p className="text-base text-white/70 text-center mb-10">
                        Enter your email and we'll send you a reset link
                    </p>

                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-7">
                            <div>
                                <label className="block text-base font-semibold mb-2">E-mail</label>
                                <input
                                    type="email"
                                    className="w-full bg-transparent border-b border-white/40 pb-3 text-lg text-white placeholder-white/40 focus:outline-none focus:border-white"
                                    placeholder="Enter Your E-mail Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="mx-auto mt-2 px-12 py-3.5 rounded-full border border-white/50 text-lg text-white font-semibold hover:bg-white/10 transition-colors duration-300"
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>
                    ) : (
                        <div className="flex flex-col gap-5">
                            <p className="text-center text-white/80">
                                If that email is registered, a reset link has been sent.
                            </p>
                            {devToken && (
                                <>
                                    <div className="rounded-lg border border-white/20 bg-white/10 p-4 text-sm text-white/80 break-all">
                                        <strong className="block text-white mb-1">
                                            No email provider configured — dev token
                                        </strong>
                                        {devToken}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/reset-password?token=${encodeURIComponent(devToken)}`)}
                                        className="mx-auto px-12 py-3.5 rounded-full border border-white/50 text-lg text-white font-semibold hover:bg-white/10 transition-colors duration-300"
                                    >
                                        Continue to reset password
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    <p className="text-center text-sm text-white/70 mt-8">
                        <Link to="/login" className="underline font-semibold hover:text-white transition-colors duration-300">
                            Back to sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
