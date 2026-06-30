import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const VerifyEmail = () => {
    const { verifyEmail } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('verifying'); // verifying | success | error

    useEffect(() => {
        if (!token) {
            setStatus('error');
            return;
        }
        verifyEmail(token)
            .then(() => {
                setStatus('success');
                setTimeout(() => navigate('/login'), 1500);
            })
            .catch(() => setStatus('error'));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    return (
        <div className="fixed inset-0 z-10 overflow-hidden flex items-center justify-between gap-4 sm:gap-6 px-4 sm:px-12 lg:px-24 py-6">
            {/* Same rotated-photo background as Login/Signup/ForgotPassword — source photo is
                portrait (736x920), rotated -90deg to fill this landscape page, sized in vmax +
                centered via translate so it always covers the viewport on any screen size. */}
            <img
                src="/Image/Auth.jpg"
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
                    className="relative w-full p-8 sm:p-14 text-white backdrop-blur-xl text-center"
                    style={{
                        borderRadius: 13,
                        background: 'rgba(212, 212, 212, 0.10)',
                    }}
                >
                    <h1 className="text-4xl sm:text-5xl font-bold mb-2">
                        {status === 'verifying' && 'Verifying your email...'}
                        {status === 'success' && 'Email verified!'}
                        {status === 'error' && 'Verification failed'}
                    </h1>
                    <p className="text-base text-white/70">
                        {status === 'verifying' && 'One moment while we confirm your account.'}
                        {status === 'success' && 'Redirecting you to sign in...'}
                        {status === 'error' && 'That link is invalid or has expired.'}
                    </p>

                    {status === 'error' && (
                        <p className="text-sm text-white/70 mt-8">
                            <Link to="/login" className="underline font-semibold hover:text-white transition-colors duration-300">
                                Back to sign in
                            </Link>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
