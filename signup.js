// Signup Page Logic
document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    if (authManager.isAuthenticated()) {
        window.location.href = 'dashboard.html';
        return;
    }

    let currentStep = 1;
    let registrationData = {};

    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const signupForm = document.getElementById('signupForm');
    const otpForm = document.getElementById('otpForm');
    const otpInputs = document.querySelectorAll('.otp-input');
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
    });

    toggleConfirmPassword.addEventListener('click', () => {
        const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        confirmPasswordInput.setAttribute('type', type);
    });

    // OTP input handling
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            const value = e.target.value;
            if (value && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !input.value && index > 0) {
                otpInputs[index - 1].focus();
            }
        });

        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').slice(0, 6);
            pastedData.split('').forEach((char, i) => {
                if (otpInputs[i] && /[0-9]/.test(char)) {
                    otpInputs[i].value = char;
                }
            });
            if (pastedData.length === 6) {
                otpInputs[5].focus();
            } else if (pastedData.length > 0) {
                otpInputs[pastedData.length].focus();
            }
        });
    });

    // Handle signup form submission
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const signupBtn = document.getElementById('signupBtn');
        const btnText = signupBtn.querySelector('.btn-text');
        const btnLoader = signupBtn.querySelector('.btn-loader');

        // Validate inputs
        if (name.length < 2) {
            Utils.showNotification('Please enter your full name', 'error');
            return;
        }

        if (!Utils.validateEmail(email)) {
            Utils.showNotification('Please enter a valid email address', 'error');
            return;
        }

        if (!Utils.validatePassword(password)) {
            Utils.showNotification('Password must be at least 6 characters', 'error');
            return;
        }

        if (password !== confirmPassword) {
            Utils.showNotification('Passwords do not match', 'error');
            return;
        }

        // Show loading state
        signupBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';

        try {
            // Register with backend API
            const result = await authManager.register(email, password, name);
            registrationData = { email, otp: result.otp };

            // Show OTP in console for demo (remove in production)
            console.log('Demo OTP:', result.otp);
            console.log('⚠️ In production, this OTP would be sent via email');

            // Move to verification step with animation
            animationManager.fadeOut(step1, 300, () => {
                step1.style.display = 'none';
                step2.style.display = 'block';
                document.getElementById('verificationEmail').textContent = email;
                animationManager.slideIn(step2, 'up', 400);
                otpInputs[0].focus();
            });

            Utils.showNotification('Verification code sent to your email', 'success');

        } catch (error) {
            Utils.showNotification(error.message || 'Registration failed. Please try again.', 'error');
        } finally {
            signupBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    });

    // Handle OTP verification
    otpForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const otp = Array.from(otpInputs).map(input => input.value).join('');
        const verifyBtn = document.getElementById('verifyBtn');
        const btnText = verifyBtn.querySelector('.btn-text');
        const btnLoader = verifyBtn.querySelector('.btn-loader');

        if (otp.length !== 6) {
            Utils.showNotification('Please enter the complete 6-digit code', 'error');
            return;
        }

        // Show loading state
        verifyBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';

        try {
            // Verify email with backend API
            await authManager.verifyEmail(registrationData.email, otp);

            Utils.showNotification('Email verified successfully! Redirecting...', 'success');
            
            // Auto login is handled by verifyEmail which sets the session
            // Add success animation
            animationManager.scale(verifyBtn, 1, 1.05, 200, () => {
                animationManager.scale(verifyBtn, 1.05, 1, 200);
            });

            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);

        } catch (error) {
            Utils.showNotification(error.message || 'Invalid verification code', 'error');
            // Clear OTP inputs with shake animation
            otpInputs.forEach(input => {
                input.value = '';
                input.style.animation = 'shake 0.5s';
                setTimeout(() => {
                    input.style.animation = '';
                }, 500);
            });
            otpInputs[0].focus();
        } finally {
            verifyBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    });

    // Handle resend OTP with better event listener
    const resendOtpBtn = document.getElementById('resendOtpBtn');
    if (resendOtpBtn) {
        resendOtpBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const btn = e.target;
            const originalText = btn.textContent;
            
            btn.disabled = true;
            btn.textContent = 'Sending...';
            
            try {
                const result = await authManager.resendOTP(registrationData.email, 'verification');
                const otp = result || result;
                console.log('New Demo OTP:', otp);
                Utils.showNotification('New verification code sent', 'success');
                
                // Clear and focus OTP inputs with animation
                otpInputs.forEach(input => input.value = '');
                animationManager.fadeOut(otpInputs[0], 200, () => {
                    animationManager.fadeIn(otpInputs[0], 200);
                    otpInputs[0].focus();
                });
            } catch (error) {
                Utils.showNotification(error.message || 'Failed to resend OTP', 'error');
            } finally {
                btn.disabled = false;
                btn.textContent = originalText;
            }
        });
    }

    // Handle OAuth signup/login
    const handleOAuthSignup = async (providerName) => {
        try {
            // Show consent dialog
            await oauthProvider.showConsentDialog(providerName);
            
            // Show loading state
            Utils.showNotification(`Connecting to ${oauthProvider.providers[providerName].name}...`, 'info');

            // Simulate OAuth flow
            const providerData = await oauthProvider.loginWithProvider(providerName);
            
            // Check if email is already registered
            if (authManager.isEmailRegistered(providerData.email)) {
                Utils.showNotification('This email is already registered. Please login instead.', 'error');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                return;
            }

            // Register/login with OAuth
            const user = await authManager.loginWithOAuth(providerData);
            
            Utils.showNotification(`Successfully signed up with ${oauthProvider.providers[providerName].name}!`, 'success');

            // Redirect to dashboard (OAuth users are auto-verified)
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);

        } catch (error) {
            if (error.message !== 'User cancelled') {
                Utils.showNotification(error.message || 'OAuth signup failed', 'error');
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
                handleOAuthSignup(provider);
            }
        });
    });
});


