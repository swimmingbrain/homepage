// Vorarlberg Explorer Game
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
    guessLatLng: null
};

// Vorarlberg locations with multiple images per location
const vorarlbergLocations = [
    {
        name: "Bregenz Seebühne",
        lat: 47.5050,
        lng: 9.7472,
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Seebuehne_Bregenz.jpg/1920px-Seebuehne_Bregenz.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Bregenzer_Festspiele_2013_Seebuehne.jpg/1920px-Bregenzer_Festspiele_2013_Seebuehne.jpg"
        ],
        description: "Famous floating stage on Lake Constance"
    },
    {
        name: "Schattenburg Feldkirch",
        lat: 47.2417,
        lng: 9.5989,
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Feldkirch_Schattenburg_01.jpg/1920px-Feldkirch_Schattenburg_01.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Schattenburg_Feldkirch.jpg/1920px-Schattenburg_Feldkirch.jpg"
        ],
        description: "Medieval castle overlooking Feldkirch"
    },
    {
        name: "Lünersee",
        lat: 47.0428,
        lng: 9.7894,
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Luenersee.jpg/1920px-Luenersee.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/L%C3%BCnersee_-_panoramio.jpg/1920px-L%C3%BCnersee_-_panoramio.jpg"
        ],
        description: "Beautiful alpine lake in Brandnertal"
    },
    {
        name: "Piz Buin",
        lat: 46.8442,
        lng: 10.1183,
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Piz_Buin.jpg/1920px-Piz_Buin.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Piz_Buin_from_Ochsentaler_Glacier.jpg/1920px-Piz_Buin_from_Ochsentaler_Glacier.jpg"
        ],
        description: "Highest mountain in Vorarlberg"
    },
    {
        name: "Rappenlochschlucht",
        lat: 47.4008,
        lng: 9.6889,
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Rappenlochschlucht.jpg/1920px-Rappenlochschlucht.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Rappenlochschlucht_Dornbirn.jpg/1920px-Rappenlochschlucht_Dornbirn.jpg"
        ],
        description: "Dramatic gorge near Dornbirn"
    },
    {
        name: "Silvretta Hochalpenstraße",
        lat: 46.9167,
        lng: 10.0833,
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Silvretta_Hochalpenstra%C3%9Fe.jpg/1920px-Silvretta_Hochalpenstra%C3%9Fe.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Bielerhöhe_Stausee.jpg/1920px-Bielerhöhe_Stausee.jpg"
        ],
        description: "High alpine road with stunning views"
    },
    {
        name: "Hohenems Altstadt",
        lat: 47.3581,
        lng: 9.6828,
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Hohenems_Palast.jpg/1920px-Hohenems_Palast.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Hohenems_Marktplatz.jpg/1920px-Hohenems_Marktplatz.jpg"
        ],
        description: "Historic old town with Renaissance palace"
    },
    {
        name: "Formarinsee",
        lat: 47.1622,
        lng: 10.0908,
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Formarinsee.jpg/1920px-Formarinsee.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Formarinsee_01.jpg/1920px-Formarinsee_01.jpg"
        ],
        description: "Source of the river Lech"
    },
    {
        name: "Damüls",
        lat: 47.2833,
        lng: 9.8917,
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Dam%C3%BCls_Panorama.jpg/1920px-Dam%C3%BCls_Panorama.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Damuels_Dorf.jpg/1920px-Damuels_Dorf.jpg"
        ],
        description: "Snowiest village in the world"
    },
    {
        name: "Basilika Rankweil",
        lat: 47.2711,
        lng: 9.6436,
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Basilika_Rankweil.jpg/1920px-Basilika_Rankweil.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Rankweil_Basilika.jpg/1920px-Rankweil_Basilika.jpg"
        ],
        description: "Pilgrimage church on Liebfrauenberg"
    },
    {
        name: "Kanisfluh",
        lat: 47.3519,
        lng: 9.9869,
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Kanisfluh.jpg/1920px-Kanisfluh.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Kanisfluh_von_Mellau.jpg/1920px-Kanisfluh_von_Mellau.jpg"
        ],
        description: "Distinctive mountain in Bregenzerwald"
    },
    {
        name: "Mohnenfluh Oberlech",
        lat: 47.2122,
        lng: 10.1414,
        images: [
            "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Mohnenfluh.jpg/1920px-Mohnenfluh.jpg",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Oberlech_Panorama.jpg/1920px-Oberlech_Panorama.jpg"
        ],
        description: "Mountain peak above Lech am Arlberg"
    }
];

// Initialize the game
function init() {
    // Set up event listeners
    document.getElementById('start-game').addEventListener('click', startGame);
    document.getElementById('make-guess').addEventListener('click', makeGuess);
    document.getElementById('next-round').addEventListener('click', nextRound);
    document.getElementById('play-again').addEventListener('click', resetGame);
    
    // Initialize maps
    initializeMaps();
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
        placeGuessMarker(e.latlng);
    });
}

// Start the game
function startGame() {
    document.getElementById('start-modal').classList.remove('show');
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
    
    // Update UI
    document.getElementById('round-number').textContent = `${game.currentRound}/${game.totalRounds}`;
    document.getElementById('results-modal').classList.remove('show');
    document.getElementById('make-guess').disabled = true;
    
    // Clear previous markers
    if (game.guessMarker) {
        game.guessMap.removeLayer(game.guessMarker);
        game.guessMarker = null;
    }
    
    // Load location image
    loadLocationImage();
}

// Load location image
function loadLocationImage() {
    const panoramaView = document.getElementById('panorama-view');
    const images = game.currentLocation.images;
    let currentImageIndex = 0;
    
    // Create image viewer
    panoramaView.innerHTML = `
        <div class="satellite-view">
            <img id="location-image" src="${images[currentImageIndex]}" alt="Location">
            <div class="image-navigation">
                <button class="nav-arrow" id="prev-image" ${images.length === 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i>
                </button>
                <button class="nav-arrow" id="next-image" ${images.length === 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    `;
    
    // Add navigation listeners
    if (images.length > 1) {
        document.getElementById('prev-image').addEventListener('click', () => {
            currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
            document.getElementById('location-image').src = images[currentImageIndex];
        });
        
        document.getElementById('next-image').addEventListener('click', () => {
            currentImageIndex = (currentImageIndex + 1) % images.length;
            document.getElementById('location-image').src = images[currentImageIndex];
        });
    }
    
    // Add zoom controls
    let zoomLevel = 1;
    const img = document.getElementById('location-image');
    
    document.getElementById('zoom-in').addEventListener('click', () => {
        if (zoomLevel < 2) {
            zoomLevel += 0.2;
            img.style.transform = `scale(${zoomLevel})`;
        }
    });
    
    document.getElementById('zoom-out').addEventListener('click', () => {
        if (zoomLevel > 0.6) {
            zoomLevel -= 0.2;
            img.style.transform = `scale(${zoomLevel})`;
        }
    });
    
    document.getElementById('reset-view').addEventListener('click', () => {
        zoomLevel = 1;
        img.style.transform = 'scale(1)';
    });
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
    if (!game.guessLatLng) return;
    
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
    breakdown.innerHTML = '<h3>Round Scores:</h3>';
    
    // Calculate average distance
    const avgDistance = game.bestGuess ? game.bestGuess : 0;
    
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