// Login Page Logic
document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    if (authManager.isAuthenticated()) {
        const session = authManager.getSession();
        if (session.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'dashboard.html';
        }
        return;
    }

    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    // Handle OAuth login with real Google integration
    const handleOAuthLogin = async (providerName) => {
        try {
            const provider = oauthProvider.providers[providerName];
            if (!provider || !provider.enabled) {
                Utils.showNotification(`${providerName} login is not yet available`, 'info');
                return;
            }

            // Show loading state
            Utils.showNotification(`Connecting to ${provider.name}...`, 'info');

            // Use enhanced OAuth provider
            const providerData = await oauthProvider.loginWithProvider(providerName);
            
            // Send to backend for verification and token generation
            try {
                const result = await apiClient.oauthGoogle(
                    providerData.idToken || '',
                    providerData.email,
                    providerData.name,
                    providerData.picture,
                    providerData.id
                );
                
                // Backend returns token and user, so we're already logged in
                Utils.showNotification(`Successfully signed in with ${provider.name}!`, 'success');
                
                // Redirect based on role
                setTimeout(() => {
                    const session = authManager.getSession();
                    if (session && session.role === 'admin') {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'dashboard.html';
                    }
                }, 1000);
            } catch (apiError) {
                // Fallback to local storage if backend unavailable
                console.warn('Backend OAuth failed, using fallback:', apiError);
                const user = await authManager.loginWithOAuth(providerData);
                Utils.showNotification(`Successfully signed in with ${provider.name}!`, 'success');
                
                setTimeout(() => {
                    if (user.role === 'admin') {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'dashboard.html';
                    }
                }, 1000);
            }

        } catch (error) {
            if (error.message !== 'User cancelled' && error.message !== 'Sign-in cancelled') {
                Utils.showNotification(error.message || 'OAuth login failed', 'error');
            }
        }
    };

    // Attach OAuth handlers to buttons
    document.querySelectorAll('.btn-google, .btn-facebook, .btn-github, .btn-microsoft').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const provider = btn.classList.contains('btn-google') ? 'google' :
                           btn.classList.contains('btn-facebook') ? 'facebook' :
                           btn.classList.contains('btn-github') ? 'github' :
                           btn.classList.contains('btn-microsoft') ? 'microsoft' : null;
            
            if (provider) {
                handleOAuthLogin(provider);
            }
        });
    });

    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
    });

    // Handle form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('loginBtn');
        const btnText = loginBtn.querySelector('.btn-text');
        const btnLoader = loginBtn.querySelector('.btn-loader');

        // Validate inputs
        if (!Utils.validateEmail(email)) {
            Utils.showNotification('Please enter a valid email address', 'error');
            return;
        }

        if (!Utils.validatePassword(password)) {
            Utils.showNotification('Password must be at least 6 characters', 'error');
            return;
        }

        // Show loading state
        loginBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';

        try {
            // Login with backend API
            const user = await authManager.login(email, password);
            
            Utils.showNotification('Login successful! Redirecting...', 'success');
            
            // Add success animation
            animationManager.scale(loginBtn, 1, 1.05, 200, () => {
                animationManager.scale(loginBtn, 1.05, 1, 200);
            });

            // Redirect based on role
            setTimeout(() => {
                if (user.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            }, 1000);

        } catch (error) {
            Utils.showNotification(error.message || 'Login failed. Please check your credentials.', 'error');
            
            // Shake animation on error
            loginForm.style.animation = 'shake 0.5s';
            setTimeout(() => {
                loginForm.style.animation = '';
            }, 500);
        } finally {
            loginBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    });
});


