import React from 'react';
import Navbar from './Navbar';

/** Shared layout for every public marketing page (landing, features,
 * working) — keeps them visually consistent without repeating the same
 * navbar/footer markup in each page file. */
const PublicLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-[linear-gradient(160deg,#0d1116_0%,#161c23_60%,#11161c_100%)] text-text-primary">
            <Navbar />

            {children}

            <footer className="border-t border-border py-8 text-center text-sm text-text-tertiary">
                AirlineML Dynamic Pricing System — built with a real XGBoost model, real SHAP explanations, and zero fabricated data.
            </footer>
        </div>
    );
};

export default PublicLayout;
