// WoGsi? Game
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
    viewer: null,
    apiKey: null
};

// Vorarlberg locations with Mapillary image keys
// These are example coordinates - you'll need to find actual Mapillary image keys
const vorarlbergLocations = [
    {
        name: "Bregenz Hafen",
        lat: 47.5050,
        lng: 9.7472,
        imageKey: "bregenz_harbor", // Placeholder - replace with actual Mapillary image key
        hint: "Austria's famous lake-side city, home to the floating stage festival",
        description: "Harbor area near the famous Bregenz Festival"
    },
    {
        name: "Feldkirch Marktplatz",
        lat: 47.2380,
        lng: 9.5970,
        imageKey: "feldkirch_market", // Placeholder
        hint: "Medieval town center with historic buildings, near the border with Liechtenstein",
        description: "Historic market square in Feldkirch"
    },
    {
        name: "Dornbirn Zentrum",
        lat: 47.4125,
        lng: 9.7438,
        imageKey: "dornbirn_center", // Placeholder
        hint: "Vorarlberg's largest city, known for its textile industry heritage",
        description: "City center of Dornbirn"
    },
    {
        name: "Hohenems Bahnhof",
        lat: 47.3658,
        lng: 9.6860,
        imageKey: "hohenems_station", // Placeholder
        hint: "Town known for its Jewish heritage and Renaissance palace",
        description: "Train station area in Hohenems"
    },
    {
        name: "Lustenau Zentrum",
        lat: 47.4270,
        lng: 9.6595,
        imageKey: "lustenau_center", // Placeholder
        hint: "Border town famous for embroidery, close to Switzerland",
        description: "Town center of Lustenau"
    },
    {
        name: "Rankweil Bahnhof",
        lat: 47.2734,
        lng: 9.6397,
        imageKey: "rankweil_station", // Placeholder
        hint: "Town with a famous basilica on the hill, important railway junction",
        description: "Railway station in Rankweil"
    },
    {
        name: "Bludenz Altstadt",
        lat: 47.1547,
        lng: 9.8222,
        imageKey: "bludenz_oldtown", // Placeholder
        hint: "Alpine town where five valleys meet, gateway to the Arlberg",
        description: "Old town of Bludenz"
    },
    {
        name: "Götzis Zentrum",
        lat: 47.3317,
        lng: 9.6350,
        imageKey: "goetzis_center", // Placeholder
        hint: "Town famous for hosting the Hypo-Meeting athletics event",
        description: "Town center of Götzis"
    },
    {
        name: "Hard Hafen",
        lat: 47.4897,
        lng: 9.6897,
        imageKey: "hard_harbor", // Placeholder
        hint: "Lake Constance town between Bregenz and the Rhine delta",
        description: "Harbor area in Hard"
    },
    {
        name: "Nenzing Dorfzentrum",
        lat: 47.1839,
        lng: 9.7006,
        imageKey: "nenzing_village", // Placeholder
        hint: "Village in the Walgau valley, gateway to the Gamperdonatal",
        description: "Village center of Nenzing"
    },
    {
        name: "Schruns Zentrum",
        lat: 47.0769,
        lng: 9.9194,
        imageKey: "schruns_center", // Placeholder
        hint: "Montafon valley town where Ernest Hemingway spent winters",
        description: "Town center of Schruns"
    },
    {
        name: "Lech am Arlberg",
        lat: 47.2085,
        lng: 10.1416,
        imageKey: "lech_village", // Placeholder
        hint: "Exclusive ski resort village, one of the snowiest in the Alps",
        description: "Village center of Lech"
    }
];

// Initialize the game
function init() {
    // Check for saved API key
    game.apiKey = localStorage.getItem('mapillary_api_key');
    
    // Set up event listeners
    document.getElementById('save-api-key').addEventListener('click', saveApiKey);
    document.getElementById('start-game').addEventListener('click', startGame);
    document.getElementById('make-guess').addEventListener('click', makeGuess);
    document.getElementById('next-round').addEventListener('click', nextRound);
    document.getElementById('play-again').addEventListener('click', resetGame);
    document.getElementById('hint-toggle').addEventListener('click', toggleHint);
    
    // Initialize maps
    initializeMaps();
    
    // Check API key and Mapillary connection
    checkMapillaryConnection();
}

