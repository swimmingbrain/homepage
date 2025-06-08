// WoGsi? Game with Google Street View
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
    playerName: null,
    googleApiKey: 'AIzaSyDyiDpg_8VvRn7QgjY48tKL470fAPvYees'
};

// Leaderboard configuration using JSONBin.io
const LEADERBOARD_CONFIG = {
    API_KEY: '$2a$10$I3aSVpUO8hTyGsHVeUgpTuH5r8NKvXcn0Ew/6k/VUs6KazVXd.r.a',
    BIN_ID: '6844e14d8960c979a5a678c8',
    API_URL: 'https://api.jsonbin.io/v3/b/'
};

// Random locations across Vorarlberg
const vorarlbergLocations = [
    // Bregenz area - Well covered streets
    { name: "Bregenz Kaiserstraße", lat: 47.5033, lng: 9.7469 },
    { name: "Bregenz Kornmarktplatz", lat: 47.5031, lng: 9.7477 },
    { name: "Bregenz Seestraße", lat: 47.5045, lng: 9.7425 },
    { name: "Bregenz Rathausstraße", lat: 47.5030, lng: 9.7485 },
    { name: "Bregenz Bahnhofstraße", lat: 47.5010, lng: 9.7380 },
    
    // Dornbirn area - Main streets
    { name: "Dornbirn Marktplatz", lat: 47.4125, lng: 9.7338 },
    { name: "Dornbirn Bahnhofstraße", lat: 47.4112, lng: 9.7342 },
    { name: "Dornbirn Schulgasse", lat: 47.4130, lng: 9.7355 },
    { name: "Dornbirn Riedgasse", lat: 47.4140, lng: 9.7325 },
    { name: "Dornbirn Lustenauerstraße", lat: 47.4095, lng: 9.7315 },
    
    // Feldkirch area - Historic center
    { name: "Feldkirch Marktgasse", lat: 47.2383, lng: 9.5989 },
    { name: "Feldkirch Neustadt", lat: 47.2375, lng: 9.5985 },
    { name: "Feldkirch Vorstadt", lat: 47.2385, lng: 9.5965 },
    { name: "Feldkirch Kreuzgasse", lat: 47.2378, lng: 9.5992 },
    { name: "Feldkirch Bahnhofstraße", lat: 47.2410, lng: 9.6050 },
    
    // Bludenz area
    { name: "Bludenz Werdenbergerstraße", lat: 47.1548, lng: 9.8215 },
    { name: "Bludenz Herrengasse", lat: 47.1550, lng: 9.8220 },
    { name: "Bludenz Mühlgasse", lat: 47.1555, lng: 9.8210 },
    { name: "Bludenz Bahnhof", lat: 47.1535, lng: 9.8190 },
    
    // Schruns - Tourist area
    { name: "Schruns Kirchplatz", lat: 47.0798, lng: 9.9195 },
    { name: "Schruns Bahnhofstraße", lat: 47.0785, lng: 9.9210 },
    { name: "Schruns Silbertalerstraße", lat: 47.0810, lng: 9.9170 },
    
    // Lustenau - Urban area
    { name: "Lustenau Kaiser-Franz-Josef-Straße", lat: 47.4308, lng: 9.6595 },
    { name: "Lustenau Hofsteigstraße", lat: 47.4285, lng: 9.6620 },
    { name: "Lustenau Bahnhofstraße", lat: 47.4265, lng: 9.6540 },
    
    // Hohenems
    { name: "Hohenems Marktstraße", lat: 47.3658, lng: 9.6862 },
    { name: "Hohenems Bahnhofstraße", lat: 47.3670, lng: 9.6840 },
    { name: "Hohenems Schwefel", lat: 47.3590, lng: 9.6890 },
    
    // Götzis
    { name: "Götzis Hauptstraße", lat: 47.3330, lng: 9.6345 },
    { name: "Götzis Bahnhofstraße", lat: 47.3340, lng: 9.6320 },
    
    // Rankweil
    { name: "Rankweil Ringstraße", lat: 47.2698, lng: 9.6485 },
    { name: "Rankweil Bahnhofstraße", lat: 47.2720, lng: 9.6420 },
    
    // Hard am Bodensee
    { name: "Hard Landstraße", lat: 47.4872, lng: 9.6888 },
    { name: "Hard Hofsteigstraße", lat: 47.4880, lng: 9.6920 },
    
    // Bezau - Bregenzerwald
    { name: "Bezau Platz", lat: 47.3845, lng: 9.9012 },
    { name: "Bezau Bahnhof", lat: 47.3820, lng: 9.9030 },
    
    // Egg - Bregenzerwald
    { name: "Egg Gerbe", lat: 47.4315, lng: 9.8955 },
    { name: "Egg Pfister", lat: 47.4340, lng: 9.8935 },
    
    // Schwarzenberg
    { name: "Schwarzenberg Hof", lat: 47.4133, lng: 9.8493 },
    
    // Lech am Arlberg
    { name: "Lech Dorfstraße", lat: 47.2085, lng: 10.1420 },
    { name: "Lech Tannberg", lat: 47.2095, lng: 10.1410 },
    
    // Brand
    { name: "Brand Mühledörfle", lat: 47.1025, lng: 9.7385 },
    
    // Mittelberg (Kleinwalsertal)
    { name: "Mittelberg Walserstraße", lat: 47.3280, lng: 10.1490 },
    
    // Gaschurn
    { name: "Gaschurn Dorfstraße", lat: 46.9837, lng: 10.0338 },
    
    // Nenzing
    { name: "Nenzing Landstraße", lat: 47.1835, lng: 9.6985 },
    
    // Thüringen
    { name: "Thüringen Hauptstraße", lat: 47.1998, lng: 9.7655 },
    
    // Additional main road locations
    { name: "Wolfurt Bahnhof", lat: 47.4630, lng: 9.7470 },
    { name: "Lauterach Bundesstraße", lat: 47.4760, lng: 9.7290 },
    { name: "Altach Bahnhofstraße", lat: 47.3550, lng: 9.6505 },
    { name: "Frastanz Bahnhof", lat: 47.2180, lng: 9.6320 },
    { name: "Satteins Kirchplatz", lat: 47.2190, lng: 9.6580 },

    // Blum
    { name: "Blum Werk 1, Höchst (Im Städtle 40)", lat: 47.3800, lng: 9.7630 },
    { name: "Blum Werk 2, Höchst (Industriestraße 1)", lat: 47.3795, lng: 9.7640 },
    { name: "Blum Werk 3, Höchst (Landstraße 14)", lat: 47.3797, lng: 9.7645 },
    { name: "Blum Werk 4, Bregenz (Brachsenweg 35)", lat: 47.4985, lng: 9.7120 },
    { name: "Blum Werk 5, Fußach (Birkenfeld 1)", lat: 47.5015, lng: 9.7150 },
    { name: "Blum Werk 6, Gaißau (Hauptstraße 73)", lat: 47.4990, lng: 9.6920 },
    { name: "Blum Werk 7, Dornbirn (Stöckenstraße 5)", lat: 47.4170, lng: 9.7440 },
    { name: "Blum Werk 8, Dornbirn (Joh.-Baptist-Salzmann-Str. 1)", lat: 47.4155, lng: 9.7435 },
    { name: "Julius Blum S009 – Oberer Achdamm 52, Hard", lat: 47.48616, lng: 9.71544 },
    { name: "Julius Blum S011 – Wolfordstraße 1, Bregenz", lat: 47.5033, lng: 9.7469 }
];

