import React from 'react';
import { Link } from 'react-router-dom';
import { Plane } from 'lucide-react';

/** Public-site navbar — shared by every public marketing page (landing,
 * features, working) via PublicLayout. Kept as its own component so it
 * can be reused or swapped independently of the page layout/footer. */
const Navbar = () => {
    return (
        <header className="absolute top-0 left-0 right-0 z-50">
            <div className="max-w-300 mx-auto flex items-center justify-between px-4 sm:px-8 h-20">
                <Link to="/" className="flex items-center gap-3">
                    <Plane size={28} className="text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]" />
                    <span className="text-xl font-extrabold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">FareLens</span>
                </Link>
                <nav className="hidden sm:flex items-center gap-8 text-sm font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                    <a href="/#features" className="hover:text-primary-light transition-colors duration-300">Features</a>
                    <Link to="/working" className="hover:text-primary-light transition-colors duration-300">How it Works</Link>
                    <Link to="/about" className="hover:text-primary-light transition-colors duration-300">About Us</Link>
                    {/* "Dashboard" intentionally goes to /login, not a public page — it's
                        the real authenticated dashboard, so it has to go through auth first.
                        PublicOnlyRoute then sends a logged-in user straight to "/", which
                        is the real Dashboard (its default tab). */}
                    <Link to="/login" className="hover:text-primary-light transition-colors duration-300">Dashboard</Link>
                </nav>
                {/* Figma spec: width 160 / height 52 / radius 48 / border 1px / opacity 1 */}
                <Link
                    to="/login"
                    className="flex items-center justify-center w-38 h-10 rounded-[48px] border border-cyan-300/50 bg-cyan-400/10 text-cyan-100 font-semibold backdrop-blur-[10px] hover:bg-cyan-400/20 hover:border-cyan-300/70 hover:shadow-[0_0_14px_rgba(103,232,249,0.25)] transition-all duration-300"
                >
                    Login / SignUp
                </Link>
            </div>
        </header>
    );
};

export default Navbar;
