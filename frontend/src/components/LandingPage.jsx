import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PublicLayout from './PublicLayout';

const LandingPage = () => {
    return (
        <PublicLayout>
            <section className="flex flex-col items-center bg-[url('/Image/Backgroundimage.jpg')] bg-cover bg-center px-4 pt-36 pb-0 text-center">
                <div
                    className="inline-block mb-6"
                    style={{ padding: 1.5, borderRadius: 12, background: 'linear-gradient(135deg, #6f93b8, #b2bed6)' }}
                >
                    <div
                        className="text-white"
                        style={{
                            padding: '10px 28px',
                            borderRadius: 10.5,
                            background: 'rgba(255, 255, 255, 0.15)',
                            fontSize: '1rem',
                            fontWeight: 700,
                            backdropFilter: 'blur(4px)',
                        }}
                    >
                        AI-Powered Flight Pricing Intelligence
                    </div>
                </div>
                <h1
                    className="text-white text-center"
                    style={{ fontSize: '2.8rem', fontWeight: 700 }}
                >
                    Predict Flight Prices Before You Book
                </h1>
                <p
                    className="text-white text-center mx-auto mt-4 mb-8"
                    style={{ fontSize: '1rem', maxWidth: 480, opacity: 0.9 }}
                >
                    Make smarter travel decisions with machine learning. Forecast airfare, discover the cheapest
                    travel dates, understand every prediction with AI explanations, and receive instant price-drop
                    alerts.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                    <Link to="/register" className="px-8 py-3 rounded-full bg-[#FF5722] hover:bg-[#e64a19] text-white font-semibold transition-colors duration-300">
                        Predict Flight Price
                    </Link>
                    <Link to="/features" className="px-8 py-3 rounded-full border border-white text-white font-semibold hover:bg-white/15 transition-colors duration-300">
                        Explore More
                    </Link>
                </div>

                <img
                    src="/Image/Airoplane.png"
                    alt=""
                    className="relative z-2 w-[90%] sm:w-105 mt-8 -mb-20"
                />
            </section>

            <section className="bg-[#f0f4f8] pt-25 pb-16 px-4">
                <div className="w-3/4 max-w-180 h-85 mx-auto rounded-2xl" style={{ background: '#1B2A4A' }} />
                <p className="text-center mt-4" style={{ fontSize: '0.85rem', color: '#4b5563' }}>
                    Glimpses of the Dashboard
                </p>
            </section>

            <section className="max-w-300 mx-auto px-4 sm:px-8 py-16 text-center">
                <div className="card bg-linear-to-br from-primary to-secondary border-none py-12 px-8">
                    <h2 className="text-3xl font-extrabold text-white mb-3">Ready to see a real price prediction?</h2>
                    <p className="text-white/80 mb-8 max-w-120 mx-auto">Create a free account and run the live model on any route in seconds.</p>
                    <Link to="/register" className="btn bg-white text-primary-dark font-bold hover:bg-white/90 transition-colors duration-300">
                        Get Started Free <ArrowRight size={18} />
                    </Link>
                </div>
            </section>
        </PublicLayout>
    );
};

export default LandingPage;