// Initialize the game
function init() {
    console.log('Initializing WoGsi?...');
    
    // Set up event listeners
    document.getElementById('start-game')?.addEventListener('click', startGame);
    document.getElementById('make-guess')?.addEventListener('click', makeGuess);
    document.getElementById('next-round')?.addEventListener('click', nextRound);
    document.getElementById('play-again')?.addEventListener('click', resetGame);
    document.getElementById('submit-score')?.addEventListener('click', submitScore);
    document.getElementById('fullscreen')?.addEventListener('click', toggleFullscreen);
    document.getElementById('reset-view')?.addEventListener('click', resetStreetView);
    
    // Enter key submits score
    document.getElementById('player-name')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitScore();
        }
    });
    
    // Initialize maps
    initializeMaps();
    
    // Load leaderboard
    loadLeaderboard();
}

// Initialize maps
function initializeMaps() {
    game.guessMap = L.map('guess-map').setView([47.2692, 9.8916], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(game.guessMap);
    
    // Add Vorarlberg boundary
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
    
    document.getElementById('round-number').textContent = `${game.currentRound}/${game.totalRounds}`;
    document.getElementById('results-modal').classList.remove('show');
    document.getElementById('make-guess').disabled = true;
    
    if (game.guessMarker) {
        game.guessMap.removeLayer(game.guessMarker);
        game.guessMarker = null;
    }
    
    if (game.resultMap) {
        game.resultMap.remove();
        game.resultMap = null;
    }
    
    loadStreetView();
}

// Load Google Street View
function loadStreetView() {
    const container = document.getElementById('street-view-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    
    // Show loading spinner
    loadingSpinner.style.display = 'flex';
    
    // Clear previous content
    container.innerHTML = '';
    container.appendChild(loadingSpinner);
    
    // Create iframe for Google Street View
    const iframe = document.createElement('iframe');
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.frameBorder = '0';
    iframe.style.border = 0;
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.allowFullscreen = true;
    
    // Configure Street View embed URL
    const lat = game.currentLocation.lat;
    const lng = game.currentLocation.lng;
    const heading = Math.floor(Math.random() * 360); // Random initial heading
    const fov = 90;
    const pitch = 0;
    
    iframe.src = `https://www.google.com/maps/embed/v1/streetview?key=${game.googleApiKey}&location=${lat},${lng}&heading=${heading}&fov=${fov}&pitch=${pitch}`;
    
    // Set up timeout for black screen detection
    let loadTimeout = setTimeout(() => {
        console.log('Street View timeout - trying nearby location');
        // Try a nearby location with slight offset
        tryNearbyLocation(lat, lng, 0.001);
    }, 4000); // 4 second timeout
    
    // Hide loading spinner when iframe loads
    iframe.onload = function() {
        clearTimeout(loadTimeout);
        loadingSpinner.style.display = 'none';
    };
    
    container.appendChild(iframe);
}

// Try nearby location if original fails
function tryNearbyLocation(originalLat, originalLng, offset) {
    const container = document.getElementById('street-view-container');
    const loadingSpinner = document.getElementById('loading-spinner');
    
    // Try different offsets in a circle around the original point
    const attempts = [
        { lat: originalLat + offset, lng: originalLng },
        { lat: originalLat - offset, lng: originalLng },
        { lat: originalLat, lng: originalLng + offset },
        { lat: originalLat, lng: originalLng - offset },
        { lat: originalLat + offset, lng: originalLng + offset },
        { lat: originalLat - offset, lng: originalLng - offset }
    ];
    
    // Try a random nearby point
    const attempt = attempts[Math.floor(Math.random() * attempts.length)];
    
    const iframe = document.createElement('iframe');
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.frameBorder = '0';
    iframe.style.border = 0;
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.allowFullscreen = true;
    
    const heading = Math.floor(Math.random() * 360);
    iframe.src = `https://www.google.com/maps/embed/v1/streetview?key=${game.googleApiKey}&location=${attempt.lat},${attempt.lng}&heading=${heading}&fov=90&pitch=0`;
    
    container.innerHTML = '';
    container.appendChild(loadingSpinner);
    container.appendChild(iframe);
    
    iframe.onload = function() {
        loadingSpinner.style.display = 'none';
    };
}

// Toggle fullscreen
function toggleFullscreen() {
    const panoramaContainer = document.getElementById('panorama-container');
    const icon = document.querySelector('#fullscreen i');
    
    if (!document.fullscreenElement) {
        panoramaContainer.requestFullscreen().then(() => {
            panoramaContainer.classList.add('fullscreen');
            icon.classList.remove('fa-expand');
            icon.classList.add('fa-compress');
        });
    } else {
        document.exitFullscreen().then(() => {
            panoramaContainer.classList.remove('fullscreen');
            icon.classList.remove('fa-compress');
            icon.classList.add('fa-expand');
        });
    }
}

// Reset street view
function resetStreetView() {
    loadStreetView();
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
    document.getElementById('distance-text').textContent = `${distance.toFixed(1)} km entfernt`;
    document.getElementById('score-text').textContent = `${points.toLocaleString()} Punkte`;
    
    const resultMapDiv = document.getElementById('result-map');
    resultMapDiv.innerHTML = '';
    
    // Show the modal first
    const resultsModal = document.getElementById('results-modal');
    resultsModal.classList.add('show');
    
    // Calculate bounds
    const bounds = L.latLngBounds([
        [game.guessLatLng.lat, game.guessLatLng.lng],
        [game.currentLocation.lat, game.currentLocation.lng]
    ]);
    
    // Wait for modal animation
    setTimeout(() => {
        // Create map
        game.resultMap = L.map('result-map', {
            zoomControl: false,
            minZoom: 8,
            maxZoom: 18
        });
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(game.resultMap);
        
        // Add zoom control
        L.control.zoom({
            position: 'bottomright'
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
        game.resultMap.invalidateSize(true);
        game.resultMap.fitBounds(bounds, { 
            padding: [50, 50],
            maxZoom: 12
        });
        
        // Add popups
        guessMarker.bindPopup('<b>Deine Schätzung</b>').openPopup();
        actualMarker.bindPopup(`<b>${game.currentLocation.name}</b>`);
        
        // Additional resize check
        setTimeout(() => {
            game.resultMap.invalidateSize(true);
            game.resultMap.fitBounds(bounds, { 
                padding: [50, 50],
                maxZoom: 12
            });
        }, 300);
    }, 100);
}

// End game
function endGame() {
    const breakdown = document.getElementById('score-breakdown');
    breakdown.innerHTML = '<h3>Deine Leistung:</h3>';
    breakdown.innerHTML += `
        <div class="round-score">
            <span>Gespielte Runden:</span>
            <span>${game.totalRounds}</span>
        </div>
        <div class="round-score">
            <span>Beste Schätzung:</span>
            <span>${game.bestGuess ? game.bestGuess.toFixed(1) + ' km' : 'N/A'}</span>
        </div>
        <div class="round-score">
            <span>Durchschnitt:</span>
            <span>${Math.round(game.totalScore / game.totalRounds)} Punkte</span>
        </div>
    `;
    
    document.getElementById('final-score-text').textContent = game.totalScore.toLocaleString();
    
    // Show name input section
    document.getElementById('player-name-section').style.display = 'block';
    document.getElementById('player-name').value = '';
    document.getElementById('submit-score').disabled = false;
    document.getElementById('submit-score').innerHTML = '<i class="fas fa-paper-plane"></i> Eintragen';
    
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
    
    if (game.resultMap) {
        game.resultMap.remove();
        game.resultMap = null;
    }
    
    document.getElementById('total-score').textContent = '0';
    document.getElementById('best-guess').textContent = '-';
    document.getElementById('game-over-modal').classList.remove('show');
    
    startGame();
}

// Calculate distance between two points
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
    const maxPoints = 5000;
    // Exponential decay: full points at 0km, ~3000 at 5km, ~1000 at 15km, ~100 at 50km
    const points = Math.round(maxPoints * Math.exp(-distance / 10));
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

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Load and display leaderboard
async function loadLeaderboard() {
    const container = document.getElementById('leaderboard-container');
    
    try {
        const response = await fetch(`${LEADERBOARD_CONFIG.API_URL}${LEADERBOARD_CONFIG.BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': LEADERBOARD_CONFIG.API_KEY
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load leaderboard');
        }
        
        const data = await response.json();
        const scores = data.record || [];
        
        // Sort by score descending
        scores.sort((a, b) => b.score - a.score);
        
        // Display top 10
        const top10 = scores.slice(0, 10);
        
        if (top10.length === 0) {
            container.innerHTML = '<p class="no-scores">Noch keine Einträge. Sei der Erste!</p>';
            return;
        }
        
        let html = '<div class="leaderboard-list">';
        top10.forEach((entry, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
            html += `
                <div class="leaderboard-entry ${index < 3 ? 'top-three' : ''}">
                    <span class="rank">${medal || (index + 1) + '.'}</span>
                    <span class="name">${escapeHtml(entry.name)}</span>
                    <span class="score">${entry.score.toLocaleString()} Punkte</span>
                    <span class="date">${new Date(entry.date).toLocaleDateString('de-AT')}</span>
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        container.innerHTML = '<p class="error-message">Leaderboard konnte nicht geladen werden</p>';
    }
}

// Submit score to leaderboard
async function submitScore() {
    const nameInput = document.getElementById('player-name');
    const playerName = nameInput.value.trim();
    
    if (!playerName) {
        nameInput.classList.add('error');
        nameInput.placeholder = 'Bitte Namen eingeben!';
        setTimeout(() => {
            nameInput.classList.remove('error');
            nameInput.placeholder = 'Dein Name';
        }, 2000);
        return;
    }
    
    if (playerName.length > 20) {
        alert('Name darf maximal 20 Zeichen lang sein!');
        return;
    }
    
    const submitBtn = document.getElementById('submit-score');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Speichern...';
    submitBtn.disabled = true;
    
    try {
        // First, get current leaderboard
        const getResponse = await fetch(`${LEADERBOARD_CONFIG.API_URL}${LEADERBOARD_CONFIG.BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': LEADERBOARD_CONFIG.API_KEY
            }
        });
        
        if (!getResponse.ok) {
            throw new Error('Failed to fetch leaderboard');
        }
        
        const data = await getResponse.json();
        let scores = data.record || [];
        
        // Check if player already exists
        const existingIndex = scores.findIndex(entry => 
            entry.name.toLowerCase() === playerName.toLowerCase()
        );
        
        const newEntry = {
            name: playerName,
            score: game.totalScore,
            date: new Date().toISOString(),
            bestGuess: game.bestGuess
        };
        
        // Only update if new score is better or player doesn't exist
        if (existingIndex !== -1) {
            if (scores[existingIndex].score < game.totalScore) {
                scores[existingIndex] = newEntry;
            } else {
                // Score not better
                submitBtn.innerHTML = '<i class="fas fa-times"></i> Score nicht besser';
                submitBtn.classList.add('not-better');
                setTimeout(() => {
                    submitBtn.innerHTML = originalContent;
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('not-better');
                }, 2000);
                return;
            }
        } else {
            scores.push(newEntry);
        }
        
        // Update leaderboard
        const updateResponse = await fetch(`${LEADERBOARD_CONFIG.API_URL}${LEADERBOARD_CONFIG.BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': LEADERBOARD_CONFIG.API_KEY
            },
            body: JSON.stringify(scores)
        });
        
        if (!updateResponse.ok) {
            throw new Error('Failed to update leaderboard');
        }
        
        // Success
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Gespeichert!';
        submitBtn.classList.add('success');
        
        // Hide input section
        setTimeout(() => {
            document.getElementById('player-name-section').style.display = 'none';
        }, 1000);
        
        // Reload leaderboard
        loadLeaderboard();
        
    } catch (error) {
        console.error('Error submitting score:', error);
        submitBtn.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Fehler!';
        submitBtn.classList.add('error');
        setTimeout(() => {
            submitBtn.innerHTML = originalContent;
            submitBtn.disabled = false;
            submitBtn.classList.remove('error');
        }, 2000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);