// Admin Panel Logic
let adminEmail = '';

document.addEventListener('DOMContentLoaded', () => {
    // Check if admin is logged in
    if (authManager.isAuthenticated() && authManager.isAdmin()) {
        showAdminDashboard();
    } else {
        showAdminLogin();
    }

    // Load theme
    Utils.loadTheme();

    setupEventListeners();
});

function showAdminLogin() {
    document.getElementById('adminLogin').style.display = 'flex';
    document.getElementById('adminDashboard').style.display = 'none';
}

function showAdminDashboard() {
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    loadDashboardData();
}

function setupEventListeners() {
    // Admin login form
    const adminLoginForm = document.getElementById('adminLoginForm');
    adminLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('adminEmail').value.trim();
        const password = document.getElementById('adminPassword').value;
        const loginBtn = document.getElementById('adminLoginBtn');
        const btnText = loginBtn.querySelector('.btn-text');
        const btnLoader = loginBtn.querySelector('.btn-loader');

        loginBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const user = authManager.login(email, password);
            
            if (user.role !== 'admin') {
                throw new Error('Access denied. Admin only.');
            }

            adminEmail = email;
            
            // Send OTP
            const otp = authManager.generateOTP();
            authManager.saveOTP(email, otp, 'admin_login');
            console.log('Admin OTP:', otp); // Demo mode
            
            // Show OTP form
            document.getElementById('otpVerification').style.display = 'block';
            Utils.showNotification('OTP sent to your email', 'success');

        } catch (error) {
            Utils.showNotification(error.message, 'error');
        } finally {
            loginBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    });

    // OTP form
    const otpForm = document.getElementById('adminOtpForm');
    const otpInputs = document.querySelectorAll('#adminOtpForm .otp-input');
    
    setupOTPInputs(otpInputs);

    otpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const otp = Array.from(otpInputs).map(input => input.value).join('');
        
        if (otp.length !== 6) {
            Utils.showNotification('Please enter the complete 6-digit code', 'error');
            return;
        }

        try {
            if (!authManager.verifyOTP(adminEmail, otp)) {
                throw new Error('Invalid or expired OTP');
            }

            // Set admin session
            const users = authManager.getUsers();
            const user = users.find(u => u.email === adminEmail);
            if (user) {
                authManager.setSession(user);
            }

            Utils.showNotification('Login successful!', 'success');
            showAdminDashboard();

        } catch (error) {
            Utils.showNotification(error.message, 'error');
            otpInputs.forEach(input => input.value = '');
            otpInputs[0].focus();
        }
    });

    // Resend OTP
    document.getElementById('resendAdminOtp').addEventListener('click', async () => {
        try {
            const otp = authManager.generateOTP();
            authManager.saveOTP(adminEmail, otp, 'admin_login');
            console.log('New Admin OTP:', otp);
            Utils.showNotification('New OTP sent', 'success');
            otpInputs.forEach(input => input.value = '');
            otpInputs[0].focus();
        } catch (error) {
            Utils.showNotification(error.message, 'error');
        }
    });

    // Tab navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchTab(tabName);
        });
    });

    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            loadStationsList(tab.dataset.filter);
        });
    });

    // Logout
    document.getElementById('adminLogoutBtn').addEventListener('click', () => {
        authManager.clearSession();
        Utils.showNotification('Logged out successfully', 'success');
        setTimeout(() => {
            showAdminLogin();
            document.getElementById('adminLoginForm').reset();
            document.getElementById('otpVerification').style.display = 'none';
        }, 1000);
    });

    // Clear logs
    document.getElementById('clearLogsBtn')?.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all logs?')) {
            localStorage.removeItem('ev_route_logs');
            loadLogs();
            Utils.showNotification('Logs cleared', 'success');
        }
    });
}

function setupOTPInputs(inputs) {
    inputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            const value = e.target.value;
            if (value && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !input.value && index > 0) {
                inputs[index - 1].focus();
            }
        });
    });
}

