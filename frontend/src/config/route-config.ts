// OpenRouteService Configuration
export const OPENROUTE_CONFIG = {
    API_KEY: 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjcwMmNmNDI1MGQ3YzQ2OGY4MzFmM2E4YzY5ZjAzOTk5IiwiaCI6Im11cm11cjY0In0=',
    BASE_URL: 'https://api.openrouteservice.org/v2',
    ENDPOINTS: {
        DIRECTIONS: '/directions/driving-car',
        GEOCODE: '/geocode/search',
        MATRIX: '/matrix/driving-car'
    }
};

// Map Configuration - Using OpenRouteService tiles
export const MAP_CONFIG = {
    DEFAULT_CENTER: { lat: 20.5937, lng: 78.9629 }, // India
    DEFAULT_ZOOM: 5,
    // OpenRouteService map tiles (requires API key in URL)
    TILE_LAYER: `https://maps.openrouteservice.org/osm-bright/{z}/{x}/{y}.png?api_key=${OPENROUTE_CONFIG.API_KEY}`,
    ATTRIBUTION: '© OpenRouteService | © OpenStreetMap contributors'
};
