import React from "react";
import { Link } from "react-router-dom";
import { teamDetails } from "../constants";
import {
  Linkedin,
  Twitter,
  Github,
  Send,
  Disc,
  ArrowRight,
} from "lucide-react";
import Navbar from "./Navbar";

const SOCIAL = [
  {
    Icon: Github,
    href: "",
    label: "GitHub",
  },
  {
    Icon: Twitter,
    href: "https://x.com/AIDev_Sumit",
    label: "Twitter",
  },
  {
    Icon: Linkedin,
    href: "https://www.linkedin.com/in/sumit-kumar-64484a2b2/",
    label: "LinkedIn",
  },
];

const FOOTER_LINKS = {
  Features: [
    { label: "AI Price Prediction", to: "/dashboard/price-prediction" },
    { label: "Fare Calendar", to: "/dashboard/fare-calendar" },
    { label: "Smart Price Alerts", to: "/dashboard/alerts" },
    { label: "Route Analytics", to: "/dashboard/market-analytics" },
  ],
  Company: [
    { label: "How It Works", to: "/working" },
    { label: "About Us", to: "/about" },
  ],
};

const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white">
      <Navbar />

      {children}

      {/* ══════════════════════════════════════════
          NEW FOOTER
      ══════════════════════════════════════════ */}
      <footer className="relative border-t rounded-4xl border-white/10 bg-[#0a0a1b] py-16 px-4 sm:px-8 flex-wrap overflow-hidden">
        {/* Background decorations */}
        
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.04)_0%,transparent_60%)]" />
        </div>
        <div className="absolute -bottom-0 -left-12 w-40 h-60 bg-gradient-to-br from-blue-500/30 to-indigo-600/30 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-0 right-0 w-40 h-60 bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-16">
          {/* Left Section: Logo, Description, Socials */}
          <div className="md:col-span-4 flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/logos/farelens_logo-.png"
                alt="FareLens Logo"
                className="w-10 h-10"
              />
              <span className="text-xl font-bold text-white">FareLens</span>
            </Link>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              Smart flight comparison powered by AI. Find better routes, cheaper
              fares, and save hours.
            </p>
            <div className="flex items-center gap-3">
              {SOCIAL.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="group flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-[#A1A1AA] transition-all duration-300 hover:scale-110 hover:bg-[#008AD2]/10 hover:text-[#008AD2]"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Center Section: Links */}
          <div className="md:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <div key={title}>
                <h3 className="text-sm font-semibold text-white mb-4">
                  {title}
                </h3>
                <ul className="space-y-3">
                  {links.map(({ label, to }) => (
                    <li key={label}>
                      <Link
                        to={to}
                        className="group relative text-sm text-[#A1A1AA] transition-colors duration-300 hover:text-[#008AD2]"
                      >
                        {label}
                        <span className="absolute bottom-0 left-0 h-px w-0 bg-[#008AD2] transition-all duration-300 group-hover:w-full" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Right Section: Newsletter */}
          <div className="md:col-span-3">
            <div className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
              <h3 className="text-sm font-semibold text-white">Stay Updated</h3>
              <p className="mt-1 text-sm text-[#A1A1AA]">
                Get product updates and travel tips.
              </p>
              <form className="mt-4 flex flex-col gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-lg border border-white/10 bg-[#0B0B0F] px-4 py-2 text-sm text-white placeholder:text-[#71717A] transition-all duration-300 focus:border-[#008AD2] focus:outline-none focus:ring-2 focus:ring-[#008AD2]/50"
                />
                <button
                  type="submit"
                  className="group flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#0b9fef] to-[#008AD2] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#008AD2]/20 transition-all duration-300 hover:shadow-xl hover:shadow-[#008AD2]/30 hover:-translate-y-0.5"
                >
                  Subscribe <ArrowRight size={16} />
                </button>
              </form>
              <p className="mt-3 text-xs text-[#71717A] text-center">We never spam.</p>
            </div>
          </div>
        </div>

        {/* Bottom Divider & Copyright */}
        <div className="mx-auto max-w-7xl mt-16 border-t border-white/10 pt-8 flex flex-col-reverse items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-[#71717A]">
            © {new Date().getFullYear()} FareLens. Built with ❤️ for travelers.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <Link to="#" className="text-[#A1A1AA] hover:text-white">
              Terms
            </Link>
            <Link to="#" className="text-[#A1A1AA] hover:text-white">
              Privacy
            </Link>
            <Link to="#" className="text-[#A1A1AA] hover:text-white">
              Cookies
            </Link>
            {/* <a
              href="#"
              className="flex items-center gap-1.5 text-[#A1A1AA] hover:text-white"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
              </span>
              Status
            </a> */}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
