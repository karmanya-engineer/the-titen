// Dashboard with Google Maps Integration (Enhanced with Backend API)
// Hackathon-Winning Features: Full Google Maps integration, cost calculation, reviews, analytics
let map;
let directionsService;
let directionsRenderer;
let autocompleteOrigin;
let autocompleteDestination;
let markers = [];
let stations = [];
let mapInitialized = false;
let enhancedMap = null; // Enhanced Google Maps instance

// Initialize dashboard with enhanced features
document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    if (!Utils.checkAuth()) return;

    // Load theme
    Utils.loadTheme();

    // Initialize user info with actual user data (no more "User")
    const session = authManager.getSession();
    if (session) {
        const userName = session.name || session.email || 'User';
        document.getElementById('userName').textContent = userName;
    }

    // Initialize scroll animations
    scrollAnimations.observeAll('.route-section, .station-card, .results-section');

    // Wait for Google Maps to load
    window.onGoogleMapsLoaded = async () => {
        try {
            // Initialize enhanced map if available
            if (typeof EnhancedGoogleMaps !== 'undefined') {
                const mapElement = document.getElementById('map');
                if (mapElement) {
                    enhancedMap = new EnhancedGoogleMaps(mapElement, {
                        center: CONFIG?.MAP_DEFAULT_CENTER || { lat: 40.7128, lng: -74.0060 },
                        zoom: CONFIG?.MAP_DEFAULT_ZOOM || 10
                    });
                    await enhancedMap.init();
                    map = enhancedMap.map; // Get underlying Google Map
                    directionsService = enhancedMap.directionsService;
                    directionsRenderer = enhancedMap.directionsRenderer;
                    mapInitialized = true;
                }
            } else {
                // Fallback to standard map initialization
                await initMap();
            }

            // Initialize autocomplete
            if (typeof google !== 'undefined' && google.maps) {
                initAutocomplete();
            }

            // Load stations from backend
            await loadStations();

            // Event listeners
            setupEventListeners();
        } catch (error) {
            console.error('Error initializing dashboard:', error);
            Utils.showNotification('Error initializing map. Please check your Google Maps API key.', 'error');
        }
    };

    // If Google Maps is already loaded
    if (typeof google !== 'undefined' && google.maps) {
        window.onGoogleMapsLoaded();
    } else {
        // Wait a bit for the script to load
        setTimeout(() => {
            if (typeof google !== 'undefined' && google.maps && !mapInitialized) {
                window.onGoogleMapsLoaded();
            }
        }, 1000);
    }
});

