// Real Google OAuth Integration
// This implementation uses Google Sign-In API

class GoogleOAuth {
    constructor() {
        this.googleAuth = null;
        this.isLoaded = false;
        this.clientId = null; // Set via config or environment
        this.init();
    }

    init() {
        // Load Google Sign-In API
        this.loadGoogleAPI();
    }

    loadGoogleAPI() {
        // Check if already loaded
        if (window.gapi && window.gapi.auth2) {
            this.isLoaded = true;
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            // Load Google API script
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/platform.js';
            script.async = true;
            script.defer = true;
            
            script.onload = () => {
                // Get client ID from config or use default
                this.clientId = CONFIG?.GOOGLE_OAUTH_CLIENT_ID || null;
                
                if (this.clientId) {
                    gapi.load('auth2', () => {
                        gapi.auth2.init({
                            client_id: this.clientId
                        }).then(() => {
                            this.isLoaded = true;
                            this.googleAuth = gapi.auth2.getAuthInstance();
                            resolve();
                        }).catch(reject);
                    });
                } else {
                    console.warn('Google OAuth Client ID not configured');
                    this.isLoaded = true; // Allow demo mode
                    resolve();
                }
            };
            
            script.onerror = () => {
                reject(new Error('Failed to load Google API'));
            };
            
            document.head.appendChild(script);
        });
    }

    async signIn() {
        if (!this.isLoaded) {
            await this.loadGoogleAPI();
        }

        // If client ID is not configured, use demo mode
        if (!this.clientId) {
            return this.demoSignIn();
        }

        try {
            const googleUser = await this.googleAuth.signIn({
                scope: 'profile email'
            });

            const profile = googleUser.getBasicProfile();
            const idToken = googleUser.getAuthResponse().id_token;

            return {
                id: profile.getId(),
                email: profile.getEmail(),
                name: profile.getName(),
                picture: profile.getImageUrl(),
                idToken: idToken,
                provider: 'google',
                verified: true
            };
        } catch (error) {
            if (error.error === 'popup_closed_by_user') {
                throw new Error('Sign-in cancelled');
            }
            throw error;
        }
    }

    async signOut() {
        if (this.googleAuth && this.isLoaded) {
            await this.googleAuth.signOut();
        }
    }

    // Demo mode for development
    demoSignIn() {
        return new Promise((resolve, reject) => {
            // Show demo consent dialog
            const modal = document.createElement('div');
            modal.className = 'oauth-demo-modal';
            modal.innerHTML = `
                <div class="oauth-demo-content">
                    <div class="oauth-demo-header">
                        <div class="oauth-demo-icon" style="background: #4285F4">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                        </div>
                        <h3>Sign in with Google</h3>
                        <p class="demo-note">⚠️ Demo Mode: Configure Google OAuth Client ID for production</p>
                    </div>
                    <div class="oauth-demo-form">
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="demo-email" placeholder="your@gmail.com" value="user@gmail.com">
                        </div>
                        <div class="form-group">
                            <label>Name</label>
                            <input type="text" id="demo-name" placeholder="Your Name" value="Google User">
                        </div>
                    </div>
                    <div class="oauth-demo-actions">
                        <button class="btn-secondary oauth-demo-cancel">Cancel</button>
                        <button class="btn-primary oauth-demo-confirm">Sign In</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            const closeModal = () => {
                modal.remove();
            };

            modal.querySelector('.oauth-demo-cancel').addEventListener('click', () => {
                closeModal();
                reject(new Error('User cancelled'));
            });

            modal.querySelector('.oauth-demo-confirm').addEventListener('click', () => {
                const email = document.getElementById('demo-email').value;
                const name = document.getElementById('demo-name').value;
                closeModal();
                
                resolve({
                    id: `google-${Date.now()}`,
                    email: email,
                    name: name,
                    picture: null,
                    provider: 'google',
                    verified: true
                });
            });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal();
                    reject(new Error('User cancelled'));
                }
            });
        });
    }
}

// Enhanced OAuth Provider with real Google integration
class EnhancedOAuthProvider {
    constructor() {
        this.googleOAuth = new GoogleOAuth();
        this.providers = {
            google: {
                name: 'Google',
                color: '#4285F4',
                icon: 'google',
                enabled: true
            },
            facebook: {
                name: 'Facebook',
                color: '#1877F2',
                icon: 'facebook',
                enabled: false // Can be enabled with Facebook SDK
            },
            github: {
                name: 'GitHub',
                color: '#333',
                icon: 'github',
                enabled: false // Can be enabled with GitHub OAuth
            },
            microsoft: {
                name: 'Microsoft',
                color: '#00A4EF',
                icon: 'microsoft',
                enabled: false // Can be enabled with Microsoft OAuth
            }
        };
    }

    async loginWithProvider(providerName) {
        switch (providerName) {
            case 'google':
                return await this.googleOAuth.signIn();
            default:
                // Fallback to demo mode for other providers
                return await this.demoLogin(providerName);
        }
    }

    async demoLogin(providerName) {
        return new Promise((resolve, reject) => {
            const provider = this.providers[providerName];
            if (!provider) {
                reject(new Error('Invalid provider'));
                return;
            }

            const modal = document.createElement('div');
            modal.className = 'oauth-demo-modal';
            modal.innerHTML = `
                <div class="oauth-demo-content">
                    <div class="oauth-demo-header">
                        <div class="oauth-demo-icon" style="background: ${provider.color}">
                            ${this.getProviderIcon(providerName)}
                        </div>
                        <h3>Sign in with ${provider.name}</h3>
                        <p class="demo-note">⚠️ Demo Mode: Configure ${provider.name} OAuth for production</p>
                    </div>
                    <div class="oauth-demo-form">
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" id="demo-email" placeholder="your@email.com" value="user@${providerName}.com">
                        </div>
                        <div class="form-group">
                            <label>Name</label>
                            <input type="text" id="demo-name" placeholder="Your Name" value="${provider.name} User">
                        </div>
                    </div>
                    <div class="oauth-demo-actions">
                        <button class="btn-secondary oauth-demo-cancel">Cancel</button>
                        <button class="btn-primary oauth-demo-confirm">Sign In</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            const closeModal = () => modal.remove();

            modal.querySelector('.oauth-demo-cancel').addEventListener('click', () => {
                closeModal();
                reject(new Error('User cancelled'));
            });

            modal.querySelector('.oauth-demo-confirm').addEventListener('click', () => {
                const email = document.getElementById('demo-email').value;
                const name = document.getElementById('demo-name').value;
                closeModal();
                
                resolve({
                    id: `${providerName}-${Date.now()}`,
                    email: email,
                    name: name,
                    picture: null,
                    provider: providerName,
                    verified: true
                });
            });

            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal();
                    reject(new Error('User cancelled'));
                }
            });
        });
    }

    getProviderIcon(providerName) {
        const icons = {
            google: `<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>`,
            facebook: `<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
            github: `<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`,
            microsoft: `<svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M0 0h11.377v11.372H0zM12.623 0H24v11.372H12.623zM0 12.628h11.377V24H0zM12.623 12.628H24V24H12.623z"/></svg>`
        };
        return icons[providerName] || '';
    }

    async showConsentDialog(providerName) {
        // For real OAuth, this is handled by the provider
        // This is just for demo/fallback
        return Promise.resolve();
    }
}

