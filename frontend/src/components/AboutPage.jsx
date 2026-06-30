import React from 'react';
import { Link } from 'react-router-dom';
import { Plane, BrainCircuit, Database, Zap, Shield, ArrowRight, Server, Globe, BarChart2, Bell, Github, Linkedin } from 'lucide-react';
import PublicLayout from './Footer';

const TECH_STACK = [
    { icon: BrainCircuit, color: '#06b6d4', label: 'XGBoost ML',    desc: 'Gradient-boosted model trained on 300K+ real Indian domestic fare records' },
    { icon: Server,        color: '#a78bfa', label: 'FastAPI',        desc: 'High-performance Python API serving predictions with sub-100ms response times' },
    { icon: Globe,         color: '#34d399', label: 'React + Vite',   desc: 'Fast, modern frontend with Tailwind CSS and a fully responsive design' },
    { icon: Database,      color: '#fbbf24', label: 'Supabase',       desc: 'Managed PostgreSQL cloud database with connection pooling via PgBouncer' },
    { icon: Zap,           color: '#fb7185', label: 'SHAP',           desc: 'Explainable AI — every prediction shows exactly which factors drove the price' },
    { icon: Shield,        color: '#38bdf8', label: 'JWT + Brevo',    desc: 'Secure authentication with email verification and transactional email alerts' },
];

const STATS = [
    { value: '300K+',   label: 'Real flight records', sub: 'trained on' },
    { value: '95%+',    label: 'Prediction accuracy', sub: 'in range'   },
    { value: '49 Days', label: 'Prediction horizon',  sub: 'fare calendar' },
    { value: '24/7',    label: 'Monitoring',          sub: 'anomaly detection' },
];

const FEATURES = [
    { Icon: BrainCircuit, color: '#06b6d4', title: 'Price Prediction',   desc: 'XGBoost model predicts your fare before you book, with a confidence interval.' },
    { Icon: BarChart2,    color: '#34d399', title: 'Market Analytics',   desc: 'Live charts comparing Economy vs Business class prices across all routes.' },
    { Icon: Bell,         color: '#fbbf24', title: 'Smart Alerts',       desc: 'Email digests the moment a watchlisted route drops to your target price.' },
];

