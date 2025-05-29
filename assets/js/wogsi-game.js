// WoGsi? Game (Uses static images instead of Mapillary viewer)
let game = {
    currentRound: 0,
    totalRounds: 5,
    totalScore: 0,
    bestGuess: null,
    locations: [],
    currentLocation: null,
    guessMarker: null,
    actualMarker: null,
    guessMap: null,
    resultMap: null,
    guessLatLng: null,
    hasGuessed: false,
    apiKey: null,
    currentImageIndex: 0,
    locationImages: []
};

// Updated Vorarlberg locations with actual Mapillary image IDs from the API test
const vorarlbergLocations = [
    {
        name: "Bregenz Hafen",
        lat: 47.5050,
        lng: 9.7472,
        searchLat: 47.4976,
        searchLng: 9.7008,
        hint: "Austria's famous lake-side city, home to the floating stage festival",
        description: "Harbor area near the famous Bregenz Festival"
    },
    {
        name: "Feldkirch Zentrum",
        lat: 47.2380,
        lng: 9.5970,
        hint: "Medieval town center with historic buildings, near the border with Liechtenstein",
        description: "Historic center of Feldkirch"
    },
    {
        name: "Dornbirn Marktplatz",
        lat: 47.4125,
        lng: 9.7438,
        hint: "Vorarlberg's largest city, known for its textile industry heritage",
        description: "Market square in Dornbirn"
    },
    {
        name: "Bludenz Zentrum",
        lat: 47.1547,
        lng: 9.8222,
        hint: "Alpine town where five valleys meet, gateway to the Arlberg",
        description: "Town center of Bludenz"
    },
    {
        name: "Hohenems Zentrum",
        lat: 47.3658,
        lng: 9.6860,
        hint: "Town known for its Jewish heritage and Renaissance palace",
        description: "Center of Hohenems"
    }
];

// Initialize the game
function init() {
    console.log('Initializing WoGsi?...');
    
    // Set API key directly
    game.apiKey = 'MLY|30634047539527293|81b8b31fda1638a58b5d5124a26fb7ab';
    
    // Set up event listeners
    document.getElementById('start-game')?.addEventListener('click', startGame);
    document.getElementById('make-guess')?.addEventListener('click', makeGuess);
    document.getElementById('next-round')?.addEventListener('click', nextRound);
    document.getElementById('play-again')?.addEventListener('click', resetGame);
    document.getElementById('hint-toggle')?.addEventListener('click', toggleHint);
    
    // Initialize maps
    initializeMaps();
    
    // Check API key
    checkMapillaryConnection();
}

// Check Mapillary connection
async function checkMapillaryConnection() {
    const statusEl = document.getElementById('api-status');
    
    try {
        statusEl.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Validating API key...';
        
        const response = await fetch(
            `https://graph.mapillary.com/images?bbox=9.5,47.0,10.3,47.6&limit=1`,
            {
                headers: {
                    'Authorization': `OAuth ${game.apiKey}`
                }
            }
        );
        
        if (response.ok) {
            statusEl.innerHTML = '<i class="fas fa-check-circle"></i> Ready to play!';
            statusEl.className = 'api-status success';
            document.getElementById('start-game').disabled = false;
        } else {
            throw new Error('Invalid API key');
        }
        
    } catch (error) {
        console.error('API key validation error:', error);
        statusEl.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error connecting to Mapillary';
        statusEl.className = 'api-status error';
    }
}

