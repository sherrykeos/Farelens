import React from 'react';
import { Sparkles, Bell, Brain, CalendarDays } from 'lucide-react';
import PublicLayout from './Footer';

const features = [
    {
        icon: Brain,
        title: 'Real ML Predictions',
        text: 'A live XGBoost model trained on 300K+ real Indian domestic flight fares — not a static lookup table.',
    },
    {
        icon: Sparkles,
        title: 'SHAP Explainability',
        text: 'Every prediction shows exactly which factors pushed the price up or down, with real numbers, not a black box.',
    },
    {
        icon: CalendarDays,
        title: '49-Day Fare Calendar',
        text: 'Browse real collected fares across every reliable day the model can predict, color-coded by price tier.',
    },
    {
        icon: Bell,
        title: 'Price Drop Alerts',
        text: 'Set a target price on any route and get emailed automatically the moment a real fare drops below it.',
    },
];

const FeaturesPage = () => {
    return (
        <PublicLayout>
            <section className="max-w-300 mx-auto px-4 sm:px-8 pt-32 pb-16">
                <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Built on real data, not guesswork</h1>
                    <p className="text-text-tertiary">Every feature below is backed by a real, working model and real collected fares.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map(({ icon: Icon, title, text }) => (
                        <div key={title} className="card">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br from-[rgba(217,164,65,0.12)] to-[rgba(61,107,133,0.1)] text-primary mb-4">
                                <Icon size={24} />
                            </div>
                            <h3 className="font-bold text-text-primary mb-2">{title}</h3>
                            <p className="text-sm text-text-tertiary leading-relaxed">{text}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="max-w-300 mx-auto px-4 sm:px-8 pb-16">
                <div className="text-center mb-12">
                    <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">Glimpses of the Dashboard</h2>
                    <p className="text-text-tertiary">Real screenshots of the actual running app — nothing simulated.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <img src="/screenshots/dashboard.png" alt="Dashboard" className="rounded-lg border border-border shadow-lg w-full" />
                    <img src="/screenshots/price-prediction.png" alt="Price Prediction with SHAP" className="rounded-lg border border-border shadow-lg w-full" />
                    <img src="/screenshots/market-analytics.png" alt="Market Analytics" className="rounded-lg border border-border shadow-lg w-full" />
                </div>
            </section>
        </PublicLayout>
    );
};

export default FeaturesPage;
