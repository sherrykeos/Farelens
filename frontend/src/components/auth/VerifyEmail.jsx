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
                Verify Email
            </h1>
            <div className="text-center mt-6">
                {status === 'verifying' && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-8 h-8 rounded-full border-4 border-white/20 border-t-white animate-spin" />
                        <p className="text-white/70">Verifying your email address...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-white mb-1">Email verified!</p>
                            <p className="text-white/70">Redirecting to login...</p>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </div>
                        <div>
                            <p className="text-xl font-bold text-white mb-1">Verification failed</p>
                            <p className="text-white/70 mb-6">Invalid or expired token</p>
                            <Link to="/login" className="px-8 py-3 rounded-full border border-white/50 text-white font-semibold hover:bg-white/10 transition-colors duration-300">
                                Back to sign in
                            </Link>
                        </div>
                    </div>
                )}
            </div>
            </div>
          </div>
          </div>
        </div>
    );
};

export default VerifyEmail;