// Initialize maps
function initializeMaps() {
    game.guessMap = L.map('guess-map').setView([47.2692, 9.8916], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(game.guessMap);
    
    const vorarlbergBounds = [
        [47.6, 9.5],
        [47.6, 10.3],
        [46.8, 10.3],
        [46.8, 9.5]
    ];
    L.polygon(vorarlbergBounds, {
        color: 'var(--color-primary)',
        weight: 2,
        fillOpacity: 0.1
    }).addTo(game.guessMap);
    
    game.guessMap.on('click', function(e) {
        if (!game.hasGuessed) {
            placeGuessMarker(e.latlng);
        }
    });
}

// Start the game
function startGame() {
    const startModal = document.getElementById('start-modal');
    startModal.classList.remove('show');
    startModal.style.display = 'none';
    game.locations = shuffleArray([...vorarlbergLocations]).slice(0, game.totalRounds);
    nextRound();
}

// Load next round
function nextRound() {
    if (game.currentRound >= game.totalRounds) {
        endGame();
        return;
    }
    
    game.currentRound++;
    game.currentLocation = game.locations[game.currentRound - 1];
    game.guessLatLng = null;
    game.hasGuessed = false;
    game.currentImageIndex = 0;
    game.locationImages = [];
    
    document.getElementById('round-number').textContent = `${game.currentRound}/${game.totalRounds}`;
    document.getElementById('results-modal').classList.remove('show');
    document.getElementById('make-guess').disabled = true;
    document.getElementById('hint-overlay').style.display = 'none';
    document.getElementById('hint-toggle').classList.remove('active');
    
    if (game.guessMarker) {
        game.guessMap.removeLayer(game.guessMarker);
        game.guessMarker = null;
    }
    
    if (game.resultMap) {
        game.resultMap.remove();
        game.resultMap = null;
    }
    
    loadLocationImages();
}

// Load images for location
async function loadLocationImages() {
    const viewerEl = document.getElementById('mapillary-viewer');
    viewerEl.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><p>Loading images...</p></div>';
    
    try {
        // Use search coordinates if available, otherwise use location coordinates
        const searchLat = game.currentLocation.searchLat || game.currentLocation.lat;
        const searchLng = game.currentLocation.searchLng || game.currentLocation.lng;
        
        const bbox = [
            searchLng - 0.02,
            searchLat - 0.02,
            searchLng + 0.02,
            searchLat + 0.02
        ].join(',');
        
        console.log('Fetching images with bbox:', bbox);
        
        const response = await fetch(
            `https://graph.mapillary.com/images?bbox=${bbox}&fields=id,thumb_2048_url,computed_geometry,captured_at&limit=10`,
            {
                headers: {
                    'Authorization': `OAuth ${game.apiKey}`,
                    'Accept': 'application/json'
                },
                mode: 'cors'
            }
        );
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Mapillary API error:', response.status, response.statusText, errorText);
            throw new Error(`Failed to fetch images: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Received images:', data.data?.length || 0);
        
        if (data.data && data.data.length > 0) {
            game.locationImages = data.data;
            displayImage(0);
        } else {
            throw new Error('No images found in the area');
        }
        
    } catch (error) {
        console.error('Error loading images:', error);
        viewerEl.innerHTML = `
            <div class="street-view-fallback">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error loading images</h3>
                <p>${error.message}</p>
                <p><strong>Hint:</strong> ${game.currentLocation.hint}</p>
            </div>
        `;
    }
}

// Display image
function displayImage(index) {
    if (!game.locationImages || game.locationImages.length === 0) return;
    
    game.currentImageIndex = index;
    const image = game.locationImages[index];
    
    const viewerEl = document.getElementById('mapillary-viewer');
    viewerEl.innerHTML = `
        <div class="static-image-viewer">
            <img src="${image.thumb_2048_url}" alt="Street view" id="current-image">
            <div class="image-info">
                Image ${index + 1} of ${game.locationImages.length}
            </div>
            <div class="image-navigation">
                <button class="nav-arrow" id="prev-image" ${index === 0 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i>
                </button>
                <button class="nav-arrow" id="next-image" ${index === game.locationImages.length - 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    `;
    
    // Add navigation listeners
    document.getElementById('prev-image')?.addEventListener('click', () => {
        if (game.currentImageIndex > 0) {
            displayImage(game.currentImageIndex - 1);
        }
    });
    
    document.getElementById('next-image')?.addEventListener('click', () => {
        if (game.currentImageIndex < game.locationImages.length - 1) {
            displayImage(game.currentImageIndex + 1);
        }
    });
}

// Toggle hint
function toggleHint() {
    const hintOverlay = document.getElementById('hint-overlay');
    const hintToggle = document.getElementById('hint-toggle');
    
    if (hintOverlay.style.display === 'none') {
        document.getElementById('hint-text').textContent = game.currentLocation.hint;
        hintOverlay.style.display = 'flex';
        hintToggle.classList.add('active');
    } else {
        hintOverlay.style.display = 'none';
        hintToggle.classList.remove('active');
    }
}

// Place guess marker
function placeGuessMarker(latlng) {
    if (game.guessMarker) {
        game.guessMap.removeLayer(game.guessMarker);
    }
    
    game.guessMarker = L.marker(latlng, {
        icon: L.divIcon({
            className: 'guess-marker',
            iconSize: [20, 20]
        })
    }).addTo(game.guessMap);
    
    game.guessLatLng = latlng;
    document.getElementById('make-guess').disabled = false;
}

// Make guess
function makeGuess() {
    if (!game.guessLatLng || game.hasGuessed) return;
    
    game.hasGuessed = true;
    document.getElementById('make-guess').disabled = true;
    
    const distance = calculateDistance(
        game.guessLatLng.lat,
        game.guessLatLng.lng,
        game.currentLocation.lat,
        game.currentLocation.lng
    );
    
    const points = calculatePoints(distance);
    game.totalScore += points;
    
    if (!game.bestGuess || distance < game.bestGuess) {
        game.bestGuess = distance;
        document.getElementById('best-guess').textContent = `${game.bestGuess.toFixed(1)} km`;
    }
    
    document.getElementById('total-score').textContent = game.totalScore.toLocaleString();
    showResults(distance, points);
}

// Show results
function showResults(distance, points) {
    document.getElementById('distance-text').textContent = `${distance.toFixed(1)} km away`;
    document.getElementById('score-text').textContent = `${points.toLocaleString()} points`;
    
    const resultMapDiv = document.getElementById('result-map');
    resultMapDiv.innerHTML = '';
    
    // Calculate bounds before creating the map
    const bounds = L.latLngBounds([
        [game.guessLatLng.lat, game.guessLatLng.lng],
        [game.currentLocation.lat, game.currentLocation.lng]
    ]);
    
    // Create map with initial bounds
    game.resultMap = L.map('result-map', {
        zoomControl: false
    }).fitBounds(bounds, { padding: [50, 50] });
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(game.resultMap);
    
    // Add zoom control after the map is created
    L.control.zoom({
        position: 'bottomright'
    }).addTo(game.resultMap);
    
    const guessMarker = L.marker([game.guessLatLng.lat, game.guessLatLng.lng], {
        icon: L.divIcon({
            className: 'guess-marker',
            iconSize: [20, 20]
        })
    }).addTo(game.resultMap);
    
    const actualMarker = L.marker([game.currentLocation.lat, game.currentLocation.lng], {
        icon: L.divIcon({
            className: 'actual-marker',
            iconSize: [20, 20]
        })
    }).addTo(game.resultMap);
    
    L.polyline([
        [game.guessLatLng.lat, game.guessLatLng.lng],
        [game.currentLocation.lat, game.currentLocation.lng]
    ], {
        color: 'var(--color-primary)',
        weight: 3,
        opacity: 0.7,
        dashArray: '10, 10'
    }).addTo(game.resultMap);
    
    guessMarker.bindPopup('<b>Your Guess</b>').openPopup();
    actualMarker.bindPopup(`<b>${game.currentLocation.name}</b><br>${game.currentLocation.description}`);
    
    // Show the modal
    const resultsModal = document.getElementById('results-modal');
    resultsModal.classList.add('show');
    
    // Update map size after modal is shown
    setTimeout(() => {
        game.resultMap.invalidateSize();
        game.resultMap.fitBounds(bounds, { padding: [50, 50] });
    }, 100);
}

// End game
function endGame() {
    const breakdown = document.getElementById('score-breakdown');
    breakdown.innerHTML = '<h3>Your Performance:</h3>';
    breakdown.innerHTML += `
        <div class="round-score">
            <span>Total Rounds:</span>
            <span>${game.totalRounds}</span>
        </div>
        <div class="round-score">
            <span>Best Guess:</span>
            <span>${game.bestGuess ? game.bestGuess.toFixed(1) + ' km' : 'N/A'}</span>
        </div>
        <div class="round-score">
            <span>Average Score:</span>
            <span>${Math.round(game.totalScore / game.totalRounds)} points</span>
        </div>
    `;
    
    document.getElementById('final-score-text').textContent = game.totalScore.toLocaleString();
    document.getElementById('game-over-modal').classList.add('show');
}

// Reset game
function resetGame() {
    game.currentRound = 0;
    game.totalScore = 0;
    game.bestGuess = null;
    game.locations = [];
    game.currentLocation = null;
    game.guessLatLng = null;
    game.hasGuessed = false;
    game.currentImageIndex = 0;
    game.locationImages = [];
    
    if (game.resultMap) {
        game.resultMap.remove();
        game.resultMap = null;
    }
    
    document.getElementById('total-score').textContent = '0';
    document.getElementById('best-guess').textContent = '-';
    document.getElementById('game-over-modal').classList.remove('show');
    
    startGame();
}

// Calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Calculate points
function calculatePoints(distance) {
    const maxPoints = 5000;
    const points = Math.round(maxPoints * Math.exp(-distance / 50));
    return Math.max(0, points);
}

// Shuffle array
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);