// Global enhanced OAuth instance
const oauthProvider = new EnhancedOAuthProvider();

// Add demo modal styles
const demoStyles = document.createElement('style');
demoStyles.textContent = `
    .oauth-demo-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(8px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    }

    .oauth-demo-content {
        background: var(--surface);
        border-radius: 20px;
        padding: 32px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideInUp 0.3s ease;
    }

    .oauth-demo-header {
        text-align: center;
        margin-bottom: 24px;
    }

    .oauth-demo-icon {
        width: 64px;
        height: 64px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 16px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .oauth-demo-header h3 {
        font-size: 1.5rem;
        margin-bottom: 8px;
        color: var(--text-primary);
    }

    .demo-note {
        font-size: 0.85rem;
        color: var(--warning);
        margin-top: 8px;
    }

    .oauth-demo-form .form-group {
        margin-bottom: 16px;
    }

    .oauth-demo-form label {
        display: block;
        margin-bottom: 6px;
        font-weight: 500;
        color: var(--text-primary);
    }

    .oauth-demo-form input {
        width: 100%;
        padding: 12px;
        border: 2px solid var(--border-color);
        border-radius: 8px;
        font-size: 1rem;
        transition: all 0.3s ease;
    }

    .oauth-demo-form input:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }

    .oauth-demo-actions {
        display: flex;
        gap: 12px;
        margin-top: 24px;
    }

    .oauth-demo-actions button {
        flex: 1;
        padding: 12px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(demoStyles);

