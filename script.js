// EV Smart Route & Charging Assistant
// Main application state
const appState = {
    stations: [],
    currentRoute: null,
    evRange: 250
};

// Sample verified charging stations (in a real app, this would come from a database)
const sampleStations = [
    {
        id: 1,
        name: "Electrify America - Downtown",
        address: "123 Main St, City, State 12345",
        type: "DC Fast",
        connector: "CCS",
        power: 150,
        availability: "24/7",
        cost: 0.43,
        amenities: "Restroom, Coffee, WiFi, Food Court",
        verified: true,
        latitude: 40.7128,
        longitude: -74.0060
    },
    {
        id: 2,
        name: "Tesla Supercharger - Highway Exit 42",
        address: "456 Highway Blvd, City, State 12345",
        type: "Tesla Supercharger",
        connector: "Tesla",
        power: 250,
        availability: "24/7",
        cost: 0.28,
        amenities: "Restroom, Snacks",
        verified: true,
        latitude: 40.7580,
        longitude: -73.9855
    },
    {
        id: 3,
        name: "ChargePoint - Shopping Center",
        address: "789 Mall Dr, City, State 12345",
        type: "Level 2",
        connector: "Type 2",
        power: 7.2,
        availability: "Business Hours",
        cost: 0.25,
        amenities: "Shopping, Restroom, WiFi",
        verified: false,
        latitude: 40.7505,
        longitude: -73.9934
    }
];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Load sample stations
    appState.stations = [...sampleStations];
    
    // Event listeners
    document.getElementById('plan-route').addEventListener('click', handleRoutePlanning);
    document.getElementById('add-station').addEventListener('click', openAddStationModal);
    document.getElementById('close-modal').addEventListener('click', closeAddStationModal);
    document.getElementById('cancel-add').addEventListener('click', closeAddStationModal);
    document.getElementById('station-form').addEventListener('submit', handleAddStation);
    
    // Close modal on outside click
    document.getElementById('add-station-modal').addEventListener('click', (e) => {
        if (e.target.id === 'add-station-modal') {
            closeAddStationModal();
        }
    });
}

// Route Planning Handler
function handleRoutePlanning() {
    const origin = document.getElementById('origin').value.trim();
    const destination = document.getElementById('destination').value.trim();
    const evRange = parseInt(document.getElementById('ev-range').value) || 250;
    
    if (!origin || !destination) {
        alert('Please enter both origin and destination');
        return;
    }
    
    appState.evRange = evRange;
    
    // Simulate route calculation
    // In a real app, this would use a mapping API like Google Maps, Mapbox, etc.
    const route = calculateRoute(origin, destination, evRange);
    appState.currentRoute = route;
    
    displayRouteResults(route);
    displayChargingStations(route);
    
    // Show results section
    document.getElementById('results-section').style.display = 'block';
    document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
}

// Calculate route (simulated - in real app would use mapping API)
function calculateRoute(origin, destination, evRange) {
    // Simulate route calculation
    const totalDistance = Math.floor(Math.random() * 300) + 200; // 200-500 miles
    const estimatedTime = Math.floor(totalDistance / 60); // Assuming 60 mph average
    const chargingStops = Math.ceil(totalDistance / (evRange * 0.8)); // 80% of range for safety
    
    return {
        origin,
        destination,
        totalDistance,
        estimatedTime,
        chargingStops,
        waypoints: generateWaypoints(totalDistance, chargingStops)
    };
}

// Generate waypoints along route
function generateWaypoints(totalDistance, numStops) {
    const waypoints = [];
    const segmentDistance = totalDistance / (numStops + 1);
    
    for (let i = 1; i <= numStops; i++) {
        waypoints.push({
            distance: Math.floor(segmentDistance * i),
            location: `Waypoint ${i}`
        });
    }
    
    return waypoints;
}

// Display route results
function displayRouteResults(route) {
    document.getElementById('total-distance').textContent = `${route.totalDistance} miles`;
    document.getElementById('estimated-time').textContent = `${route.estimatedTime} hours`;
    document.getElementById('charging-stops').textContent = `${route.chargingStops} stops`;
}

// Display charging stations along route
function displayChargingStations(route) {
    const stationsList = document.getElementById('stations-list');
    stationsList.innerHTML = '';
    
    // Filter and sort stations by relevance (in real app, would filter by proximity to route)
    const relevantStations = appState.stations
        .map(station => ({
            ...station,
            distance: Math.floor(Math.random() * 50) + 5 // Simulated distance from route
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, route.chargingStops + 2); // Show a few more than needed
    
    if (relevantStations.length === 0) {
        stationsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No charging stations found along this route. Add one to help others!</p>';
        return;
    }
    
    relevantStations.forEach(station => {
        const stationCard = createStationCard(station);
        stationsList.appendChild(stationCard);
    });
}

// Create station card element
function createStationCard(station) {
    const card = document.createElement('div');
    card.className = `station-card ${station.verified ? 'verified' : ''}`;
    
    card.innerHTML = `
        ${station.verified ? '<div class="verified-badge">✓ Owner Verified</div>' : ''}
        <div class="station-header">
            <div>
                <div class="station-name">${station.name}</div>
                <div class="station-address">${station.address}</div>
            </div>
        </div>
        <div class="station-details">
            <div class="detail-badge">
                <strong>Type:</strong> <span>${station.type}</span>
            </div>
            <div class="detail-badge">
                <strong>Connector:</strong> <span>${station.connector}</span>
            </div>
            <div class="detail-badge">
                <strong>Power:</strong> <span>${station.power} kW</span>
            </div>
            <div class="detail-badge">
                <strong>Availability:</strong> <span>${station.availability}</span>
            </div>
            <div class="detail-badge">
                <strong>Cost:</strong> <span>$${station.cost.toFixed(2)}/kWh</span>
            </div>
            ${station.amenities ? `
            <div class="detail-badge">
                <strong>Amenities:</strong> <span>${station.amenities}</span>
            </div>
            ` : ''}
        </div>
        <div class="distance-badge">${station.distance || 'N/A'} miles from route</div>
    `;
    
    return card;
}

// Open add station modal
function openAddStationModal() {
    document.getElementById('add-station-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Close add station modal
function closeAddStationModal() {
    document.getElementById('add-station-modal').style.display = 'none';
    document.getElementById('station-form').reset();
    document.body.style.overflow = 'auto';
}

// Handle add station form submission
function handleAddStation(e) {
    e.preventDefault();
    
    const newStation = {
        id: Date.now(),
        name: document.getElementById('station-name').value,
        address: document.getElementById('station-address').value,
        type: document.getElementById('station-type').value,
        connector: document.getElementById('connector-type').value,
        power: parseFloat(document.getElementById('power-kw').value) || 0,
        availability: document.getElementById('availability').value,
        cost: parseFloat(document.getElementById('cost').value) || 0,
        amenities: document.getElementById('amenities').value || '',
        verified: document.getElementById('owner-verified').checked,
        latitude: 0, // Would be geocoded in real app
        longitude: 0
    };
    
    // Add to stations array
    appState.stations.push(newStation);
    
    // If route is already planned, refresh the stations list
    if (appState.currentRoute) {
        displayChargingStations(appState.currentRoute);
    }
    
    // Close modal
    closeAddStationModal();
    
    // Show success message
    showNotification('Charging station added successfully!', 'success');
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--success)' : 'var(--secondary-color)'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: var(--shadow-lg);
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
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
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 300);
    }, 3000);
}

// Utility function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
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

// Export for potential use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { appState, calculateDistance };
}