function initMap() {
    if (!document.getElementById('map')) {
        console.error('Map container not found');
        return;
    }

    // Use config for default center
    const defaultCenter = CONFIG ? CONFIG.MAP_DEFAULT_CENTER : { lat: 40.7128, lng: -74.0060 };
    const defaultZoom = CONFIG ? CONFIG.MAP_DEFAULT_ZOOM : 10;

    try {
        map = new google.maps.Map(document.getElementById('map'), {
            center: defaultCenter,
            zoom: defaultZoom,
            styles: getMapStyles(),
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true,
            disableDefaultUI: false
        });

        directionsService = new google.maps.DirectionsService();
        directionsRenderer = new google.maps.DirectionsRenderer({
            map: map,
            suppressMarkers: false,
            polylineOptions: {
                strokeColor: '#10B981',
                strokeWeight: 4,
                strokeOpacity: 0.8
            }
        });

        mapInitialized = true;
        
        // Animate map container
        const mapContainer = document.querySelector('.map-section');
        if (mapContainer) {
            animationManager.fadeIn(mapContainer, 500);
        }

        return Promise.resolve();
    } catch (error) {
        console.error('Error initializing map:', error);
        const mapContainer = document.getElementById('map');
        if (mapContainer) {
            mapContainer.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; 
                           background: var(--surface); color: var(--text-secondary); flex-direction: column; gap: 10px;">
                    <p>⚠️ Map could not be loaded</p>
                    <p style="font-size: 0.9rem;">Please check your Google Maps API key in config.js</p>
                </div>
            `;
        }
        return Promise.reject(error);
    }
}

function getMapStyles() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    if (isDark) {
        return [
            { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
            {
                featureType: 'administrative.locality',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#d59563' }]
            },
            {
                featureType: 'poi',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#d59563' }]
            },
            {
                featureType: 'poi.park',
                elementType: 'geometry',
                stylers: [{ color: '#263c3f' }]
            },
            {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{ color: '#38414e' }]
            },
            {
                featureType: 'road',
                elementType: 'geometry.stroke',
                stylers: [{ color: '#212a37' }]
            },
            {
                featureType: 'road',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#9ca5b3' }]
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry',
                stylers: [{ color: '#746855' }]
            },
            {
                featureType: 'road.highway',
                elementType: 'geometry.stroke',
                stylers: [{ color: '#1f2835' }]
            },
            {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#17263c' }]
            },
            {
                featureType: 'water',
                elementType: 'labels.text.fill',
                stylers: [{ color: '#515c6d' }]
            }
        ];
    }
    return [];
}

function initAutocomplete() {
    const originInput = document.getElementById('origin');
    const destinationInput = document.getElementById('destination');

    autocompleteOrigin = new google.maps.places.Autocomplete(originInput, {
        types: ['geocode']
    });

    autocompleteDestination = new google.maps.places.Autocomplete(destinationInput, {
        types: ['geocode']
    });

    autocompleteOrigin.addListener('place_changed', () => {
        const place = autocompleteOrigin.getPlace();
        if (place.geometry) {
            map.setCenter(place.geometry.location);
            map.setZoom(12);
        }
    });

    autocompleteDestination.addListener('place_changed', () => {
        const place = autocompleteDestination.getPlace();
        if (place.geometry) {
            map.setCenter(place.geometry.location);
            map.setZoom(12);
        }
    });
}

function setupEventListeners() {
    // Plan route button with enhanced interaction
    const planBtn = document.getElementById('plan-route');
    eventManager.on(planBtn, 'click', handleRoutePlanning);
    
    // Enter key to plan route
    const originInput = document.getElementById('origin');
    const destinationInput = document.getElementById('destination');
    
    [originInput, destinationInput].forEach(input => {
        eventManager.on(input, 'keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                planBtn.click();
            }
        });
    });

    // Theme toggle with animation
    const themeToggle = document.getElementById('themeToggle');
    eventManager.on(themeToggle, 'click', () => {
        animationManager.scale(themeToggle, 1, 0.9, 100, () => {
            const theme = Utils.toggleTheme();
            themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
            
            // Update map styles if available
            if (map && mapInitialized) {
                map.setOptions({ styles: getMapStyles() });
            }
            
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
            if (userDropdown.classList.contains('show')) {
                animationManager.fadeOut(userDropdown, 200, () => {
                    userDropdown.classList.remove('show');
                });
            }
        }
    });

    // Logout with confirmation
    eventManager.on(document.getElementById('logoutBtn'), 'click', () => {
        if (confirm('Are you sure you want to logout?')) {
            authManager.clearSession();
            Utils.showNotification('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        }
    });

    // Filter stations button (if exists)
    const filterBtn = document.getElementById('filterStations');
    if (filterBtn) {
        eventManager.on(filterBtn, 'click', () => {
            Utils.showNotification('Filter feature coming soon!', 'info');
        });
    }

    // Keyboard shortcuts
    eventManager.on(document, 'keydown', (e) => {
        // ESC to close dropdowns
        if (e.key === 'Escape' && userDropdown.classList.contains('show')) {
            animationManager.fadeOut(userDropdown, 200, () => {
                userDropdown.classList.remove('show');
            });
        }
        
        // Ctrl/Cmd + K to focus origin input
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            originInput.focus();
        }
    });
}

async function handleRoutePlanning() {
    const origin = document.getElementById('origin').value.trim();
    const destination = document.getElementById('destination').value.trim();
    const evRange = parseInt(document.getElementById('ev-range').value) || CONFIG?.DEFAULT_EV_RANGE || 250;
    const batteryPercent = parseInt(document.getElementById('battery-percent').value) || CONFIG?.DEFAULT_BATTERY_PERCENT || 80;

    if (!origin || !destination) {
        Utils.showNotification('Please enter both origin and destination', 'error');
        return;
    }

    const planBtn = document.getElementById('plan-route');
    const originalText = planBtn.textContent;
    planBtn.disabled = true;
    planBtn.textContent = 'Planning...';
    
    // Add loading animation
    planBtn.style.opacity = '0.7';

    try {
        // Use backend API for route planning
        let routeData;
        try {
            routeData = await apiClient.planRoute(origin, destination, evRange, batteryPercent);
            const route = routeData.route;
            const nearbyStations = routeData.stations || [];

            // Display results with animations
            displayRouteResults(route, route.chargingStops || 0, (evRange * batteryPercent) / 100);
            displayChargingStations(nearbyStations);
            
            // Try to display route on map if Google Maps is available
            if (mapInitialized && typeof google !== 'undefined' && google.maps) {
                try {
                    await displayRouteOnMap(origin, destination);
                } catch (mapError) {
                    console.warn('Could not display route on map:', mapError);
                }
            }

            // Show results section with animation
            const resultsSection = document.getElementById('results-section');
            resultsSection.style.display = 'block';
            animationManager.slideIn(resultsSection, 'up', 400);
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        } catch (apiError) {
            // Fallback to local calculation
            console.warn('Backend API unavailable, using local calculation:', apiError);
            if (mapInitialized && typeof google !== 'undefined' && google.maps) {
                const route = await calculateRoute(origin, destination);
                const availableRange = (evRange * batteryPercent) / 100;
                const routeDistance = route.distance;
                const chargingStops = calculateChargingStops(routeDistance, availableRange, evRange);
                const nearbyStations = findNearbyStations(route.path, stations, routeDistance);
                
                displayRouteResults(route, chargingStops, availableRange);
                displayChargingStations(nearbyStations);
                displayRouteOnMap(origin, destination);
                
                const resultsSection = document.getElementById('results-section');
                resultsSection.style.display = 'block';
                animationManager.slideIn(resultsSection, 'up', 400);
            } else {
                throw new Error('Map and API unavailable');
            }
        }

    } catch (error) {
        console.error('Route planning error:', error);
        Utils.showNotification('Error planning route. Please try again.', 'error');
    } finally {
        planBtn.disabled = false;
        planBtn.textContent = originalText;
        planBtn.style.opacity = '1';
    }
}

function calculateRoute(origin, destination) {
    return new Promise((resolve, reject) => {
        directionsService.route({
            origin: origin,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING,
            optimizeWaypoints: true
        }, (result, status) => {
            if (status === 'OK') {
                const route = result.routes[0];
                const leg = route.legs[0];
                
                // Extract path coordinates
                const path = [];
                route.overview_path.forEach(point => {
                    path.push({ lat: point.lat(), lng: point.lng() });
                });

                resolve({
                    distance: leg.distance.value / 1609.34, // Convert meters to miles
                    duration: leg.duration.value / 3600, // Convert seconds to hours
                    path: path,
                    bounds: route.bounds
                });
            } else {
                reject(new Error('Route calculation failed: ' + status));
            }
        });
    });
}

function calculateChargingStops(totalDistance, availableRange, fullRange) {
    if (totalDistance <= availableRange) {
        return 0;
    }

    const remainingDistance = totalDistance - availableRange;
    const stopsNeeded = Math.ceil(remainingDistance / (fullRange * 0.8)); // Use 80% of range for safety
    return stopsNeeded;
}

function findNearbyStations(routePath, allStations, routeDistance) {
    // Find stations within 5 miles of the route
    const nearbyStations = [];
    const maxDistance = 5; // miles

    allStations.forEach(station => {
        let minDistance = Infinity;
        
        // Find minimum distance from station to any point on route
        routePath.forEach(point => {
            const distance = Utils.calculateDistance(
                point.lat, point.lng,
                station.latitude, station.longitude
            );
            if (distance < minDistance) {
                minDistance = distance;
            }
        });

        if (minDistance <= maxDistance) {
            nearbyStations.push({
                ...station,
                distanceFromRoute: minDistance
            });
        }
    });

    // Sort by distance
    return nearbyStations.sort((a, b) => a.distanceFromRoute - b.distanceFromRoute);
}

function displayRouteResults(route, chargingStops, estimatedRange) {
    document.getElementById('total-distance').textContent = `${route.distance.toFixed(1)} mi`;
    document.getElementById('estimated-time').textContent = Utils.formatTime(route.duration);
    document.getElementById('charging-stops').textContent = `${chargingStops} stops`;
    if (document.getElementById('estimated-range')) {
        document.getElementById('estimated-range').textContent = `${estimatedRange.toFixed(0)} mi`;
    }
    
    // Add more route details if available
    if (route.totalCost && route.totalCost > 0) {
        // Create or update cost display
        let costDisplay = document.getElementById('route-total-cost');
        if (!costDisplay) {
            const routeDetails = document.querySelector('.route-details');
            if (routeDetails) {
                costDisplay = document.createElement('div');
                costDisplay.className = 'detail-item';
                costDisplay.id = 'route-total-cost';
                costDisplay.innerHTML = `
                    <span class="label">Total Trip Cost:</span>
                    <span class="value cost-value">$${route.totalCost.toFixed(2)}</span>
                `;
                routeDetails.appendChild(costDisplay);
            }
        } else {
            costDisplay.querySelector('.cost-value').textContent = `$${route.totalCost.toFixed(2)}`;
        }
    }
    
    if (route.estimatedEnergy) {
        let energyDisplay = document.getElementById('route-energy');
        if (!energyDisplay) {
            const routeDetails = document.querySelector('.route-details');
            if (routeDetails) {
                energyDisplay = document.createElement('div');
                energyDisplay.className = 'detail-item';
                energyDisplay.id = 'route-energy';
                energyDisplay.innerHTML = `
                    <span class="label">Energy Required:</span>
                    <span class="value">${route.estimatedEnergy.toFixed(1)} kWh</span>
                `;
                routeDetails.appendChild(energyDisplay);
            }
        } else {
            energyDisplay.querySelector('.value').textContent = `${route.estimatedEnergy.toFixed(1)} kWh`;
        }
    }
}

async function displayRouteOnMap(origin, destination) {
    if (!mapInitialized || !directionsService || !directionsRenderer) {
        return;
    }

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    markers = [];

    return new Promise((resolve, reject) => {
        directionsService.route({
            origin: origin,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING,
            optimizeWaypoints: true
        }, (result, status) => {
            if (status === 'OK') {
                directionsRenderer.setDirections(result);
                
                // Fit map to show entire route
                const bounds = new google.maps.LatLngBounds();
                result.routes[0].legs.forEach(leg => {
                    bounds.extend(leg.start_location);
                    bounds.extend(leg.end_location);
                });
                map.fitBounds(bounds);
                
                resolve(result);
            } else {
                reject(new Error('Route calculation failed: ' + status));
            }
        });
    });
}

function displayChargingStations(nearbyStations) {
    const stationsList = document.getElementById('stations-list');
    stationsList.innerHTML = '';

    // Clear existing station markers
    markers.forEach(marker => marker.setMap(null));
    markers = [];

    if (nearbyStations.length === 0) {
        stationsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No charging stations found along this route. Register as an owner to add stations!</p>';
        return;
    }

    nearbyStations.forEach(station => {
        const stationCard = createStationCard(station);
        stationsList.appendChild(stationCard);

        // Add marker to map with enhanced info window
        if (mapInitialized && station.latitude && station.longitude) {
            const marker = new google.maps.Marker({
                position: { lat: station.latitude, lng: station.longitude },
                map: map,
                icon: {
                    url: station.verified ? 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTQiIGZpbGw9IiMwMEI4OTQiLz4KPHBhdGggZD0iTTEwIDE2TDE1IDIxTDIyIDEyIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4=' : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTQiIGZpbGw9IiMwOTg0RTMiLz4KPHBhdGggZD0iTTE2IDEwVjIyTTE2IDEwSDE2TTE2IDEwVjE2TTE2IDIySDE2IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjMiLz4KPC9zdmc+',
                    scaledSize: new google.maps.Size(32, 32),
                    anchor: new google.maps.Point(16, 32)
                },
                title: station.name,
                animation: google.maps.Animation.DROP
            });

            // Create info window with detailed information
            const infoWindow = new google.maps.InfoWindow({
                content: `
                    <div style="min-width: 250px; font-family: 'Inter', sans-serif; padding: 8px;">
                        <h3 style="margin: 0 0 8px 0; font-size: 1.1rem; color: #111827;">
                            ${station.name}
                            ${station.verified ? '<span style="color: #10B981; font-size: 0.85rem;">✓ Verified</span>' : ''}
                        </h3>
                        <p style="margin: 0 0 8px 0; color: #6B7280; font-size: 0.9rem;">${station.address || ''}</p>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.85rem;">
                            <div><strong>Power:</strong> ${station.power || 'N/A'} kW</div>
                            <div><strong>Cost:</strong> $${(station.cost || 0).toFixed(2)}/kWh</div>
                            ${station.estimatedChargingTime ? `<div><strong>Time:</strong> ${parseFloat(station.estimatedChargingTime * 60).toFixed(0)} min</div>` : ''}
                            ${station.estimatedChargingCost ? `<div><strong>Est. Cost:</strong> $${station.estimatedChargingCost.toFixed(2)}</div>` : ''}
                        </div>
                        ${station.distanceFromRoute ? `<p style="margin: 8px 0 0 0; color: #10B981; font-weight: 600;">${station.distanceFromRoute.toFixed(1)} mi from route</p>` : ''}
                    </div>
                `
            });

            marker.addListener('click', () => {
                // Close all other info windows
                markers.forEach(m => {
                    if (m.infoWindow) {
                        m.infoWindow.close();
                    }
                });
                
                infoWindow.open(map, marker);
                
                // Scroll to card and highlight
                stationsList.scrollTop = stationCard.offsetTop - stationsList.offsetTop - 20;
                stationCard.style.background = 'rgba(16, 185, 129, 0.1)';
                stationCard.style.transform = 'scale(1.02)';
                stationCard.style.transition = 'all 0.3s ease';
                
                setTimeout(() => {
                    stationCard.style.background = '';
                    stationCard.style.transform = '';
                }, 2000);
            });

            marker.infoWindow = infoWindow;
            markers.push(marker);
        }
    });
}

function createStationCard(station) {
    const card = document.createElement('div');
    card.className = `station-card ${station.verified ? 'verified' : ''}`;
    
    // Calculate charging time estimate if available
    const chargingTime = station.estimatedChargingTime ? 
        `${parseFloat(station.estimatedChargingTime * 60).toFixed(0)} min` : 
        'N/A';
    
    // Rating stars
    const rating = parseFloat(station.rating || 0);
    const stars = '⭐'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
    
    card.innerHTML = `
        ${station.verified ? '<div class="verified-badge">✓ Owner Verified</div>' : ''}
        <div class="station-header">
            <div>
                <div class="station-name">${station.name}</div>
                <div class="station-address">${station.address}</div>
                ${rating > 0 ? `
                    <div class="station-rating">
                        <span class="stars">${stars}</span>
                        <span class="rating-value">${rating.toFixed(1)}</span>
                        ${station.reviews ? `<span class="review-count">(${station.reviews} reviews)</span>` : ''}
                    </div>
                ` : ''}
            </div>
        </div>
        <div class="station-details">
            <div class="detail-badge">
                <strong>Type:</strong> <span>${station.type || 'N/A'}</span>
            </div>
            <div class="detail-badge">
                <strong>Power:</strong> <span>${station.power || 'N/A'} kW</span>
            </div>
            <div class="detail-badge">
                <strong>Cost:</strong> <span>$${(station.cost || 0).toFixed(2)}/kWh</span>
            </div>
            ${station.estimatedChargingCost ? `
                <div class="detail-badge cost-badge">
                    <strong>Est. Cost:</strong> <span>$${station.estimatedChargingCost.toFixed(2)}</span>
                </div>
            ` : ''}
            <div class="detail-badge">
                <strong>Availability:</strong> <span>${station.availability || 'N/A'}</span>
            </div>
            ${chargingTime !== 'N/A' ? `
                <div class="detail-badge">
                    <strong>Charging Time:</strong> <span>${chargingTime}</span>
                </div>
            ` : ''}
            ${station.connector ? `
                <div class="detail-badge">
                    <strong>Connector:</strong> <span>${station.connector}</span>
                </div>
            ` : ''}
            ${station.amenities ? `
                <div class="detail-badge amenities">
                    <strong>Amenities:</strong> <span>${station.amenities}</span>
                </div>
            ` : ''}
        </div>
        <div class="station-footer">
            <div class="distance-badge">${station.distanceFromRoute ? station.distanceFromRoute.toFixed(1) + ' mi from route' : 'Near route'}</div>
            ${station.estimatedChargingTime ? `
                <button class="btn-view-details" data-station-id="${station.id}">View Details</button>
            ` : ''}
        </div>
    `;

    // Add click handlers
    card.addEventListener('click', (e) => {
        // Don't trigger if clicking on button
        if (e.target.classList.contains('btn-view-details')) return;
        
        if (mapInitialized && station.latitude && station.longitude) {
            map.setCenter({ lat: station.latitude, lng: station.longitude });
            map.setZoom(15);
            
            // Highlight marker
            const marker = markers.find(m => {
                const pos = m.getPosition();
                return pos.lat() === station.latitude && pos.lng() === station.longitude;
            });
            if (marker) {
                marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(() => marker.setAnimation(null), 2000);
            }
        }
    });

    // View details button
    const viewDetailsBtn = card.querySelector('.btn-view-details');
    if (viewDetailsBtn) {
        viewDetailsBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await showStationDetails(station);
        });
    }

    return card;
}

// Show station details modal
async function showStationDetails(station) {
    // Load reviews if available
    let reviews = [];
    try {
        reviews = await apiClient.getStationReviews(station.id);
    } catch (error) {
        console.warn('Could not load reviews:', error);
    }

    const modal = document.createElement('div');
    modal.className = 'station-details-modal';
    modal.innerHTML = `
        <div class="modal-content large">
            <div class="modal-header">
                <h3>${station.name}</h3>
                <button class="close-modal" onclick="this.closest('.station-details-modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="station-detail-section">
                    <h4>Location</h4>
                    <p>${station.address || 'N/A'}</p>
                    ${station.distanceFromRoute ? `<p>Distance from route: ${station.distanceFromRoute.toFixed(1)} miles</p>` : ''}
                </div>
                <div class="station-detail-section">
                    <h4>Charging Information</h4>
                    <div class="detail-grid">
                        <div><strong>Type:</strong> ${station.type || 'N/A'}</div>
                        <div><strong>Power:</strong> ${station.power || 'N/A'} kW</div>
                        <div><strong>Connector:</strong> ${station.connector || 'N/A'}</div>
                        <div><strong>Cost:</strong> $${(station.cost || 0).toFixed(2)}/kWh</div>
                        ${station.estimatedChargingTime ? `<div><strong>Charging Time:</strong> ${parseFloat(station.estimatedChargingTime * 60).toFixed(0)} minutes</div>` : ''}
                        ${station.estimatedChargingCost ? `<div><strong>Estimated Cost:</strong> $${station.estimatedChargingCost.toFixed(2)}</div>` : ''}
                    </div>
                </div>
                ${station.amenities ? `
                    <div class="station-detail-section">
                        <h4>Amenities</h4>
                        <p>${station.amenities}</p>
                    </div>
                ` : ''}
                ${reviews.length > 0 ? `
                    <div class="station-detail-section">
                        <h4>Reviews (${reviews.length})</h4>
                        <div class="reviews-list">
                            ${reviews.slice(0, 5).map(review => `
                                <div class="review-item">
                                    <div class="review-header">
                                        <strong>${review.userName}</strong>
                                        <span class="review-rating">${'⭐'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
                                    </div>
                                    ${review.comment ? `<p class="review-comment">${review.comment}</p>` : ''}
                                    <small class="review-date">${new Date(review.createdAt).toLocaleDateString()}</small>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                <div class="modal-actions">
                    <button class="btn-secondary" onclick="this.closest('.station-details-modal').remove()">Close</button>
                    <button class="btn-primary" onclick="navigator.clipboard.writeText('${station.address || ''}'); Utils.showNotification('Address copied!', 'success');">Copy Address</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    animationManager.scale(modal.querySelector('.modal-content'), 0.9, 1, 300);
}

async function loadStations() {
    try {
        // Load stations from backend API
        stations = await apiClient.getStations();
        
        // If no stations, initialize with sample data
        if (!stations || stations.length === 0) {
            stations = [
                {
                    id: 'station-1',
                    name: "Electrify America - Downtown",
                    address: "123 Main St, New York, NY 10001",
                    type: "DC Fast",
                    connector: "CCS",
                    power: 150,
                    availability: "24/7",
                    cost: 0.43,
                    amenities: "Restroom, Coffee, WiFi",
                    verified: true,
                    latitude: 40.7128,
                    longitude: -74.0060
                },
                {
                    id: 'station-2',
                    name: "Tesla Supercharger - Highway Exit",
                    address: "456 Highway Blvd, New York, NY 10002",
                    type: "Tesla Supercharger",
                    connector: "Tesla",
                    power: 250,
                    availability: "24/7",
                    cost: 0.28,
                    amenities: "Restroom, Snacks",
                    verified: true,
                    latitude: 40.7580,
                    longitude: -73.9855
                }
            ];
        }
        
        console.log(`Loaded ${stations.length} charging stations`);
    } catch (error) {
        console.error('Error loading stations:', error);
        // Fallback to localStorage
        const savedStations = localStorage.getItem('ev_route_stations');
        if (savedStations) {
            stations = JSON.parse(savedStations);
        } else {
            stations = [];
        }
    }
}



