import React from 'react';
import PublicLayout from './PublicLayout';

const steps = [
    { n: '01', title: 'Search a route', text: 'Pick your source, destination, class, and travel date.' },
    { n: '02', title: 'Get a real prediction', text: 'The live model scores your exact flight in milliseconds.' },
    { n: '03', title: 'See the why', text: 'SHAP breaks down every factor behind that specific price.' },
    { n: '04', title: 'Track and get alerted', text: 'Save it to a watchlist and get notified when it drops.' },
];

const WorkingPage = () => {
    return (
        <PublicLayout>
            <section className="max-w-300 mx-auto px-4 sm:px-8 pt-32 pb-16">
                <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">How it works</h1>
                    <p className="text-text-tertiary">From search to a real, explainable price in four steps.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {steps.map(({ n, title, text }) => (
                        <div key={n} className="card">
                            <span className="text-3xl font-extrabold text-primary/40">{n}</span>
                            <h3 className="font-bold text-text-primary mt-2 mb-2">{title}</h3>
                            <p className="text-sm text-text-tertiary leading-relaxed">{text}</p>
                        </div>
                    ))}
                </div>
            </section>
        </PublicLayout>
    );
};

export default WorkingPage;