function switchTab(tabName) {
    // Update nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        }
    });

    // Update content tabs
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(`tab-${tabName}`).classList.add('active');

    // Load tab data
    switch(tabName) {
        case 'stations':
            loadStationsList('all');
            break;
        case 'owners':
            loadOwnersList();
            break;
        case 'reports':
            loadReports();
            break;
        case 'logs':
            loadLogs();
            break;
    }
}

function loadDashboardData() {
    const stations = getStations();
    const pendingRegistrations = getPendingRegistrations();
    const owners = getOwners();

    document.getElementById('totalStations').textContent = stations.length;
    document.getElementById('pendingStations').textContent = pendingRegistrations.length;
    document.getElementById('totalOwners').textContent = owners.length;
    document.getElementById('verifiedStations').textContent = stations.filter(s => s.verified).length;
}

function loadStationsList(filter = 'all') {
    const listContainer = document.getElementById('stationsList');
    listContainer.innerHTML = '';

    let stations = [];
    
    if (filter === 'pending') {
        stations = getPendingRegistrations().map(reg => ({
            ...reg,
            status: 'pending'
        }));
    } else {
        stations = getStations().map(station => ({
            ...station,
            status: station.verified ? 'approved' : 'pending'
        }));
    }

    if (filter === 'approved') {
        stations = stations.filter(s => s.status === 'approved');
    } else if (filter === 'rejected') {
        stations = stations.filter(s => s.status === 'rejected');
    }

    if (stations.length === 0) {
        listContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No stations found</p>';
        return;
    }

    stations.forEach(station => {
        const item = document.createElement('div');
        item.className = 'list-item';
        
        item.innerHTML = `
            <div class="list-item-info">
                <div class="list-item-title">${station.stationName || station.name}</div>
                <div class="list-item-subtitle">${station.stationAddress || station.address}</div>
                <div style="margin-top: 10px;">
                    <span class="status-badge status-${station.status}">${station.status.toUpperCase()}</span>
                </div>
            </div>
            <div class="list-item-actions">
                ${station.status === 'pending' ? `
                    <button class="btn-success" onclick="approveStation('${station.id}')">Approve</button>
                    <button class="btn-danger" onclick="rejectStation('${station.id}')">Reject</button>
                ` : ''}
                <button class="btn-secondary" onclick="viewStationDetails('${station.id}')">View</button>
            </div>
        `;
        
        listContainer.appendChild(item);
    });
}

function loadOwnersList() {
    const listContainer = document.getElementById('ownersList');
    listContainer.innerHTML = '';

    const owners = getOwners();

    if (owners.length === 0) {
        listContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No owners registered</p>';
        return;
    }

    owners.forEach(owner => {
        const item = document.createElement('div');
        item.className = 'list-item';
        
        item.innerHTML = `
            <div class="list-item-info">
                <div class="list-item-title">${owner.name}</div>
                <div class="list-item-subtitle">${owner.email} • ${owner.phone || 'N/A'}</div>
                <div class="list-item-subtitle" style="margin-top: 5px;">Business: ${owner.businessName}</div>
            </div>
            <div class="list-item-actions">
                <button class="btn-secondary" onclick="viewOwnerDetails('${owner.id}')">View Details</button>
            </div>
        `;
        
        listContainer.appendChild(item);
    });
}

function loadReports() {
    const stations = getStations();
    const registrations = getPendingRegistrations();
    const owners = getOwners();

    // Registration Activity
    const registrationReport = document.getElementById('registrationReport');
    registrationReport.innerHTML = `
        <p><strong>Total Registrations:</strong> ${registrations.length}</p>
        <p><strong>Pending Review:</strong> ${registrations.filter(r => r.status === 'pending').length}</p>
        <p><strong>Approved:</strong> ${registrations.filter(r => r.status === 'approved').length}</p>
        <p><strong>Rejected:</strong> ${registrations.filter(r => r.status === 'rejected').length}</p>
    `;

    // Station Statistics
    const stationReport = document.getElementById('stationReport');
    stationReport.innerHTML = `
        <p><strong>Total Stations:</strong> ${stations.length}</p>
        <p><strong>Verified Stations:</strong> ${stations.filter(s => s.verified).length}</p>
        <p><strong>Unverified Stations:</strong> ${stations.filter(s => !s.verified).length}</p>
        <p><strong>Total Owners:</strong> ${owners.length}</p>
    `;
}

