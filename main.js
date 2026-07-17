// Initialize Lenis for smooth scrolling if available
if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
}

// Theme Toggling Logic
const themeBtn = document.getElementById('theme-btn');
const root = document.documentElement;

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'dark';
root.setAttribute('data-theme', savedTheme);

if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        const currentTheme = root.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Animate theme transition using GSAP if available
        if (typeof gsap !== 'undefined') {
            gsap.to('body', {
                backgroundColor: newTheme === 'dark' ? 'oklch(22% 0.01 250)' : 'oklch(98% 0.005 85)',
                color: newTheme === 'dark' ? 'oklch(98% 0 0)' : 'oklch(20% 0.01 250)',
                duration: 0.4,
                ease: 'power2.inOut'
            });
        } else {
            root.style.backgroundColor = newTheme === 'dark' ? 'oklch(22% 0.01 250)' : 'oklch(98% 0.005 85)';
            root.style.color = newTheme === 'dark' ? 'oklch(98% 0 0)' : 'oklch(20% 0.01 250)';
        }

        root.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// View states (Login, Signup, Forgot Password)
export let currentView = 'login'; // login, signup, forgot
const loginPanel = document.getElementById('auth-panel');
const forgotPanel = document.getElementById('forgot-panel');
const titleEl = document.getElementById('panel-title');
const subtitleEl = document.getElementById('panel-subtitle');
const btnTextEl = document.querySelector('#submit-btn .btn-text');
const toggleTextEl = document.getElementById('toggle-text');
const toggleAuthBtn = document.getElementById('toggle-auth');
const forgotLink = document.getElementById('forgot-link');
const backToLoginBtn = document.getElementById('back-to-login');

// Initial Load Animations
window.addEventListener('DOMContentLoaded', () => {
    if (typeof gsap === 'undefined') {
        const orb = document.querySelector('.glow-orb');
        if (orb) orb.style.opacity = '1';
        return;
    }
    const tl = gsap.timeline();
    
    tl.to('.glow-orb', {
        opacity: 1,
        duration: 2,
        ease: 'power2.out'
    })
    .from('.auth-panel', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
    }, '-=1.5')
    .from('.panel-header > *', {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out'
    }, '-=0.6')
    .from('.google-auth-wrapper, .auth-form > *, .panel-footer', {
        y: 15,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: 'power2.out'
    }, '-=0.4');
});

// Switch between Login and Signup
function handleToggleAuth(e) {
    e.preventDefault();
    currentView = currentView === 'login' ? 'signup' : 'login';
    
    const updateContent = () => {
        if (currentView === 'signup') {
            titleEl.textContent = 'Create an Account';
            subtitleEl.textContent = 'Enter your details to get started.';
            btnTextEl.textContent = 'Sign Up';
            toggleTextEl.innerHTML = `Already have an account? <a href="#" id="toggle-auth">Log in</a>`;
        } else {
            titleEl.textContent = 'Welcome Back';
            subtitleEl.textContent = 'Enter your details to sign in to your account.';
            btnTextEl.textContent = 'Sign In';
            toggleTextEl.innerHTML = `Don't have an account? <a href="#" id="toggle-auth">Sign up</a>`;
        }
        
        const newToggle = document.getElementById('toggle-auth');
        if (newToggle) newToggle.addEventListener('click', handleToggleAuth);
    };

    if (typeof gsap !== 'undefined') {
        gsap.to(['.panel-header > *', '.auth-form > *'], {
            opacity: 0,
            y: -10,
            duration: 0.2,
            stagger: 0.02,
            onComplete: () => {
                updateContent();
                gsap.fromTo(['.panel-header > *', '.auth-form > *'], 
                    { opacity: 0, y: 10 },
                    { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }
                );
            }
        });
    } else {
        updateContent();
    }
}
if (toggleAuthBtn) {
    toggleAuthBtn.addEventListener('click', handleToggleAuth);
}

// Show Forgot Password View
if (forgotLink) {
    forgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof gsap !== 'undefined') {
            gsap.to(loginPanel, {
                opacity: 0,
                y: -20,
                duration: 0.4,
                onComplete: () => {
                    loginPanel.classList.add('hidden');
                    forgotPanel.classList.remove('hidden');
                    gsap.fromTo(forgotPanel, 
                        { opacity: 0, y: 20 },
                        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
                    );
                }
            });
        } else {
            loginPanel.classList.add('hidden');
            forgotPanel.classList.remove('hidden');
        }
    });
}

// Back to Login View
if (backToLoginBtn) {
    backToLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof gsap !== 'undefined') {
            gsap.to(forgotPanel, {
                opacity: 0,
                y: -20,
                duration: 0.4,
                onComplete: () => {
                    forgotPanel.classList.add('hidden');
                    loginPanel.classList.remove('hidden');
                    gsap.fromTo(loginPanel, 
                        { opacity: 0, y: 20 },
                        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
                    );
                }
            });
        } else {
            forgotPanel.classList.add('hidden');
            loginPanel.classList.remove('hidden');
        }
    });
}

// Toast notification helper
export function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const msgEl = document.getElementById('toast-msg');
    
    msgEl.textContent = message;
    toast.className = `toast show ${type}`;
    
    // Auto hide after 4s
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}
