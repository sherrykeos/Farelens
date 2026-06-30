import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const TOKEN_STORAGE_KEY = 'airlineml_token';

export const apiClient = axios.create({
    baseURL: `${API_BASE_URL}/api/v1`,
    timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

let onUnauthorized = null;
export function setUnauthorizedHandler(handler) {
    onUnauthorized = handler;
}

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && onUnauthorized) {
            onUnauthorized();
        }
        return Promise.reject(error);
    }
);

export const FLIGHT_OPTIONS = {
    airlines: [
        { value: 'AirAsia', label: 'AirAsia' },
        { value: 'Air_India', label: 'Air India' },
        { value: 'GO_FIRST', label: 'GO FIRST' },
        { value: 'Indigo', label: 'IndiGo' },
        { value: 'SpiceJet', label: 'SpiceJet' },
        { value: 'Vistara', label: 'Vistara' },
    ],
    cities: [
        { value: 'Bangalore', label: 'Bangalore' },
        { value: 'Chennai', label: 'Chennai' },
        { value: 'Delhi', label: 'Delhi' },
        { value: 'Hyderabad', label: 'Hyderabad' },
        { value: 'Kolkata', label: 'Kolkata' },
        { value: 'Mumbai', label: 'Mumbai' },
    ],
    timesOfDay: [
        { value: 'Early_Morning', label: 'Early Morning' },
        { value: 'Morning', label: 'Morning' },
        { value: 'Afternoon', label: 'Afternoon' },
        { value: 'Evening', label: 'Evening' },
        { value: 'Night', label: 'Night' },
        { value: 'Late_Night', label: 'Late Night' },
    ],
    stops: [
        { value: 'zero', label: 'Non-stop' },
        { value: 'one', label: '1 Stop' },
        { value: 'two_or_more', label: '2+ Stops' },
    ],
    classes: [
        { value: 'Economy', label: 'Economy' },
        { value: 'Business', label: 'Business' },
    ],
};

// ---- Auth ----
export async function signup(email, name, password) {
    const response = await apiClient.post('/auth/signup', { email, name, password });
    return response.data;
}

export async function verifyEmail(token) {
    const response = await apiClient.get('/auth/verify-email', { params: { token } });
    return response.data;
}

export async function login(email, password) {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
}

export async function getMe() {
    const response = await apiClient.get('/auth/me');
    return response.data;
}

export async function updateProfile(data) {
    const response = await apiClient.patch('/auth/me', data);
    return response.data;
}

export async function deleteAvatar() {
    const response = await apiClient.delete('/auth/me/avatar');
    return response.data;
}

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export function isCloudinaryConfigured() {
    return Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET);
}

// Uploads straight to Cloudinary from the browser — no backend secret
// needed, since an unsigned upload preset is designed to be called
// directly from client-side code. Returns the public HTTPS URL of the
// uploaded image, which the caller then saves via updateProfile().
export async function uploadAvatarToCloudinary(file) {
    if (!isCloudinaryConfigured()) {
        throw new Error('Cloudinary is not configured yet — add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to frontend/.env');
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) {
        throw new Error('Cloudinary upload failed');
    }
    const result = await response.json();
    return result.secure_url;
}

export async function forgotPassword(email) {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
}

export async function resetPassword(token, newPassword) {
    await apiClient.post('/auth/reset-password', { token, new_password: newPassword });
}

// ---- Prediction ----
export async function predictPrice(payload) {
    const response = await apiClient.post('/predict', payload);
    return response.data;
}

export async function getModelInfo() {
    const response = await apiClient.get('/model/info');
    return response.data;
}

// ---- Prices ----
// `options` may include: airline, stops, dateFrom, dateTo — all optional.
// Omitting airline/stops means "cheapest across everything", same as
// Google Flights' calendar when no carrier filter is applied.
export async function getFareCalendar(sourceCity, destinationCity, flightClass, options = {}) {
    const response = await apiClient.get('/prices/calendar', {
        params: {
            source_city: sourceCity,
            destination_city: destinationCity,
            flight_class: flightClass,
            ...(options.airline ? { airline: options.airline } : {}),
            ...(options.stops ? { stops: options.stops } : {}),
        },
    });
    return response.data;
}

export async function getCheapestDate(sourceCity, destinationCity, flightClass, options = {}) {
    const response = await apiClient.get('/prices/cheapest-date', {
        params: {
            source_city: sourceCity,
            destination_city: destinationCity,
            flight_class: flightClass,
            ...(options.dateFrom ? { date_from: options.dateFrom } : {}),
            ...(options.dateTo ? { date_to: options.dateTo } : {}),
            ...(options.airline ? { airline: options.airline } : {}),
            ...(options.stops ? { stops: options.stops } : {}),
        },
    });
    return response.data;
}

export async function getAirlineComparison(sourceCity, destinationCity, travelDate, flightClass, options = {}) {
    const response = await apiClient.get('/prices/airline-comparison', {
        params: {
            source_city: sourceCity,
            destination_city: destinationCity,
            travel_date: travelDate,
            flight_class: flightClass,
            ...(options.stops ? { stops: options.stops } : {}),
        },
    });
    return response.data;
}

export async function getAnomalies(sourceCity, destinationCity, flightClass, options = {}) {
    const response = await apiClient.get('/prices/anomalies', {
        params: {
            source_city: sourceCity,
            destination_city: destinationCity,
            flight_class: flightClass,
            ...(options.airline ? { airline: options.airline } : {}),
            ...(options.stops ? { stops: options.stops } : {}),
        },
    });
    return response.data;
}

// ---- Analytics ----
export async function getMarketAnalytics() {
    const response = await apiClient.get('/analytics/market');
    return response.data;
}

export async function getPopularRoutes(limit = 10) {
    const response = await apiClient.get('/routes/popular', { params: { limit } });
    return response.data;
}

// ---- Watchlists ----
export async function listWatchlists() {
    const response = await apiClient.get('/watchlists');
    return response.data;
}

export async function createWatchlist(payload) {
    const response = await apiClient.post('/watchlists', payload);
    return response.data;
}

export async function deleteWatchlist(id) {
    await apiClient.delete(`/watchlists/${id}`);
}

// ---- Saved searches ----
export async function listSavedSearches() {
    const response = await apiClient.get('/saved-searches');
    return response.data;
}

export async function createSavedSearch(payload) {
    const response = await apiClient.post('/saved-searches', payload);
    return response.data;
}

export async function deleteSavedSearch(id) {
    await apiClient.delete(`/saved-searches/${id}`);
}

// ---- Alerts ----
export async function listAlerts() {
    const response = await apiClient.get('/alerts');
    return response.data;
}

export { TOKEN_STORAGE_KEY };
