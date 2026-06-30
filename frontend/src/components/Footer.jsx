import React from 'react';
import { Link } from 'react-router-dom';
import { Plane, Linkedin, Twitter, Github, ArrowRight } from 'lucide-react';
import Navbar from './Navbar';

const SOCIAL = [
    { Icon: Linkedin, href: 'https://www.linkedin.com/in/sumit-kumar-64484a2b2/', label: 'LinkedIn', color: '#0a66c2' },
    { Icon: Twitter,  href: 'https://x.com/AIDev_Sumit',  label: 'Twitter',  color: '#1d9bf0' },
    { Icon: Github,   href: 'https://github.com/sumitDev11/',   label: 'GitHub',   color: '#e6edf3' },
];

const FOOTER_LINKS = [
    {
        heading: 'Product',
        links: [
            { label: 'Features',      to: '/#features' },
            { label: 'How it Works',  to: '/working' },
            { label: 'About Us',      to: '/about' },
        ],
    },
    {
        heading: 'Get Started',
        links: [
            { label: 'Create Account',  to: '/register' },
            { label: 'Sign In',         to: '/login' },
            { label: 'Dashboard',       to: '/login' },
            { label: 'Forgot Password', to: '/forgot-password' },
        ],
    },
    {
        heading: 'Built With',
        links: [
            { label: 'XGBoost ML Model',   to: null },
            { label: 'SHAP Explanations',  to: null },
            { label: 'FastAPI + React',    to: null },
        ],
    },
];

const PublicLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-[linear-gradient(160deg,#0d1116_0%,#161c23_60%,#11161c_100%)] text-text-primary">
            <Navbar />

            {children}

            {/* ══ FOOTER ══ */}
            <footer style={{
                borderTop: '1px solid rgba(255,255,255,0.07)',
                background: 'linear-gradient(180deg, transparent 0%, rgba(5,10,20,0.6) 100%)',
                position: 'relative', overflow: 'hidden',
            }}>
                {/* Top glow line */}
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 500, height: 1, background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.5), transparent)' }} />

                {/* Main footer grid */}
                <div style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem 2rem 2.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '2.5rem', marginBottom: '3rem' }}>

                        {/* Brand column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Logo */}
                            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Plane size={18} color="#06b6d4" />
                                </div>
                                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>FareLens</span>
                            </Link>

                            {/* Tagline */}
                            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, margin: 0, maxWidth: 280 }}>
                                AI-powered flight price predictions for Indian domestic routes — built with a real XGBoost model, real SHAP explanations, and zero fabricated data.
                            </p>

                            {/* Social icons */}
                            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                                {SOCIAL.map(({ Icon, href, label, color }) => (
                                    <a
                                        key={label}
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={label}
                                        style={{
                                            width: 38, height: 38, borderRadius: '50%',
                                            background: 'rgba(255,255,255,0.06)',
                                            border: '1px solid rgba(255,255,255,0.12)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'rgba(255,255,255,0.55)',
                                            textDecoration: 'none',
                                            transition: 'all 0.25s ease',
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.background = `${color}18`;
                                            e.currentTarget.style.borderColor = `${color}55`;
                                            e.currentTarget.style.color = color;
                                            e.currentTarget.style.transform = 'translateY(-3px)';
                                            e.currentTarget.style.boxShadow = `0 6px 16px ${color}30`;
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                                            e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <Icon size={17} />
                                    </a>
                                ))}
                            </div>

                            {/* CTA chip */}
                            <Link to="/register" style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                padding: '8px 18px', borderRadius: 50, width: 'fit-content',
                                background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(2,132,199,0.15))',
                                border: '1px solid rgba(6,182,212,0.35)',
                                color: '#67e8f9', fontWeight: 600, fontSize: '0.82rem',
                                textDecoration: 'none', marginTop: 4,
                                transition: 'all 0.25s ease',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(6,182,212,0.3), rgba(2,132,199,0.25))'; e.currentTarget.style.boxShadow = '0 0 18px rgba(6,182,212,0.25)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(2,132,199,0.15))'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                Get Started Free <ArrowRight size={13} />
                            </Link>
                        </div>

                        {/* Link columns */}
                        {FOOTER_LINKS.map(({ heading, links }) => (
                            <div key={heading}>
                                <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 1.25rem' }}>
                                    {heading}
                                </h4>
                                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {links.map(({ label, to }) =>
                                        to ? (
                                            <li key={label}>
                                                <Link to={to} style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'color 0.2s' }}
                                                    onMouseEnter={e => { e.currentTarget.style.color = '#67e8f9'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
                                                >{label}</Link>
                                            </li>
                                        ) : (
                                            <li key={label}>
                                                <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.3)', cursor: 'default' }}>{label}</span>
                                            </li>
                                        )
                                    )}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Bottom bar */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>
                            © {new Date().getFullYear()} FareLens — All rights reserved.
                        </p>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)' }}>
                            Built with XGBoost · FastAPI · React · Supabase
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PublicLayout;
