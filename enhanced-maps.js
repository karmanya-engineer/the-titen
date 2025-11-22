// Enhanced Google Maps Integration with More Features

class EnhancedGoogleMaps {
    constructor(mapElement, options = {}) {
        this.mapElement = mapElement;
        this.map = null;
        this.markers = [];
        this.infoWindows = [];
        this.directionsService = null;
        this.directionsRenderer = null;
        this.placesService = null;
        this.geocoder = null;
        this.options = {
            center: options.center || { lat: 40.7128, lng: -74.0060 },
            zoom: options.zoom || 10,
            styles: this.getMapStyles(),
            ...options
        };
        this.isInitialized = false;
    }

    async init() {
        if (!window.google || !window.google.maps) {
            throw new Error('Google Maps API not loaded');
        }

        // Initialize map
        this.map = new google.maps.Map(this.mapElement, {
            center: this.options.center,
            zoom: this.options.zoom,
            styles: this.options.styles,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true,
            disableDefaultUI: false,
            gestureHandling: 'cooperative',
            restriction: null,
            minZoom: 3,
            maxZoom: 20
        });

        // Initialize services
        this.directionsService = new google.maps.DirectionsService();
        this.directionsRenderer = new google.maps.DirectionsRenderer({
            map: this.map,
            suppressMarkers: false,
            polylineOptions: {
                strokeColor: '#10B981',
                strokeWeight: 5,
                strokeOpacity: 0.8
            },
            markerOptions: {
                icon: {
                    url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                    scaledSize: new google.maps.Size(32, 32)
                }
            }
        });

        this.geocoder = new google.maps.Geocoder();
        this.placesService = new google.maps.places.PlacesService(this.map);

        // Add click listener for map
        this.map.addListener('click', (e) => {
            this.onMapClick(e);
        });

        this.isInitialized = true;
        return this.map;
    }

    // Get map styles based on theme
    getMapStyles() {
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

    // Add marker with info window
    addMarker(position, data = {}) {
        if (!this.isInitialized) {
            console.error('Map not initialized');
            return null;
        }

        const marker = new google.maps.Marker({
            position: position,
            map: this.map,
            title: data.title || 'Location',
            icon: this.getMarkerIcon(data),
            animation: google.maps.Animation.DROP,
            optimized: true
        });

        // Create info window if data provided
        if (data.title || data.content) {
            const infoWindow = new google.maps.InfoWindow({
                content: this.createInfoWindowContent(data)
            });

            marker.addListener('click', () => {
                // Close all other info windows
                this.infoWindows.forEach(iw => iw.close());
                infoWindow.open(this.map, marker);
            });

            this.infoWindows.push(infoWindow);
        }

        this.markers.push(marker);
        return marker;
    }

    // Get custom marker icon
    getMarkerIcon(data) {
        if (data.verified) {
            return {
                url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTQiIGZpbGw9IiMwMEI4OTQiLz4KPHBhdGggZD0iTTEwIDE2TDE1IDIxTDIyIDEyIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjMiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8L3N2Zz4=',
                scaledSize: new google.maps.Size(32, 32),
                anchor: new google.maps.Point(16, 16)
            };
        }
        return {
            url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTQiIGZpbGw9IiMwOTg0RTMiLz4KPHBhdGggZD0iTTE2IDEwVjIyTTE2IDEwSDE2TTE2IDEwVjE2TTE2IDIySDE2IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjMiLz4KPC9zdmc+',
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 16)
        };
    }

    // Create info window content
    createInfoWindowContent(data) {
        return `
            <div style="padding: 12px; min-width: 200px; font-family: 'Inter', sans-serif;">
                <h3 style="margin: 0 0 8px 0; font-size: 1.1rem; color: var(--text-primary);">
                    ${data.title || 'Location'}
                </h3>
                ${data.address ? `<p style="margin: 0 0 8px 0; color: var(--text-secondary); font-size: 0.9rem;">${data.address}</p>` : ''}
                ${data.content ? `<div style="margin-top: 8px; font-size: 0.9rem; color: var(--text-primary);">${data.content}</div>` : ''}
                ${data.verified ? `<span style="display: inline-block; margin-top: 8px; padding: 4px 8px; background: #10B981; color: white; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">✓ Verified</span>` : ''}
            </div>
        `;
    }

    // Display route
    async displayRoute(origin, destination, waypoints = []) {
        if (!this.isInitialized) {
            throw new Error('Map not initialized');
        }

        return new Promise((resolve, reject) => {
            const request = {
                origin: origin,
                destination: destination,
                travelMode: google.maps.TravelMode.DRIVING,
                optimizeWaypoints: waypoints.length > 0,
                waypoints: waypoints.length > 0 ? waypoints : undefined
            };

            this.directionsService.route(request, (result, status) => {
                if (status === 'OK') {
                    this.directionsRenderer.setDirections(result);
                    
                    // Fit map to show entire route
                    const bounds = new google.maps.LatLngBounds();
                    result.routes[0].legs.forEach(leg => {
                        bounds.extend(leg.start_location);
                        bounds.extend(leg.end_location);
                    });
                    this.map.fitBounds(bounds);
                    
                    resolve(result);
                } else {
                    reject(new Error('Route calculation failed: ' + status));
                }
            });
        });
    }

    // Geocode address
    async geocodeAddress(address) {
        if (!this.isInitialized) {
            throw new Error('Map not initialized');
        }

        return new Promise((resolve, reject) => {
            this.geocoder.geocode({ address: address }, (results, status) => {
                if (status === 'OK') {
                    resolve({
                        location: results[0].geometry.location,
                        formattedAddress: results[0].formatted_address,
                        placeId: results[0].place_id
                    });
                } else {
                    reject(new Error('Geocoding failed: ' + status));
                }
            });
        });
    }

    // Search nearby places
    async searchNearby(location, radius, type = 'gas_station') {
        if (!this.isInitialized) {
            throw new Error('Map not initialized');
        }

        return new Promise((resolve, reject) => {
            const request = {
                location: location,
                radius: radius,
                type: type
            };

            this.placesService.nearbySearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    resolve(results);
                } else {
                    reject(new Error('Places search failed: ' + status));
                }
            });
        });
    }

    // Clear all markers
    clearMarkers() {
        this.markers.forEach(marker => marker.setMap(null));
        this.markers = [];
        this.infoWindows = [];
    }

    // Clear route
    clearRoute() {
        if (this.directionsRenderer) {
            this.directionsRenderer.setDirections({ routes: [] });
        }
    }

    // Center map on location
    centerOn(location, zoom = null) {
        if (!this.isInitialized) return;
        
        this.map.setCenter(location);
        if (zoom) {
            this.map.setZoom(zoom);
        }
    }

    // Fit bounds to include all markers
    fitBounds() {
        if (this.markers.length === 0) return;

        const bounds = new google.maps.LatLngBounds();
        this.markers.forEach(marker => {
            bounds.extend(marker.getPosition());
        });
        this.map.fitBounds(bounds);
    }

    // Update theme
    updateTheme() {
        if (!this.isInitialized) return;
        this.map.setOptions({ styles: this.getMapStyles() });
    }

    // Map click handler (override if needed)
    onMapClick(e) {
        // Override in your implementation
        console.log('Map clicked at:', e.latLng);
    }

    // Get current center
    getCenter() {
        return this.map ? this.map.getCenter() : null;
    }

    // Get current zoom
    getZoom() {
        return this.map ? this.map.getZoom() : null;
    }
}

// Global map instance
let enhancedMap = null;