// Check Mapillary connection
function checkMapillaryConnection() {
    const statusEl = document.getElementById('api-status');
    
    if (!game.apiKey) {
        statusEl.innerHTML = '<i class="fas fa-exclamation-circle"></i> API key required';
        statusEl.className = 'api-status error';
        document.getElementById('start-modal').style.display = 'none';
        document.getElementById('api-key-modal').style.display = 'flex';
        return;
    }
    
    // Test API key by trying to initialize viewer
    try {
        // Initialize a test viewer
        const testContainer = document.createElement('div');
        testContainer.style.display = 'none';
        document.body.appendChild(testContainer);
        
        const testViewer = new Mapillary.Viewer({
            accessToken: game.apiKey,
            container: testContainer,
        });
        
        // If we get here, API key is valid
        statusEl.innerHTML = '<i class="fas fa-check-circle"></i> Ready to play!';
        statusEl.className = 'api-status success';
        document.getElementById('start-game').disabled = false;
        
        // Clean up test viewer
        testViewer.remove();
        document.body.removeChild(testContainer);
        
    } catch (error) {
        statusEl.innerHTML = '<i class="fas fa-exclamation-circle"></i> Invalid API key';
        statusEl.className = 'api-status error';
        document.getElementById('start-modal').style.display = 'none';
        document.getElementById('api-key-modal').style.display = 'flex';
    }
}

// Save API key
function saveApiKey() {
    const apiKey = document.getElementById('api-key-input').value.trim();
    
    if (!apiKey) {
        alert('Please enter your Mapillary API key');
        return;
    }
    
    localStorage.setItem('mapillary_api_key', apiKey);
    game.apiKey = apiKey;
    
    document.getElementById('api-key-modal').style.display = 'none';
    document.getElementById('start-modal').style.display = 'flex';
    
    checkMapillaryConnection();
}

