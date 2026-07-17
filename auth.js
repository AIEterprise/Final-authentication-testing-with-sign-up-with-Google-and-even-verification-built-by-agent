import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { showToast, currentView } from './main.js';

// InsForge API configuration
const API_URL = "https://7d5k44d3.ap-southeast.insforge.app";
const API_KEY = "ik_b05042e70e14e7db870918f9754a7026";

export const client = createClient(API_URL, API_KEY);

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
        window.location.href = './dashboard.html';
    }
});

function setLoading(button, isLoading) {
    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// Handle Email/Password Signup and Login
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    setLoading(submitBtn, true);

    const email = emailInput.value;
    const password = passwordInput.value;

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
                // Instantly logged in
                window.location.href = './dashboard.html';
            }
        }
    } else {
        // Login
        const { error } = await client.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            showToast(error.message, 'error');
        } else {
            showToast('Successfully logged in!', 'success');
            // onAuthStateChange handles redirect
        }
    }
    
    setLoading(submitBtn, false);
});

// Handle Google OAuth
googleBtn.addEventListener('click', async () => {
    const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin + window.location.pathname.replace('index.html', '') + 'dashboard.html'
        }
    });

    if (error) {
        showToast(error.message, 'error');
    }
});

// Handle Forgot Password
forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    setLoading(resetBtn, true);

    const email = resetEmailInput.value;

    const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + window.location.pathname,
    });

    if (error) {
        showToast(error.message, 'error');
    } else {
        showToast('Password reset link sent to your email.', 'success');
    }
    
    setLoading(resetBtn, false);
});