const AboutPage = () => (
    <PublicLayout>

        {/* ── HERO ── */}
        <section style={{ padding: '8rem 2rem 5rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            {/* Background glow */}
            <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 700, height: 400, background: 'radial-gradient(ellipse, rgba(6,182,212,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto' }}>
                {/* Badge */}
                <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '5px 14px', borderRadius: 50, marginBottom: '1.5rem',
                    background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)',
                    fontSize: '0.75rem', fontWeight: 700, color: '#67e8f9',
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                }}>
                    <Plane size={13} />
                    About FareLens
                </span>

                <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, color: 'white', margin: '0 0 1.25rem', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
                    Flight prices shouldn't be a{' '}
                    <span style={{ background: 'linear-gradient(135deg, #06b6d4, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        mystery
                    </span>
                </h1>

                <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, margin: '0 0 2.5rem', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
                    FareLens is an AI-powered flight price prediction platform built for Indian domestic travelers.
                    We use a real XGBoost machine learning model trained on 300,000+ fare records no guesses, no fabricated numbers.
                </p>

                <Link to="/register" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '13px 32px', borderRadius: 50,
                    background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
                    color: 'white', fontWeight: 700, fontSize: '1rem',
                    textDecoration: 'none', boxShadow: '0 6px 20px rgba(6,182,212,0.4)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(6,182,212,0.55)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(6,182,212,0.4)'; }}
                >
                    Try FareLens Free <ArrowRight size={17} />
                </Link>
            </div>
        </section>

        {/* ── MISSION ── */}
        <section style={{ padding: '4rem 2rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
                <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Our Mission</span>
                    <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: 'white', margin: '0.75rem 0 1.25rem', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
                        Level the playing field for every traveler
                    </h2>
                    <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, margin: '0 0 1rem' }}>
                        Airlines use sophisticated algorithms to set prices dynamically — and travelers are left guessing
                        whether to book now or wait. We built FareLens to give everyone access to the same
                        kind of data-driven insights.
                    </p>
                    <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, margin: 0 }}>
                        Every prediction comes with a confidence interval and SHAP explanation so you can
                        see <em style={{ color: 'rgba(255,255,255,0.75)', fontStyle: 'normal' }}>exactly why</em> the model reached that number — not just what it says.
                    </p>
                </div>

                {/* Feature mini-cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {FEATURES.map(({ Icon, color, title, desc }) => (
                        <div key={title} style={{
                            display: 'flex', gap: 14, alignItems: 'flex-start',
                            padding: '1.1rem 1.25rem', borderRadius: 14,
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                        }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Icon size={20} color={color} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'white', marginBottom: 4 }}>{title}</div>
                                <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* ── STATS ── */}
        <section style={{ padding: '3.5rem 2rem', background: 'rgba(6,182,212,0.04)', borderTop: '1px solid rgba(6,182,212,0.12)', borderBottom: '1px solid rgba(6,182,212,0.12)' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', fontWeight: 800, color: 'white', marginBottom: '2.5rem', letterSpacing: '-0.02em' }}>
                    Built on data. Designed for trust.
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem', textAlign: 'center' }}>
                    {STATS.map(({ value, label, sub }) => (
                        <div key={value}>
                            <div style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', marginBottom: '0.3rem' }}>{value}</div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: '0.15rem' }}>{label}</div>
                            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>{sub}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* ── TECH STACK ── */}
        <section style={{ padding: '5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.1em' }}>The Stack</span>
                    <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: 'white', margin: '0.6rem 0 0.5rem', letterSpacing: '-0.02em' }}>
                        What FareLens is built on
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', margin: 0 }}>
                        Every component chosen for reliability, speed, and real-world correctness.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                    {TECH_STACK.map(({ icon: Icon, color, label, desc }) => (
                        <div key={label} style={{
                            padding: '1.5rem', borderRadius: 16,
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            display: 'flex', gap: 14, alignItems: 'flex-start',
                            transition: 'border-color 0.3s, transform 0.3s',
                        }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}45`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}18`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 0 14px ${color}20` }}>
                                <Icon size={22} color={color} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white', marginBottom: '0.35rem' }}>{label}</div>
                                <div style={{ fontSize: '0.825rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>{desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* ── TEAM ── */}
        <section style={{ padding: '5rem 2rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fb7185', textTransform: 'uppercase', letterSpacing: '0.1em' }}>The Builders</span>
                    <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: 'white', margin: '0.6rem 0 0.5rem', letterSpacing: '-0.02em' }}>
                        Meet the team
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', margin: 0 }}>
                        Three developers, one platform — each owning their domain end-to-end.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 24 }}>

                    {/* ── Sumit Kumar – Backend ── */}
                    <div style={{ padding: '2rem', borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14, transition: 'border-color 0.3s, transform 0.3s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.4)'; e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(6,182,212,0.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                        <img
                            src="/Image/Sumit Kumar.jpg"
                            alt="Sumit Kumar"
                            style={{ width: 148, height: 148, borderRadius: 18, objectFit: 'cover', border: '2px solid rgba(6,182,212,0.45)', boxShadow: '0 0 28px rgba(6,182,212,0.25)' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <span style={{ padding: '3px 13px', borderRadius: 50, background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)', fontSize: '0.7rem', fontWeight: 700, color: '#67e8f9', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                                Backend Developer
                            </span>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', margin: 0 }}>Sumit Kumar</h3>
                            <p style={{ fontSize: '0.845rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, margin: 0 }}>
                                Architected the entire FastAPI backend powering FareLens — REST endpoints for ML inference, Supabase PostgreSQL schema design, JWT-based authentication, Brevo transactional email delivery, PgBouncer connection pooling, and the price-alert background scheduler. Every API response the frontend consumes goes through Sumit's code.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <a href="https://github.com/sumitDev11/" target="_blank" rel="noopener noreferrer" aria-label="GitHub"
                                style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'all 0.25s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(230,237,243,0.12)'; e.currentTarget.style.borderColor = 'rgba(230,237,243,0.4)'; e.currentTarget.style.color = '#e6edf3'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            ><Github size={16} /></a>
                            <a href="https://www.linkedin.com/in/sumit-kumar-64484a2b2/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
                                style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'all 0.25s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(10,102,194,0.15)'; e.currentTarget.style.borderColor = 'rgba(10,102,194,0.4)'; e.currentTarget.style.color = '#0a66c2'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            ><Linkedin size={16} /></a>
                        </div>
                    </div>

                    {/* ── Dolly – ML Model ── */}
                    <div style={{ padding: '2rem', borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14, transition: 'border-color 0.3s, transform 0.3s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(52,211,153,0.4)'; e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(52,211,153,0.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                        {/* Placeholder avatar — swap with <img> once photo is ready */}
                        <div style={{ width: 148, height: 148, borderRadius: 18, background: 'linear-gradient(135deg, rgba(52,211,153,0.2), rgba(16,185,129,0.1))', border: '2px solid rgba(52,211,153,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.8rem', fontWeight: 800, color: '#34d399', boxShadow: '0 0 28px rgba(52,211,153,0.2)' }}>
                            D
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <span style={{ padding: '3px 13px', borderRadius: 50, background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)', fontSize: '0.7rem', fontWeight: 700, color: '#34d399', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                                ML Engineer
                            </span>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', margin: 0 }}>Dolly</h3>
                            <p style={{ fontSize: '0.845rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, margin: 0 }}>
                                Built and trained the XGBoost model at the heart of FareLens — data cleaning, feature engineering on 300K+ real Indian domestic fare records, hyperparameter tuning, cross-validation, and SHAP integration that makes every prediction explainable. The accuracy and reliability of every forecast on this platform is Dolly's work.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <a href="#" aria-label="GitHub"
                                style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'all 0.25s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(230,237,243,0.12)'; e.currentTarget.style.borderColor = 'rgba(230,237,243,0.4)'; e.currentTarget.style.color = '#e6edf3'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            ><Github size={16} /></a>
                            <a href="#" aria-label="LinkedIn"
                                style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'all 0.25s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(10,102,194,0.15)'; e.currentTarget.style.borderColor = 'rgba(10,102,194,0.4)'; e.currentTarget.style.color = '#0a66c2'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            ><Linkedin size={16} /></a>
                        </div>
                    </div>

                    {/* ── Sharad Kumar – Frontend ── */}
                    <div style={{ padding: '2rem', borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14, transition: 'border-color 0.3s, transform 0.3s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(167,139,250,0.4)'; e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(167,139,250,0.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                        {/* Placeholder avatar — swap with <img> once photo is ready */}
                        <div style={{ width: 148, height: 148, borderRadius: 18, background: 'linear-gradient(135deg, rgba(167,139,250,0.2), rgba(139,92,246,0.1))', border: '2px solid rgba(167,139,250,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: '#a78bfa', boxShadow: '0 0 28px rgba(167,139,250,0.2)' }}>
                            SK
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                            <span style={{ padding: '3px 13px', borderRadius: 50, background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.3)', fontSize: '0.7rem', fontWeight: 700, color: '#a78bfa', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                                Frontend Developer
                            </span>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', margin: 0 }}>Sharad Kumar</h3>
                            <p style={{ fontSize: '0.845rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, margin: 0 }}>
                                Designed and built the complete React + Vite frontend of FareLens — the interactive dashboard, live charts, fare calendar, watchlist UI, and every public marketing page. Sharad translated the ML model's outputs into clear, visual experiences that make complex fare data immediately understandable for any traveler.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <a href="#" aria-label="GitHub"
                                style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'all 0.25s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(230,237,243,0.12)'; e.currentTarget.style.borderColor = 'rgba(230,237,243,0.4)'; e.currentTarget.style.color = '#e6edf3'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            ><Github size={16} /></a>
                            <a href="#" aria-label="LinkedIn"
                                style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'all 0.25s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(10,102,194,0.15)'; e.currentTarget.style.borderColor = 'rgba(10,102,194,0.4)'; e.currentTarget.style.color = '#0a66c2'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            ><Linkedin size={16} /></a>
                        </div>
                    </div>

                </div>
            </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ padding: '4rem 2rem 6rem' }}>
            <div style={{
                maxWidth: 760, margin: '0 auto', textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(6,182,212,0.13) 0%, rgba(2,132,199,0.1) 100%)',
                border: '1px solid rgba(6,182,212,0.22)', borderRadius: 20, padding: '3.5rem 2.5rem',
            }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
                    Ready to fly smarter?
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 400, margin: '0 auto 2rem', lineHeight: 1.7 }}>
                    Create a free account and run the live model on any Indian domestic route in seconds.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/register" style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '12px 28px', borderRadius: 50,
                        background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
                        color: 'white', fontWeight: 700, fontSize: '0.95rem',
                        textDecoration: 'none', boxShadow: '0 6px 20px rgba(6,182,212,0.4)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(6,182,212,0.55)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(6,182,212,0.4)'; }}
                    >
                        Get Started Free <ArrowRight size={16} />
                    </Link>
                    <Link to="/#features" style={{
                        display: 'inline-flex', alignItems: 'center',
                        padding: '12px 28px', borderRadius: 50,
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'rgba(255,255,255,0.8)', fontWeight: 600, fontSize: '0.95rem',
                        textDecoration: 'none', transition: 'background 0.2s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                    >
                        See All Features
                    </Link>
                </div>
            </div>
        </section>

    </PublicLayout>
);

export default AboutPage;
