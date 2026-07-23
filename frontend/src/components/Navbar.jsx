import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

/** Public-site navbar — shared by every public marketing page (landing,
 * features, working) via PublicLayout. Kept as its own component so it
 * can be reused or swapped independently of the page layout/footer. */
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed z-50 transition-all duration-300 ${scrolled
          ? "top-0 left-0 right-0 sm:top-4 sm:left-30 sm:right-30 bg-white/5 sm:bg-white/5 backdrop-blur-xl border-b sm:border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] sm:rounded-4xl "
          : "top-2 left-0 right-0 bg-transparent border-b border-transparent"
        }`}
    >
      <div className="max-w-300 mx-auto flex items-center justify-between px-4 sm:px-8 h-15">
        <a href="/" className="flex items-center gap-3">
          <img
            src="/logos/farelens_logo-.png"
            alt="FareLens Logo"
            className="w-12 h-12 mt-1"
          />
          <span className="text-xl ml-1 font-extrabold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
            FareLens
          </span>
        </a>

        <nav className="hidden sm:flex items-center gap-10 text-sm font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
          <a
            href="/#features"
            className="change-on-hover hover-to-scale transition-colors duration-300"
          >
            Features
          </a>
          <Link
            to="/working"
            className="change-on-hover hover-to-scale transition-colors duration-300"
          >
            Workflow
          </Link>
          <Link
            to="/about"
            className="change-on-hover hover-to-scale transition-colors duration-300"
          >
            About Us
          </Link>
          {/* "Dashboard" goes directly to /dashboard now. ProtectedRoute handles redirection to /login if needed. */}
          <Link
            to="/dashboard"
            className="change-on-hover hover-to-scale transition-colors duration-300"
          >
            Dashboard
          </Link>
        </nav>
        {/* Figma spec: width 160 / height 52 / radius 48 / border 1px / opacity 1 */}

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              to="/dashboard"
              className="group relative flex items-center gap-2.5 px-3 sm:px-4 h-9 rounded-full bg-white/5 text-gray-300 font-semibold backdrop-blur-md transition-all duration-300 ease-in-out border border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:border-white/40 hover:text-white hover:-translate-y-0.5"
            >
              <div className="w-5.5 h-5.5 rounded-full bg-cyan-500 flex items-center justify-center text-xs font-bold text-white uppercase shadow-sm">
                {user.name ? user.name[0] : user.email[0]}
              </div>
              <span className="relative text-sm max-w-[120px] truncate hidden sm:inline-block">{user.name || user.email.split('@')[0]}</span>
            </Link>
          ) : (
            <div className="hidden sm:flex items-center gap-1">
              <Link
                to="/login"
                className="group relative flex items-center justify-center w-25 h-9 rounded-l-full bg-white/5 text-gray-300 font-semibold backdrop-blur-md transition-all duration-300 ease-in-out
                         border border-white/20
                         hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:border-white/40 hover:text-white hover:-translate-y-0.5"
              >
                <div className="absolute inset-0 rounded-l-full bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="relative text-sm">LogIn</span>
              </Link>
              <Link
                to="/register"
                className="group relative flex items-center justify-center w-25 h-9 rounded-r-full bg-cyan-500 text-gray-100 font-bold backdrop-blur-md transition-all duration-300 ease-in-out
                         border border-white/20
                         hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:border-white/40 hover:text-white hover:-translate-y-0.5"
              >
                <div className="absolute inset-0 rounded-r-full bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <span className="relative text-sm">SignUp</span>
              </Link>
            </div>
          )}
          
          {/* Mobile Hamburger */}
          <button
            className="sm:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden absolute top-full left-0 right-0 bg-[#0B0B0F]/95 backdrop-blur-xl border-b border-white/10 py-4 px-4 flex flex-col gap-4 shadow-xl">
          <a
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="text-white font-medium text-sm px-2 py-2 hover:bg-white/5 rounded-lg"
          >
            Features
          </a>
          <Link
            to="/working"
            onClick={() => setMobileMenuOpen(false)}
            className="text-white font-medium text-sm px-2 py-2 hover:bg-white/5 rounded-lg"
          >
            Workflow
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="text-white font-medium text-sm px-2 py-2 hover:bg-white/5 rounded-lg"
          >
            About Us
          </Link>
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="text-white font-medium text-sm px-2 py-2 hover:bg-white/5 rounded-lg"
          >
            Dashboard
          </Link>

          {!user && (
            <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-white/10">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-full h-11 rounded-full bg-white/5 text-white font-semibold border border-white/20"
              >
                Log In
              </Link>
              <Link
                to="/SignUp"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-full h-11 rounded-full bg-cyan-500 text-white font-bold"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