function loadLogs() {
    const logsContainer = document.getElementById('logsList');
    logsContainer.innerHTML = '';

    const logs = getLogs();

    if (logs.length === 0) {
        logsContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No logs available</p>';
        return;
    }

    logs.reverse().forEach(log => {
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.innerHTML = `
            <span class="log-time">[${Utils.formatDate(log.timestamp)}]</span>
            <span class="log-message">${log.message}</span>
        `;
        logsContainer.appendChild(entry);
    });
}

function approveStation(stationId) {
    const registrations = getPendingRegistrations();
    const registration = registrations.find(r => r.id === stationId);
    
    if (registration) {
        // Move to approved stations
        const stations = getStations();
        const newStation = {
            id: 'station-' + Date.now(),
            name: registration.stationName,
            address: registration.stationAddress,
            type: registration.chargerType,
            connector: registration.connectorType,
            power: registration.powerKw,
            availability: registration.availability,
            cost: registration.costPerKwh,
            amenities: registration.amenities || '',
            verified: true,
            latitude: 0, // Would be geocoded in real app
            longitude: 0,
            ownerId: registration.userId
        };
        
        stations.push(newStation);
        saveStations(stations);

        // Update owner status
        const owners = getOwners();
        let owner = owners.find(o => o.userId === registration.userId);
        if (!owner) {
            owner = {
                id: 'owner-' + Date.now(),
                userId: registration.userId,
                ...registration
            };
            owners.push(owner);
        }
        saveOwners(owners);

        // Remove from pending
        const updatedRegistrations = registrations.filter(r => r.id !== stationId);
        localStorage.setItem('ev_route_pending_registrations', JSON.stringify(updatedRegistrations));

        addLog(`Station "${registration.stationName}" approved by admin`);
        Utils.showNotification('Station approved successfully', 'success');
        loadStationsList();
        loadDashboardData();
    }
}

function rejectStation(stationId) {
    const registrations = getPendingRegistrations();
    const registration = registrations.find(r => r.id === stationId);
    
    if (registration) {
        registration.status = 'rejected';
        const updatedRegistrations = registrations.map(r => 
            r.id === stationId ? registration : r
        );
        localStorage.setItem('ev_route_pending_registrations', JSON.stringify(updatedRegistrations));

        addLog(`Station "${registration.stationName}" rejected by admin`);
        Utils.showNotification('Station rejected', 'success');
        loadStationsList();
        loadDashboardData();
    }
}

function viewStationDetails(stationId) {
    // In a real app, show detailed modal
    Utils.showNotification('Station details feature coming soon', 'info');
}

function viewOwnerDetails(ownerId) {
    // In a real app, show detailed modal
    Utils.showNotification('Owner details feature coming soon', 'info');
}

// Data management functions
function getStations() {
    const stations = localStorage.getItem('ev_route_stations');
    return stations ? JSON.parse(stations) : [];
}

function saveStations(stations) {
    localStorage.setItem('ev_route_stations', JSON.stringify(stations));
}

function getPendingRegistrations() {
    const registrations = localStorage.getItem('ev_route_pending_registrations');
    return registrations ? JSON.parse(registrations) : [];
}

function getOwners() {
    const owners = localStorage.getItem('ev_route_owners');
    return owners ? JSON.parse(owners) : [];
}

function saveOwners(owners) {
    localStorage.setItem('ev_route_owners', JSON.stringify(owners));
}

function getLogs() {
    const logs = localStorage.getItem('ev_route_logs');
    return logs ? JSON.parse(logs) : [];
}

function addLog(message) {
    const logs = getLogs();
    logs.push({
        timestamp: new Date().toISOString(),
        message: message
    });
    localStorage.setItem('ev_route_logs', JSON.stringify(logs));
}


