// Profile Page Logic with Enhanced Event Listeners and Animations
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!Utils.checkAuth()) return;

    // Load theme
    Utils.loadTheme();

    // Initialize scroll animations
    scrollAnimations.observeAll('.profile-section, .station-card');

    // Load user data with animation
    loadUserProfile().then(() => {
        // Animate profile sections after load
        const sections = document.querySelectorAll('.profile-tab-content');
        sections.forEach((section, index) => {
            if (section.classList.contains('active')) {
                animationManager.slideIn(section, 'up', 400);
            }
        });
    });

    // Setup event listeners
    setupEventListeners();
});

function setupEventListeners() {
    // Tab navigation with smooth animations
    document.querySelectorAll('.profile-tab').forEach(tab => {
        eventManager.on(tab, 'click', (e) => {
            e.preventDefault();
            const tabName = tab.dataset.tab;
            switchTab(tabName);
            
            // Add click animation
            tab.style.transform = 'scale(0.95)';
            setTimeout(() => {
                tab.style.transform = '';
            }, 150);
        });
    });

    // Theme toggle with animation
    const themeToggle = document.getElementById('themeToggle');
    eventManager.on(themeToggle, 'click', () => {
        animationManager.scale(themeToggle, 1, 0.9, 100, () => {
            const theme = Utils.toggleTheme();
            themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
            animationManager.scale(themeToggle, 0.9, 1, 100);
        });
    });

    // User menu with smooth dropdown
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');

    eventManager.on(userMenuBtn, 'click', (e) => {
        e.stopPropagation();
        const isShowing = userDropdown.classList.contains('show');
        
        if (isShowing) {
            animationManager.fadeOut(userDropdown, 200, () => {
                userDropdown.classList.remove('show');
            });
        } else {
            userDropdown.classList.add('show');
            animationManager.fadeIn(userDropdown, 200);
        }
    });

    // Close dropdown on outside click
    eventManager.on(document, 'click', (e) => {
        if (!userMenuBtn.contains(e.target) && !userDropdown.contains(e.target)) {
            animationManager.fadeOut(userDropdown, 200, () => {
                userDropdown.classList.remove('show');
            });
        }
    });

    // Logout with confirmation
    eventManager.on(document.getElementById('logoutBtn'), 'click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            authManager.clearSession();
            Utils.showNotification('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        }
    });

    // Form submissions with enhanced error handling
    const personalForm = document.getElementById('personalForm');
    const vehicleForm = document.getElementById('vehicleForm');
    const preferencesForm = document.getElementById('preferencesForm');

    eventManager.on(personalForm, 'submit', handlePersonalSubmit);
    eventManager.on(vehicleForm, 'submit', handleVehicleSubmit);
    eventManager.on(preferencesForm, 'submit', handlePreferencesSubmit);

    // Input validation with real-time feedback
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        eventManager.on(input, 'blur', () => {
            validateField(input);
        });

        eventManager.on(input, 'input', () => {
            if (input.classList.contains('error')) {
                validateField(input);
            }
        });
    });

    // Change avatar button
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    if (changeAvatarBtn) {
        eventManager.on(changeAvatarBtn, 'click', () => {
            Utils.showNotification('Avatar upload feature coming soon!', 'info');
        });
    }

    // Keyboard shortcuts
    eventManager.on(document, 'keydown', (e) => {
        // ESC to close dropdowns
        if (e.key === 'Escape') {
            if (userDropdown.classList.contains('show')) {
                animationManager.fadeOut(userDropdown, 200, () => {
                    userDropdown.classList.remove('show');
                });
            }
        }
    });
}

function validateField(field) {
    const value = field.value.trim();
    
    // Remove existing error styles
    field.classList.remove('error');
    const errorMsg = field.parentElement.querySelector('.error-message');
    if (errorMsg) errorMsg.remove();

    // Validate based on field type
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }

    if (field.type === 'email' && value && !Utils.validateEmail(value)) {
        showFieldError(field, 'Please enter a valid email address');
        return false;
    }

    if (field.type === 'tel' && value && !/^[\d\s\-\(\)\+]+$/.test(value)) {
        showFieldError(field, 'Please enter a valid phone number');
        return false;
    }

    return true;
}

function showFieldError(field, message) {
    field.classList.add('error');
    const errorMsg = document.createElement('span');
    errorMsg.className = 'error-message';
    errorMsg.textContent = message;
    errorMsg.style.cssText = 'color: var(--error); font-size: 0.85rem; margin-top: 4px; display: block;';
    field.parentElement.appendChild(errorMsg);
}

function switchTab(tabName) {
    // Get current and new tab elements
    const currentTab = document.querySelector('.profile-tab.active');
    const newTab = document.querySelector(`[data-tab="${tabName}"]`);
    const currentContent = document.querySelector('.profile-tab-content.active');
    const newContent = document.getElementById(`tab-${tabName}`);

    if (!newTab || !newContent) return;

    // Fade out current content
    if (currentContent) {
        animationManager.fadeOut(currentContent, 200, () => {
            currentContent.classList.remove('active');
            
            // Update tabs
            if (currentTab) currentTab.classList.remove('active');
            newTab.classList.add('active');
            
            // Fade in new content
            newContent.classList.add('active');
            animationManager.slideIn(newContent, 'up', 300);
        });
    } else {
        // First time load
        if (currentTab) currentTab.classList.remove('active');
        newTab.classList.add('active');
        newContent.classList.add('active');
        animationManager.slideIn(newContent, 'up', 300);
    }
}

