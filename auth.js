// Authentication and Session Management (Updated to use Backend API)
class AuthManager {
    constructor() {
        this.storageKey = 'ev_route_auth';
        this.useBackend = true; // Toggle to use backend API or localStorage
    }

    // Session management
    setSession(user) {
        const session = {
            userId: user.id || user.userId,
            email: user.email,
            role: user.role,
            name: user.name,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem(this.storageKey, JSON.stringify(session));
    }

    getSession() {
        const session = localStorage.getItem(this.storageKey);
        return session ? JSON.parse(session) : null;
    }

    clearSession() {
        localStorage.removeItem(this.storageKey);
        apiClient.setToken(null);
    }

    isAuthenticated() {
        const session = this.getSession();
        const token = localStorage.getItem('ev_route_token');
        return (session !== null && token !== null);
    }

    isAdmin() {
        const session = this.getSession();
        return session && session.role === 'admin';
    }

    isOwner() {
        const session = this.getSession();
        return session && session.role === 'owner';
    }

    // Registration (uses backend API)
    async register(email, password, name, role = 'user') {
        try {
            const result = await apiClient.register(email, password, name);
            // Store user data locally for immediate use
            const user = {
                id: result.userId,
                email: email,
                name: name,
                role: role,
                verified: false
            };
            return { user, otp: result.otp };
        } catch (error) {
            throw error;
        }
    }

    // Login (uses backend API)
    async login(email, password) {
        try {
            const result = await apiClient.login(email, password);
            this.setSession(result.user);
            return result.user;
        } catch (error) {
            throw error;
        }
    }

    // Verify email (uses backend API)
    async verifyEmail(email, otp) {
        try {
            const result = await apiClient.verifyEmail(email, otp);
            if (result.user) {
                this.setSession(result.user);
            }
            return true;
        } catch (error) {
            throw error;
        }
    }

    // Resend OTP (uses backend API)
    async resendOTP(email, purpose) {
        try {
            const result = await apiClient.resendOTP(email);
            return result.otp;
        } catch (error) {
            throw error;
        }
    }

    // OAuth login/registration (uses backend API)
    async loginWithOAuth(providerData) {
        try {
            // Try to use backend API first
            if (providerData.provider === 'google' && providerData.idToken) {
                try {
                    const result = await apiClient.oauthGoogle(
                        providerData.idToken,
                        providerData.email,
                        providerData.name,
                        providerData.picture,
                        providerData.id
                    );
                    this.setSession(result.user);
                    return result.user;
                } catch (apiError) {
                    console.warn('OAuth API failed, using fallback:', apiError);
                    // Fallback to localStorage
                }
            }

            // Fallback to localStorage if API unavailable
            const users = JSON.parse(localStorage.getItem('ev_route_users') || '[]');
            let user = users.find(u => u.email === providerData.email);

            if (user) {
                user.verified = true;
                if (!user.providers) user.providers = [];
                if (!user.providers.includes(providerData.provider)) {
                    user.providers.push(providerData.provider);
                }
                user.picture = providerData.picture || user.picture;
            } else {
                user = {
                    id: providerData.id || 'user-' + Date.now(),
                    email: providerData.email,
                    name: providerData.name,
                    role: 'user',
                    verified: true,
                    providers: [providerData.provider],
                    oauthUser: true,
                    picture: providerData.picture || null,
                    createdAt: new Date().toISOString()
                };
                users.push(user);
            }
            localStorage.setItem('ev_route_users', JSON.stringify(users));
            this.setSession(user);
            return user;
        } catch (error) {
            throw error;
        }
    }

    // Check if email is already registered
    isEmailRegistered(email) {
        const session = this.getSession();
        return session && session.email === email;
    }
}

// Global auth instance
const authManager = new AuthManager();


