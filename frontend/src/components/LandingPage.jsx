import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, Bell, CalendarDays, BrainCircuit, ChevronLeft, ChevronRight, LayoutDashboard, BarChart2, AlertTriangle, Bookmark } from 'lucide-react';
import PublicLayout from './Footer';

const SCREENSHOTS = [
    {
        src: '/screenshots/Dashboard.png',
        label: 'Dashboard',
        caption: 'Live model metrics and collected fare data — nothing simulated.',
        Icon: LayoutDashboard,
        color: '#06b6d4',
    },
    {
        src: '/screenshots/Price Prediction.png',
        label: 'Price Prediction',
        caption: 'XGBoost model with confidence intervals and SHAP explanations.',
        Icon: BrainCircuit,
        color: '#a78bfa',
    },
    {
        src: '/screenshots/Market Analytics.png',
        label: 'Market Analytics',
        caption: 'Average price by class, cheapest and most expensive routes.',
        Icon: BarChart2,
        color: '#34d399',
    },
];

const ScreenshotCarousel = () => {
    const [active, setActive] = useState(0);
    const prev = () => setActive(i => (i === 0 ? SCREENSHOTS.length - 1 : i - 1));
    const next = () => setActive(i => (i === SCREENSHOTS.length - 1 ? 0 : i + 1));

    return (
        <div>
            {/* Tab navigation */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {SCREENSHOTS.map(({ label, Icon, color }, i) => (
                    <button key={label} onClick={() => setActive(i)} style={{
                        padding: '10px 22px', borderRadius: 50, cursor: 'pointer',
                        background: active === i
                            ? `linear-gradient(135deg, ${color}30, ${color}18)`
                            : 'rgba(255,255,255,0.04)',
                        border: active === i
                            ? `1px solid ${color}70`
                            : '1px solid rgba(255,255,255,0.1)',
                        color: active === i ? color : 'rgba(255,255,255,0.45)',
                        fontWeight: 600, fontSize: '0.85rem',
                        display: 'flex', alignItems: 'center', gap: 8,
                        transition: 'all 0.3s ease',
                        boxShadow: active === i ? `0 0 16px ${color}25` : 'none',
                    }}>
                        <Icon size={15} />
                        {label}
                    </button>
                ))}
            </div>

            {/* Slide wrapper */}
            <div style={{ position: 'relative' }}>
                {/* Ambient glow behind frame */}
                <div style={{
                    position: 'absolute', top: '10%', left: '50%',
                    transform: 'translateX(-50%)',
                    width: '70%', height: '60%',
                    background: `radial-gradient(ellipse, ${SCREENSHOTS[active].color}20 0%, transparent 70%)`,
                    pointerEvents: 'none', transition: 'background 0.5s ease',
                    filter: 'blur(40px)',
                }} />

                {/* Slide track */}
                <div style={{ overflow: 'hidden', borderRadius: 16, position: 'relative', zIndex: 1 }}>
                    <div style={{
                        display: 'flex',
                        transform: `translateX(-${active * 100}%)`,
                        transition: 'transform 0.45s cubic-bezier(0.4,0,0.2,1)',
                    }}>
                        {SCREENSHOTS.map(({ src, label, color }) => (
                            <div key={label} style={{ minWidth: '100%' }}>
                                <div style={{
                                    borderRadius: 14, overflow: 'hidden',
                                    border: `1px solid ${color}30`,
                                    boxShadow: `0 32px 72px rgba(0,0,0,0.7), 0 0 0 1px ${color}15`,
                                }}>
                                    {/* Chrome bar */}
                                    <div style={{
                                        height: 38, background: 'rgba(13,17,22,0.98)',
                                        borderBottom: `1px solid ${color}20`,
                                        display: 'flex', alignItems: 'center', padding: '0 14px', gap: 6,
                                    }}>
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
                                        <div style={{ flex: 1, margin: '0 14px', height: 22, borderRadius: 5, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>localhost:3000 — FareLens</span>
                                        </div>
                                    </div>
                                    {/* Screenshot */}
                                    <img src={src} alt={label} style={{ width: '100%', display: 'block' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Prev / Next */}
                {[
                    { fn: prev, side: 'left', Icon: ChevronLeft },
                    { fn: next, side: 'right', Icon: ChevronRight },
                ].map(({ fn, side, Icon: ArrowIcon }) => (
                    <button key={side} onClick={fn} style={{
                        position: 'absolute', top: '50%', [side]: -22,
                        transform: 'translateY(-50%)',
                        width: 44, height: 44, borderRadius: '50%',
                        background: 'rgba(13,17,22,0.92)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: 'white', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                        transition: 'all 0.2s ease',
                        zIndex: 10,
                    }}
                        onMouseEnter={e => { e.currentTarget.style.background = `${SCREENSHOTS[active].color}22`; e.currentTarget.style.borderColor = `${SCREENSHOTS[active].color}60`; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(13,17,22,0.92)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                    >
                        <ArrowIcon size={18} />
                    </button>
                ))}
            </div>

            {/* Caption + dots */}
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', margin: '0 0 1rem' }}>
                    <span style={{ color: SCREENSHOTS[active].color, fontWeight: 700 }}>{SCREENSHOTS[active].label}</span>
                    {' — '}{SCREENSHOTS[active].caption}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                    {SCREENSHOTS.map((s, i) => (
                        <button key={i} onClick={() => setActive(i)} style={{
                            width: active === i ? 28 : 8, height: 8, borderRadius: 4,
                            border: 'none', cursor: 'pointer', padding: 0,
                            background: active === i ? s.color : 'rgba(255,255,255,0.18)',
                            transition: 'all 0.35s ease',
                        }} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const AVATARS = [
    { initial: 'A', bg: '#e74c3c' },
    { initial: 'M', bg: '#3b82f6' },
    { initial: 'R', bg: '#22c55e' },
    { initial: 'S', bg: '#f59e0b' },
];

const LandingPage = () => {
    return (
        <PublicLayout>

            {/* ══════════════════════════════════════════
                HERO — full-width background image
            ══════════════════════════════════════════ */}
            <section style={{
                position: 'relative',
                height: '100vh',
                backgroundImage: 'url(/Image/Backgroundimage.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'right center',
                backgroundRepeat: 'no-repeat',
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
            }}>
                {/* Dark overlay: solid black on left, fades to transparent on right */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to right, #050a14 0%, #050a14 30%, rgba(5,10,20,0.85) 48%, rgba(5,10,20,0.4) 65%, rgba(5,10,20,0.05) 82%, transparent 100%)',
                }} />
                {/* Top fade — dark band behind the navbar */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 140,
                    background: 'linear-gradient(to bottom, rgba(5,10,20,0.8) 0%, transparent 100%)',
                }} />

                {/* Content — paddingTop clears the 80px fixed navbar */}
                <div style={{
                    position: 'relative', zIndex: 2,
                    maxWidth: 1280, margin: '0 auto',
                    width: '100%', padding: '80px 2.5rem 0',
                }}>
                    <div style={{ maxWidth: 620 }}>

                        {/* Heading */}
                        <h1 style={{
                            margin: '0 0 1.75rem',
                            fontSize: 'clamp(0.8rem, 3.5vw, 3.2rem)',
                            fontWeight: 800,
                            lineHeight: 1.3,
                            letterSpacing: '-0.035em',
                            color: 'white',
                        }}>
                            Predict. Plan. Save.<br />
                            Fly Smarter with{' '}
                            <span style={{ color: '#06b6d4' }}>FareLens</span>
                        </h1>

                        {/* Subtitle */}
                        <p style={{
                            margin: '0 0 2.5rem',
                            fontSize: '1.08rem',
                            lineHeight: 1.75,
                            color: 'rgba(255,255,255)',
                            maxWidth: 460,
                        }}>
                            AI-powered flight price predictions, fare calendars,
                            and smart alerts that help you book at the right time
                            and never overpay again.
                        </p>

                        {/* CTA Buttons */}
                        <div style={{ display: 'flex', gap: 14, marginBottom: '3rem', flexWrap: 'wrap' }}>
                            {/* Primary */}
                            <Link to="/register" style={{
                                display: 'inline-block',
                                padding: '15px 38px',
                                borderRadius: 50,
                                background: 'linear-gradient(135deg, #06b6d4 0%, #0284c7 100%)',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '1rem',
                                textDecoration: 'none',
                                boxShadow: '0 6px 22px rgba(6,182,212,0.45)',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(6,182,212,0.6)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 22px rgba(6,182,212,0.45)'; }}
                            >Start for Free</Link>

                            {/* Secondary */}
                            <Link to="/working" style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 10,
                                padding: '15px 38px',
                                borderRadius: 50,
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.28)',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '1rem',
                                textDecoration: 'none',
                                transition: 'background 0.2s, border-color 0.2s',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)'; }}
                            >
                                <span style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    width: 24, height: 24, borderRadius: '50%',
                                    background: 'rgba(255,255,255,0.18)',
                                    flexShrink: 0,
                                }}>
                                    <Play size={11} fill="white" color="white" />
                                </span>
                                See How It Works
                            </Link>
                        </div>

                        {/* Social Proof */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            {/* Overlapping avatar circles */}
                            <div style={{ display: 'flex' }}>
                                {AVATARS.map((av, i) => (
                                    <div key={i} style={{
                                        width: 40, height: 40, borderRadius: '50%',
                                        background: av.bg,
                                        border: '2.5px solid rgba(4,8,18,0.9)',
                                        marginLeft: i > 0 ? -12 : 0,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.8rem', fontWeight: 700, color: 'white',
                                        position: 'relative', zIndex: 4 - i,
                                        flexShrink: 0,
                                    }}>{av.initial}</div>
                                ))}
                            </div>

                            {/* Stars + label */}
                            <div>
                                <div style={{ display: 'flex', gap: 3, marginBottom: 5 }}>
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} width="17" height="17" viewBox="0 0 24 24" fill="#f59e0b" xmlns="http://www.w3.org/2000/svg">
                                            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                                        </svg>
                                    ))}
                                </div>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)' }}>
                                    Loved by 10,000+ smart travelers
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════
                DASHBOARD GLIMPSE — screenshot carousel
            ══════════════════════════════════════════ */}
            <section id="features" style={{
                padding: '5rem 2rem 4.5rem',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                position: 'relative', overflow: 'hidden',
                background: 'linear-gradient(180deg, transparent 0%, rgba(6,182,212,0.05) 35%, rgba(6,182,212,0.07) 65%, transparent 100%)',
            }}>
                {/* Decorative top line */}
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 400, height: 1, background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.6), transparent)' }} />

                {/* Background grid pattern */}
                <div style={{
                    position: 'absolute', inset: 0, opacity: 0.04,
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
                    backgroundSize: '50px 50px',
                    pointerEvents: 'none',
                }} />

                {/* Left + right edge fade */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(13,17,22,0.8) 0%, transparent 8%, transparent 92%, rgba(13,17,22,0.8) 100%)', pointerEvents: 'none' }} />

                <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>

                    {/* Badge + Heading */}
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '5px 14px', borderRadius: 50, marginBottom: '1rem',
                            background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)',
                            fontSize: '0.75rem', fontWeight: 700, color: '#67e8f9',
                            letterSpacing: '0.08em', textTransform: 'uppercase',
                        }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#06b6d4', display: 'inline-block' }} />
                            Live App Preview
                        </span>
                        <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.3rem)', fontWeight: 800, color: 'white', marginBottom: '0.6rem', letterSpacing: '-0.02em', margin: '0 0 0.6rem' }}>
                            Glimpses of the{' '}
                            <span style={{ background: 'linear-gradient(135deg, #06b6d4, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dashboard</span>
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', margin: 0 }}>
                            Real screenshots of the actual running app — nothing simulated.
                        </p>
                    </div>

                    {/* Carousel */}
                    <div style={{ padding: '0 30px' }}>
                        <ScreenshotCarousel />
                    </div>

                    {/* Feature pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: '2.5rem' }}>
                        {[
                            { label: 'Price Prediction', color: '#06b6d4' },
                            { label: 'Fare Calendar', color: '#06b6d4' },
                            { label: 'Market Analytics', color: '#34d399' },
                            { label: 'Anomaly Detection', color: '#fb7185' },
                            { label: 'Watchlists', color: '#a78bfa' },
                            { label: 'Price Alerts', color: '#fbbf24' },
                            { label: 'Saved Searches', color: '#06b6d4' },
                            { label: 'SHAP Explanations', color: '#34d399' },
                        ].map(({ label, color }) => (
                            <span key={label} style={{
                                padding: '6px 16px', borderRadius: 50,
                                background: `${color}0f`,
                                border: `1px solid ${color}35`,
                                color: 'rgba(255,255,255,0.7)',
                                fontSize: '0.8rem', fontWeight: 500,
                            }}>{label}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════
                TOP 6 FEATURES — 2×3 grid
            ══════════════════════════════════════════ */}
            <section style={{ padding: '5rem 2rem', position: 'relative', overflow: 'hidden' }}>
                {/* Decorative radial glow */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 900, height: 500, background: 'radial-gradient(ellipse, rgba(6,182,212,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

                <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    {/* Heading */}
                    <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '5px 14px', borderRadius: 50, marginBottom: '1rem',
                            background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)',
                            fontSize: '0.75rem', fontWeight: 700, color: '#c4b5fd',
                            letterSpacing: '0.08em', textTransform: 'uppercase',
                        }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', display: 'inline-block' }} />
                            What FareLens Gives You
                        </span>
                        <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.3rem)', fontWeight: 800, color: 'white', margin: '0 0 0.6rem', letterSpacing: '-0.02em' }}>
                            Every tool you need to{' '}
                            <span style={{ background: 'linear-gradient(135deg, #a78bfa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>fly smarter</span>
                        </h2>
                        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.95rem', margin: 0 }}>
                            Six features. One platform. Powered by real machine learning.
                        </p>
                    </div>

                    {/* 2×3 grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
                        {[
                            {
                                Icon: BrainCircuit,
                                color: '#06b6d4', bg: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.3)',
                                title: 'Price Prediction',
                                desc: 'Our XGBoost model trained on 300K+ Indian domestic fares predicts your fare with a low-to-high confidence range — so you know how much to trust the number.',
                                tag: 'ML POWERED',
                            },
                            {
                                Icon: CalendarDays,
                                color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)',
                                title: 'Fare Calendar',
                                desc: 'Browse 49 upcoming travel dates at once and see the predicted fare for each day on one screen. Spot the cheapest window in seconds without running multiple searches.',
                                tag: '49-DAY VIEW',
                            },
                            {
                                Icon: BarChart2,
                                color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)',
                                title: 'Market Analytics',
                                desc: 'Compare average prices across Economy and Business class, discover the cheapest and most expensive routes, and track route popularity — all from live collected data.',
                                tag: 'LIVE DATA',
                            },
                            {
                                Icon: Bell,
                                color: '#38bdf8', bg: 'rgba(56,189,248,0.12)', border: 'rgba(56,189,248,0.3)',
                                title: 'Price Alerts',
                                desc: 'Set a target price for any watchlisted route. The moment fares drop to or below your number, you get an email digest listing every matching travel date.',
                                tag: 'EMAIL ALERTS',
                            },
                            {
                                Icon: AlertTriangle,
                                color: '#fb7185', bg: 'rgba(251,113,133,0.12)', border: 'rgba(251,113,133,0.3)',
                                title: 'Anomaly Detection',
                                desc: 'Our system automatically flags routes where prices spike or crash beyond normal variation, so you always know when something unusual is happening in the market.',
                                tag: 'AUTO DETECTION',
                            },
                            {
                                Icon: Bookmark,
                                color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)',
                                title: 'Watchlists',
                                desc: 'Add any route and travel class to your personal watchlist. We track it 24/7 and check live prices every 6 hours automatically — no manual searching needed.',
                                tag: '24/7 TRACKING',
                            },
                        ].map(({ Icon, color, bg, border, title, desc, tag }) => (
                            <div key={title} style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: 18, padding: '1.75rem',
                                display: 'flex', flexDirection: 'column', gap: '1rem',
                                transition: 'border-color 0.3s, transform 0.3s, box-shadow 0.3s',
                                position: 'relative', overflow: 'hidden',
                            }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = `${color}50`;
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = `0 20px 48px rgba(0,0,0,0.3), 0 0 0 1px ${color}20`;
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                {/* Corner glow */}
                                <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`, pointerEvents: 'none' }} />

                                {/* Icon + tag row */}
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                    <div style={{
                                        width: 52, height: 52, borderRadius: 14,
                                        background: bg, border: `1px solid ${border}`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: `0 0 20px ${color}25`,
                                    }}>
                                        <Icon size={24} color={color} />
                                    </div>
                                    <span style={{
                                        fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.1em',
                                        color, padding: '3px 8px', borderRadius: 4,
                                        background: bg, border: `1px solid ${border}`,
                                    }}>{tag}</span>
                                </div>

                                {/* Text */}
                                <div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'white', margin: '0 0 0.5rem' }}>{title}</h3>
                                    <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.52)', lineHeight: 1.7, margin: 0 }}>{desc}</p>
                                </div>

                                {/* Bottom link */}
                                <Link to="/register" style={{ color, fontSize: '0.825rem', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 'auto' }}>
                                    Try it free <ArrowRight size={13} />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════
                STATS BAR
            ══════════════════════════════════════════ */}
            <section style={{
                padding: '3.5rem 2rem',
                background: 'rgba(6,182,212,0.04)',
                borderTop: '1px solid rgba(6,182,212,0.12)',
                borderBottom: '1px solid rgba(6,182,212,0.12)',
            }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <h2 style={{
                        textAlign: 'center', fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)',
                        fontWeight: 800, color: 'white', marginBottom: '2.5rem', letterSpacing: '-0.02em',
                    }}>
                        Built on data. Designed for trust.
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '2rem', textAlign: 'center' }}>
                        {[
                            { stat: '300K+',   label: 'Real flight records\ntrained on' },
                            { stat: '95%+',    label: 'Prediction accuracy\nin range' },
                            { stat: '49 Days', label: 'Reliable prediction\nhorizon' },
                            { stat: '24/7',    label: 'Monitoring & anomaly\ndetection' },
                        ].map(({ stat, label }) => (
                            <div key={stat}>
                                <div style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>{stat}</div>
                                <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.55, whiteSpace: 'pre-line' }}>{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════
                CTA BANNER
            ══════════════════════════════════════════ */}
            <section style={{ padding: '4rem 2rem 6rem' }}>
                <div style={{
                    maxWidth: 860, margin: '0 auto',
                    background: 'linear-gradient(135deg, rgba(6,182,212,0.13) 0%, rgba(2,132,199,0.13) 100%)',
                    border: '1px solid rgba(6,182,212,0.22)',
                    borderRadius: 20, padding: '3.5rem 2.5rem', textAlign: 'center',
                }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'white', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
                        Ready to see a real price prediction?
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.55)', maxWidth: 420, margin: '0 auto 2rem' }}>
                        Create a free account and run the live model on any route in seconds.
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
                        Get Started Free <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

        </PublicLayout>
    );
};

export default LandingPage;
