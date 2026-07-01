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
        </div>
    );
};

export default VerifyEmail;
