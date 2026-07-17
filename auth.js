import { createClient } from "@insforge/sdk";
import { showToast, currentView } from './main.js';

// InsForge API configuration
const API_URL = "https://7d5k44d3.ap-southeast.insforge.app";
const API_KEY = "ik_b05042e70e14e7db870918f9754a7026";

export const client = createClient({
    baseUrl: API_URL,
    anonKey: API_KEY
});

// DOM Elements
const authForm = document.getElementById('auth-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const submitBtn = document.getElementById('submit-btn');

const googleBtn = document.getElementById('google-btn');

const forgotForm = document.getElementById('forgot-form');
const resetEmailInput = document.getElementById('reset-email');
const resetBtn = document.getElementById('reset-btn');

// Check if user is already logged in
client.auth.getSession().then(({ data: { session } }) => {
    if (session && !window.location.pathname.includes('dashboard.html')) {
        window.location.href = './dashboard.html';
    }
});

// Listen for auth state changes
client.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
        if (!window.location.pathname.includes('dashboard.html')) {
            window.location.href = './dashboard.html';
        }
    }
});

function setLoading(button, isLoading) {
    if (!button) return;
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// Handle Email/Password Signup and Login
if (authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        setLoading(submitBtn, true);

        const email = emailInput.value;
        const password = passwordInput.value;

        try {
            if (currentView === 'signup') {
                const { data, error } = await client.auth.signUp({
                    email,
                    password,
                });

                if (error) {
                    showToast(error.message, 'error');
                } else {
                    showToast('Signup successful! Check your email for verification.', 'success');
                    if (data?.session) {
                        window.location.href = './dashboard.html';
                    }
                }
            } else {
                const { error } = await client.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) {
                    showToast(error.message, 'error');
                } else {
                    showToast('Successfully logged in!', 'success');
                }
            }
        } catch (err) {
            showToast(err.message || 'An unexpected error occurred.', 'error');
            console.error('Auth Error:', err);
        } finally {
            setLoading(submitBtn, false);
        }
    });
}

// Handle Google OAuth
if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
        try {
            const { error } = await client.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + window.location.pathname.replace('index.html', '') + 'dashboard.html'
                }
            });

            if (error) {
                showToast(error.message, 'error');
            }
        } catch (err) {
            showToast(err.message || 'An unexpected error occurred.', 'error');
        }
    });
}

// Handle Forgot Password
if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        setLoading(resetBtn, true);

        const email = resetEmailInput.value;

        try {
            const { error } = await client.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + window.location.pathname,
            });

            if (error) {
                showToast(error.message, 'error');
            } else {
                showToast('Password reset link sent to your email.', 'success');
            }
        } catch (err) {
            showToast(err.message || 'An unexpected error occurred.', 'error');
        } finally {
            setLoading(resetBtn, false);
        }
    });
}
