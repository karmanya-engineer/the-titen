// OAuth Provider Management
// Note: This is a simulated OAuth implementation for demo purposes
// In production, integrate with actual OAuth providers (Google, Facebook, GitHub, etc.)

class OAuthProvider {
    constructor() {
        this.providers = {
            google: {
                name: 'Google',
                color: '#4285F4',
                icon: 'google'
            },
            facebook: {
                name: 'Facebook',
                color: '#1877F2',
                icon: 'facebook'
            },
            github: {
                name: 'GitHub',
                color: '#333',
                icon: 'github'
            },
            microsoft: {
                name: 'Microsoft',
                color: '#00A4EF',
                icon: 'microsoft'
            }
        };
    }

    // Simulate OAuth login flow
    // In production, this would redirect to the OAuth provider
    async loginWithProvider(providerName) {
        return new Promise((resolve, reject) => {
            // Simulate OAuth popup/redirect
            setTimeout(() => {
                // Simulate user consent and token exchange
                // In production, this would be handled by the OAuth provider
                const mockUserData = this.getMockUserData(providerName);
                
                if (mockUserData) {
                    resolve(mockUserData);
                } else {
                    reject(new Error(`Failed to authenticate with ${providerName}`));
                }
            }, 1500); // Simulate network delay
        });
    }

    // Get mock user data for demo purposes
    // In production, this would come from the OAuth provider's API
    getMockUserData(providerName) {
        const mockUsers = {
            google: {
                id: `google-${Date.now()}`,
                email: 'user@gmail.com',
                name: 'John Doe',
                picture: null,
                provider: 'google',
                verified: true
            },
            facebook: {
                id: `facebook-${Date.now()}`,
                email: 'user@facebook.com',
                name: 'Jane Smith',
                picture: null,
                provider: 'facebook',
                verified: true
            },
            github: {
                id: `github-${Date.now()}`,
                email: 'user@github.com',
                name: 'Dev User',
                picture: null,
                provider: 'github',
                verified: true
            },
            microsoft: {
                id: `microsoft-${Date.now()}`,
                email: 'user@outlook.com',
                name: 'Office User',
                picture: null,
                provider: 'microsoft',
                verified: true
            }
        };

        return mockUsers[providerName] || null;
    }

    // Show OAuth consent dialog (simulated)
    showConsentDialog(providerName) {
        return new Promise((resolve, reject) => {
            const provider = this.providers[providerName];
            if (!provider) {
                reject(new Error('Invalid provider'));
                return;
            }

            // Create modal dialog
            const modal = document.createElement('div');
            modal.className = 'oauth-consent-modal';
            modal.innerHTML = `
                <div class="oauth-consent-content">
                    <div class="oauth-consent-header">
                        <h3>Sign in with ${provider.name}</h3>
                        <button class="oauth-consent-close">&times;</button>
                    </div>
                    <div class="oauth-consent-body">
                        <div class="oauth-consent-icon" style="background: ${provider.color}">
                            ${this.getProviderIcon(providerName)}
                        </div>
                        <p>This is a demo OAuth flow. In production, you would be redirected to ${provider.name} to authorize this application.</p>
                        <div class="oauth-consent-permissions">
                            <h4>This app will access:</h4>
                            <ul>
                                <li>Your email address</li>
                                <li>Your name</li>
                                <li>Your profile picture</li>
                            </ul>
                        </div>
                    </div>
                    <div class="oauth-consent-actions">
                        <button class="btn-secondary oauth-consent-cancel">Cancel</button>
                        <button class="btn-primary oauth-consent-allow">Allow</button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            // Handle close
            const closeModal = () => {
                modal.remove();
                reject(new Error('User cancelled'));
            };

            modal.querySelector('.oauth-consent-close').addEventListener('click', closeModal);
            modal.querySelector('.oauth-consent-cancel').addEventListener('click', closeModal);
            modal.querySelector('.oauth-consent-allow').addEventListener('click', () => {
                modal.remove();
                resolve();
            });

            // Close on background click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal();
                }
            });
        });
    }

    // Get provider icon SVG
    getProviderIcon(providerName) {
        const icons = {
            google: `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
            `,
            facebook: `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
            `,
            github: `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
            `,
            microsoft: `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M0 0h11.377v11.372H0zM12.623 0H24v11.372H12.623zM0 12.628h11.377V24H0zM12.623 12.628H24V24H12.623z"/>
                </svg>
            `
        };

        return icons[providerName] || '';
    }
}

// Global OAuth instance
const oauthProvider = new OAuthProvider();

// Add OAuth consent modal styles
const oauthStyles = document.createElement('style');
oauthStyles.textContent = `
    .oauth-consent-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    }

    .oauth-consent-content {
        background: var(--surface-elevated);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 24px;
        padding: 32px;
        max-width: 500px;
        width: 90%;
        box-shadow: var(--shadow-xl);
        animation: modalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .oauth-consent-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
    }

    .oauth-consent-header h3 {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text-primary);
    }

    .oauth-consent-close {
        background: none;
        border: none;
        font-size: 2rem;
        color: var(--text-secondary);
        cursor: pointer;
        line-height: 1;
        transition: color 0.3s ease;
    }

    .oauth-consent-close:hover {
        color: var(--text-primary);
    }

    .oauth-consent-body {
        text-align: center;
        margin-bottom: 24px;
    }

    .oauth-consent-icon {
        width: 64px;
        height: 64px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 20px;
        box-shadow: var(--shadow-md);
    }

    .oauth-consent-body p {
        color: var(--text-secondary);
        margin-bottom: 20px;
        line-height: 1.6;
    }

    .oauth-consent-permissions {
        text-align: left;
        background: var(--background);
        padding: 20px;
        border-radius: 12px;
        margin-top: 20px;
    }

    .oauth-consent-permissions h4 {
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 12px;
    }

    .oauth-consent-permissions ul {
        list-style: none;
        padding: 0;
    }

    .oauth-consent-permissions li {
        color: var(--text-secondary);
        padding: 8px 0;
        padding-left: 24px;
        position: relative;
    }

    .oauth-consent-permissions li::before {
        content: '✓';
        position: absolute;
        left: 0;
        color: var(--primary-color);
        font-weight: 600;
    }

    .oauth-consent-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
    }

    @keyframes modalSlideIn {
        from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }
`;
document.head.appendChild(oauthStyles);

