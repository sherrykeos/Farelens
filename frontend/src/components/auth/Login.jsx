import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await login(email, password);
            toast.success('Welcome back!');
        } catch (err) {
            setError(err.response?.data?.detail || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-10 overflow-hidden flex items-center justify-between gap-4 sm:gap-6 px-4 sm:px-12 lg:px-24 py-6">
            {/* Figma spec rotates this portrait photo (736x920) 90deg to fill a landscape page.
                Sized in vmax + centered via translate so the rotated box always exceeds the
                viewport on any screen size, instead of the fixed px offsets which only covered
                one specific frame size and left a gap on others. */}
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
                    className="relative w-full p-8 sm:p-14 text-white backdrop-blur-xl"
                    style={{
                        borderRadius: 13,
                        background: 'rgba(212, 212, 212, 0.10)',
                    }}
                >
                <h1 className="text-4xl sm:text-5xl font-bold text-center mb-2">Welcome back</h1>
                <p className="text-base text-white/70 text-center mb-10">Please Enter Your Detail</p>

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
                    <div>
                        <label className="block text-base font-semibold mb-2">Password</label>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="w-full bg-transparent border-b border-white/40 pb-3 text-lg text-white placeholder-white/40 focus:outline-none focus:border-white"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between text-sm text-white/70">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showPassword}
                                onChange={(e) => setShowPassword(e.target.checked)}
                            />
                            see your password
                        </label>
                        <Link to="/forgot-password" className="underline hover:text-white transition-colors duration-300">
                            Forgot password?
                        </Link>
                    </div>

                    {error && <p className="text-sm text-red-300 text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="mx-auto mt-2 px-12 py-3.5 rounded-full border border-white/50 text-lg text-white font-semibold hover:bg-white/10 transition-colors duration-300"
                    >
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

                <p className="text-center text-sm text-white/70 mt-8">
                    Are you new here !{' '}
                    <Link to="/register" className="underline font-semibold hover:text-white transition-colors duration-300">
                        Click here
                    </Link>
                </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