// Initialize Leaflet maps
function initializeMaps() {
    // Guess map
    game.guessMap = L.map('guess-map').setView([47.2692, 9.8916], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(game.guessMap);
    
    // Add Vorarlberg boundary (simplified)
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
    
    // Click event for placing guess
    game.guessMap.on('click', function(e) {
        if (!game.hasGuessed) {
            placeGuessMarker(e.latlng);
        }
    });
}

// Start the game
function startGame() {
    document.getElementById('start-modal').classList.remove('show');
    game.locations = shuffleArray([...vorarlbergLocations]).slice(0, game.totalRounds);
    
    // Initialize Mapillary viewer
    initializeMapillaryViewer();
    
    nextRound();
}

// Initialize Mapillary viewer
function initializeMapillaryViewer() {
    // Remove loading spinner
    document.getElementById('loading-spinner').style.display = 'none';
    
    // Create viewer
    game.viewer = new Mapillary.Viewer({
        accessToken: game.apiKey,
        container: 'mapillary-viewer',
        component: {
            cover: false,
            direction: false,
            sequence: false,
            tag: false,
            zoom: false
        }
    });
    
    // Add zoom controls
    document.getElementById('zoom-in').addEventListener('click', () => {
        game.viewer.setZoom(game.viewer.getZoom() + 0.5);
    });
    
    document.getElementById('zoom-out').addEventListener('click', () => {
        game.viewer.setZoom(game.viewer.getZoom() - 0.5);
    });
    
    document.getElementById('reset-view').addEventListener('click', () => {
        game.viewer.setZoom(0);
        game.viewer.setBearing(0);
    });
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
    
    // Update UI
    document.getElementById('round-number').textContent = `${game.currentRound}/${game.totalRounds}`;
    document.getElementById('results-modal').classList.remove('show');
    document.getElementById('make-guess').disabled = true;
    document.getElementById('hint-overlay').style.display = 'none';
    document.getElementById('hint-toggle').classList.remove('active');
    
    // Clear previous markers
    if (game.guessMarker) {
        game.guessMap.removeLayer(game.guessMarker);
        game.guessMarker = null;
    }
    
    // Destroy previous result map if exists
    if (game.resultMap) {
        game.resultMap.remove();
        game.resultMap = null;
    }
    
    // Load location in Mapillary
    loadMapillaryLocation();
}

// Load Mapillary location
async function loadMapillaryLocation() {
    try {
        // Show loading spinner
        document.getElementById('loading-spinner').style.display = 'block';
        
        // For now, we'll move to the coordinates
        // In production, you'd search for the nearest image
        const position = {
            lat: game.currentLocation.lat,
            lng: game.currentLocation.lng
        };
        
        // Move viewer to location
        await game.viewer.moveTo(position)
            .catch(async () => {
                // If no image at exact location, find nearest
                const searchResponse = await fetch(
                    `https://graph.mapillary.com/images?access_token=${game.apiKey}&fields=id,geometry&bbox=${position.lng-0.01},${position.lat-0.01},${position.lng+0.01},${position.lat+0.01}&limit=1`
                );
                
                if (searchResponse.ok) {
                    const data = await searchResponse.json();
                    if (data.data && data.data.length > 0) {
                        return game.viewer.moveTo(data.data[0].id);
                    }
                }
                
                // Fallback: show a placeholder message
                throw new Error('No street view available');
            });
        
        // Hide loading spinner
        document.getElementById('loading-spinner').style.display = 'none';
        
    } catch (error) {
        console.error('Error loading Mapillary location:', error);
        // Show error message
        document.getElementById('mapillary-viewer').innerHTML = `
            <div class="street-view-fallback">
                <i class="fas fa-street-view"></i>
                <h3>No street view available</h3>
                <p>This location doesn't have street-level imagery yet.</p>
                <p><strong>Location hint:</strong> ${game.currentLocation.hint}</p>
            </div>
        `;
    }
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

// Place guess marker on map
function placeGuessMarker(latlng) {
    // Remove previous marker
    if (game.guessMarker) {
        game.guessMap.removeLayer(game.guessMarker);
    }
    
    // Add new marker
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
    
    // Mark as guessed and disable button
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
    
    // Update score
    document.getElementById('total-score').textContent = game.totalScore.toLocaleString();
    
    // Show results
    showResults(distance, points);
}

// Show round results
function showResults(distance, points) {
    // Update result text
    document.getElementById('distance-text').textContent = `${distance.toFixed(1)} km away`;
    document.getElementById('score-text').textContent = `${points.toLocaleString()} points`;
    
    // Create result map
    const resultMapDiv = document.getElementById('result-map');
    resultMapDiv.innerHTML = '';
    
    // Create new map instance
    game.resultMap = L.map('result-map').setView([47.2692, 9.8916], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(game.resultMap);
    
    // Add markers
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
    
    // Add line between markers
    L.polyline([
        [game.guessLatLng.lat, game.guessLatLng.lng],
        [game.currentLocation.lat, game.currentLocation.lng]
    ], {
        color: 'var(--color-primary)',
        weight: 3,
        opacity: 0.7,
        dashArray: '10, 10'
    }).addTo(game.resultMap);
    
    // Fit bounds
    const bounds = L.latLngBounds([
        [game.guessLatLng.lat, game.guessLatLng.lng],
        [game.currentLocation.lat, game.currentLocation.lng]
    ]);
    game.resultMap.fitBounds(bounds, { padding: [50, 50] });
    
    // Add popups
    guessMarker.bindPopup('<b>Your Guess</b>').openPopup();
    actualMarker.bindPopup(`<b>${game.currentLocation.name}</b><br>${game.currentLocation.description}`);
    
    // Show modal
    document.getElementById('results-modal').classList.add('show');
}

// End game
function endGame() {
    // Create score breakdown
    const breakdown = document.getElementById('score-breakdown');
    breakdown.innerHTML = '<h3>Your Performance:</h3>';
    
    // Add performance stats
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
    
    // Show final score
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
    
    // Clean up result map if exists
    if (game.resultMap) {
        game.resultMap.remove();
        game.resultMap = null;
    }
    
    document.getElementById('total-score').textContent = '0';
    document.getElementById('best-guess').textContent = '-';
    document.getElementById('game-over-modal').classList.remove('show');
    
    startGame();
}

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Calculate points based on distance
function calculatePoints(distance) {
    // Maximum 5000 points, decreasing exponentially with distance
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