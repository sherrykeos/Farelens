import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

/** Public-site navbar — shared by every public marketing page (landing,
 * features, working) via PublicLayout. Kept as its own component so it
 * can be reused or swapped independently of the page layout/footer. */
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[rgba(13,17,22,0.7)] backdrop-blur-lg border-b border-white/10 shadow-lg rounded-b-xl"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-300 mx-auto flex items-center justify-between px-4 sm:px-8 h-20">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logos/farelens_logo-.png"
            alt="FareLens Logo"
            className="w-12 h-12 mt-1"
          />
          <span className="text-xl ml-1 font-extrabold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
            FareLens
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-8 text-sm font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
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
            How it Works
          </Link>
          <Link
            to="/about"
            className="change-on-hover hover-to-scale transition-colors duration-300"
          >
            About Us
          </Link>
          {/* "Dashboard" intentionally goes to /login, not a public page — it's
                        the real authenticated dashboard, so it has to go through auth first.
                        PublicOnlyRoute then sends a logged-in user straight to "/", which
                        is the real Dashboard (its default tab). */}
          <Link
            to="/login"
            className="change-on-hover hover-to-scale transition-colors duration-300"
          >
            Dashboard
          </Link>
        </nav>
        {/* Figma spec: width 160 / height 52 / radius 48 / border 1px / opacity 1 */}

        <div className="hidden sm:flex items-center gap-1">
          <Link
            to="/login"
            className="group relative flex items-center justify-center w-25 h-9 rounded-l-full bg-white/5 text-gray-300 font-semibold backdrop-blur-md transition-all duration-300 ease-in-out
                     border border-white/20
                     hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:border-white/40 hover:text-white hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="relative text-sm">LogIn</span>
          </Link>
          <Link
            to="/SignUp"
            className="group relative flex items-center justify-center w-25 h-9 rounded-r-full bg-cyan-500 text-gray-100 font-bold backdrop-blur-md transition-all duration-300 ease-in-out
                     border border-white/20
                     hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:border-white/40 hover:text-white hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <span className="relative text-sm">SignUp</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
