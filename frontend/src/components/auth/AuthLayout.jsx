import React from 'react';

/** Centers any auth card (Login, Signup, ForgotPassword, etc.) on the page.
 * Each auth page used to get this for free from the old AuthScreen.js
 * wrapper; now that every page is its own route, this is the shared
 * layout each one renders through instead of repeating the wrapper. */
const AuthLayout = ({ children }) => (
    <div className="flex items-center justify-center min-h-screen p-6 bg-[radial-gradient(circle_at_15%_20%,rgba(217,164,65,0.14),transparent_40%),radial-gradient(circle_at_85%_80%,rgba(61,107,133,0.18),transparent_40%),linear-gradient(160deg,#0d1116_0%,#161c23_60%,#11161c_100%)]">
        {children}
    </div>
);

export default AuthLayout;