async function loadUserProfile() {
    const session = authManager.getSession();
    if (!session) return;

    try {
        // Use session data to populate user info (no longer using "John Doe")
        const userName = session.name || session.email || 'User';
        const userEmail = session.email || '';
        const userRole = session.role ? session.role.charAt(0).toUpperCase() + session.role.slice(1) : 'User';

        // Update header with actual user data
        document.getElementById('profileName').textContent = userName;
        document.getElementById('profileEmail').textContent = userEmail;
        document.getElementById('profileRole').textContent = userRole;
        document.getElementById('userName').textContent = userName;

        // Update avatar initials from actual user name
        const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        document.getElementById('avatarInitials').textContent = initials;

        // Load profile data from backend API
        try {
            const profileData = await apiClient.getProfile();
            
            // Personal info
            document.getElementById('fullName').value = profileData.fullName || userName;
            document.getElementById('email').value = profileData.email || userEmail;
            document.getElementById('phone').value = profileData.phone || '';
            document.getElementById('location').value = profileData.location || '';

            // Vehicle info
            if (profileData.vehicleMake) document.getElementById('vehicleMake').value = profileData.vehicleMake;
            if (profileData.vehicleModel) document.getElementById('vehicleModel').value = profileData.vehicleModel;
            if (profileData.evRange) document.getElementById('evRange').value = profileData.evRange;
            if (profileData.batteryCapacity) document.getElementById('batteryCapacity').value = profileData.batteryCapacity;
            if (profileData.connectorType) document.getElementById('connectorType').value = profileData.connectorType;

            // Preferences
            if (profileData.preferredChargerType) document.getElementById('preferredChargerType').value = profileData.preferredChargerType;
            if (profileData.maxCostPerKwh) document.getElementById('maxCostPerKwh').value = profileData.maxCostPerKwh;
            if (profileData.preferVerified !== undefined) document.getElementById('preferVerified').checked = profileData.preferVerified;
            if (profileData.emailNotifications !== undefined) document.getElementById('emailNotifications').checked = profileData.emailNotifications;
            if (profileData.routeAlerts !== undefined) document.getElementById('routeAlerts').checked = profileData.routeAlerts;
        } catch (error) {
            // Fallback to localStorage if API fails
            const profileData = getUserProfileLocal();
            if (profileData.fullName) document.getElementById('fullName').value = profileData.fullName || userName;
            if (profileData.email) document.getElementById('email').value = profileData.email || userEmail;
            if (profileData.phone) document.getElementById('phone').value = profileData.phone;
            if (profileData.location) document.getElementById('location').value = profileData.location;
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        Utils.showNotification('Error loading profile data', 'error');
    }
}

async function handlePersonalSubmit(e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    try {
        const profileData = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            location: document.getElementById('location').value
        };

        // Handle password change if provided
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (currentPassword && newPassword) {
            if (newPassword !== confirmPassword) {
                Utils.showNotification('New passwords do not match', 'error');
                return;
            }
            if (!Utils.validatePassword(newPassword)) {
                Utils.showNotification('Password must be at least 6 characters', 'error');
                return;
            }
            // Note: Password change would need separate API endpoint
            profileData.passwordChanged = true;
        }

        await apiClient.updateProfile(profileData);
        saveUserProfileLocal(profileData);
        
        // Update displayed name
        if (profileData.fullName) {
            document.getElementById('profileName').textContent = profileData.fullName;
            document.getElementById('userName').textContent = profileData.fullName;
            const initials = profileData.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            document.getElementById('avatarInitials').textContent = initials;
        }
        
        Utils.showNotification('Profile updated successfully', 'success');
        
        // Clear password fields
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    } catch (error) {
        Utils.showNotification(error.message || 'Failed to update profile', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

async function handleVehicleSubmit(e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    try {
        const profileData = {
            vehicleMake: document.getElementById('vehicleMake').value,
            vehicleModel: document.getElementById('vehicleModel').value,
            evRange: parseInt(document.getElementById('evRange').value) || null,
            batteryCapacity: parseInt(document.getElementById('batteryCapacity').value) || null,
            connectorType: document.getElementById('connectorType').value
        };

        await apiClient.updateProfile(profileData);
        saveUserProfileLocal(profileData);
        Utils.showNotification('Vehicle information saved', 'success');
    } catch (error) {
        Utils.showNotification(error.message || 'Failed to save vehicle info', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

async function handlePreferencesSubmit(e) {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    try {
        const profileData = {
            preferredChargerType: document.getElementById('preferredChargerType').value,
            maxCostPerKwh: parseFloat(document.getElementById('maxCostPerKwh').value) || null,
            preferVerified: document.getElementById('preferVerified').checked,
            emailNotifications: document.getElementById('emailNotifications').checked,
            routeAlerts: document.getElementById('routeAlerts').checked
        };

        await apiClient.updateProfile(profileData);
        saveUserProfileLocal(profileData);
        Utils.showNotification('Preferences saved', 'success');
    } catch (error) {
        Utils.showNotification(error.message || 'Failed to save preferences', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Fallback functions for localStorage
function getUserProfileLocal() {
    const session = authManager.getSession();
    if (!session) return {};

    const profiles = JSON.parse(localStorage.getItem('ev_route_profiles') || '{}');
    return profiles[session.userId] || {};
}

function saveUserProfileLocal(profileData) {
    const session = authManager.getSession();
    if (!session) return;

    const profiles = JSON.parse(localStorage.getItem('ev_route_profiles') || '{}');
    profiles[session.userId] = {
        ...profiles[session.userId],
        ...profileData,
        updatedAt: new Date().toISOString()
    };
    localStorage.setItem('ev_route_profiles', JSON.stringify(profiles));
}


