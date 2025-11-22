// Shared Utilities
class Utils {
    // Show notification
    static showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        const colors = {
            success: '#00B894',
            error: '#E17055',
            warning: '#FDCB6E',
            info: '#0984E3'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
            font-weight: 500;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    // Format date
    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Validate email
    static validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Validate password
    static validatePassword(password) {
        return password.length >= 6;
    }

    // Check authentication and redirect
    static checkAuth(requiredRole = null) {
        if (!authManager.isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }

        if (requiredRole === 'admin' && !authManager.isAdmin()) {
            window.location.href = 'dashboard.html';
            return false;
        }

        if (requiredRole === 'owner' && !authManager.isOwner()) {
            window.location.href = 'dashboard.html';
            return false;
        }

        return true;
    }

    // Load theme
    static loadTheme() {
        const theme = localStorage.getItem('ev_route_theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);
        return theme;
    }

    // Toggle theme
    static toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('ev_route_theme', newTheme);
        return newTheme;
    }

    // Format distance
    static formatDistance(miles) {
        if (miles < 1) {
            return `${Math.round(miles * 5280)} ft`;
        }
        return `${miles.toFixed(1)} mi`;
    }

    // Format time
    static formatTime(hours) {
        if (hours < 1) {
            return `${Math.round(hours * 60)} min`;
        }
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }

    // Calculate distance between coordinates (Haversine formula)
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 3959; // Earth's radius in miles
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // Debounce function
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Add notification animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);


