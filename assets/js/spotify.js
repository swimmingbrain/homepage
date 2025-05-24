// Spotify Web Playback SDK with Authorization Code + PKCE Flow
let player;
let token;
let deviceId;

// Your Spotify App credentials
const CLIENT_ID = 'bf45e9aa56e64d4c924c7136bc358631';
const REDIRECT_URI = 'https://swimmingbrain.dev/spotify.html';
const USER_ID = 'kg78o2lmqe4af77s3morbt5eq';
const SCOPES = 'user-read-private user-read-email user-read-playback-state user-modify-playback-state user-read-currently-playing playlist-read-private streaming user-read-recently-played';

// PKCE helper functions
function generateRandomString(length) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

// Initialize Spotify Web Playback SDK
window.onSpotifyWebPlaybackSDKReady = () => {
    console.log('Spotify SDK Ready');
    if (!token) {
        console.log('No token available, showing login...');
        showLogin();
        return;
    }
    
    initializePlayer();
};

function initializePlayer() {
    console.log('Initializing player with token');
    player = new Spotify.Player({
        name: 'SwimmingBrain Player',
        getOAuthToken: cb => { cb(token); },
        volume: 0.5
    });

    // Error handling
    player.addListener('initialization_error', ({ message }) => { 
        console.error('Initialization Error:', message);
        showError('Failed to initialize player. Please try refreshing the page.');
    });
    
    player.addListener('authentication_error', ({ message }) => { 
        console.error('Authentication Error:', message);
        showError('Authentication failed. Please try logging in again.');
        handleAuthError();
    });
    
    player.addListener('account_error', ({ message }) => { 
        console.error('Account Error:', message);
        showPremiumRequired();
    });
    
    player.addListener('playback_error', ({ message }) => { 
        console.error('Playback Error:', message);
        showError('Playback error. Please try again.');
    });

    // Playback status updates
    player.addListener('player_state_changed', state => {
        if (state) {
            updatePlayerUI(state);
        }
    });

    // Ready
    player.addListener('ready', ({ device_id }) => {
        deviceId = device_id;
        console.log('Ready with Device ID', device_id);
        showPlayer();
        loadPlaylists();
    });

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
    });

    // Connect to the player
    player.connect().then(success => {
        if (success) {
            console.log('Successfully connected to Spotify!');
        }
    });
}

function handleAuthError() {
    console.log('Handling auth error');
    localStorage.removeItem('spotify_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('spotify_code_verifier');
    localStorage.removeItem('spotify_auth_state');
    showLogin();
}

function showLogin() {
    const loginContainer = document.getElementById('login-container');
    loginContainer.style.display = 'block';
    loginContainer.innerHTML = `
        <div class="login-content">
            <h2>Welcome to Spotify Player</h2>
            <p>Connect your Spotify account to start playing your favorite music and discover new tracks.</p>
            <button onclick="login()" class="spotify-login-btn">
                <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                    <path fill="currentColor" d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                Connect with Spotify
            </button>
        </div>
    `;
    document.getElementById('player-container').style.display = 'none';
}

// Add CSS styles for the login page
function addLoginStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .login-content {
            text-align: center;
            padding: 3rem;
            max-width: 600px;
            margin: 0 auto;
            background: var(--background-primary);
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border: 1px solid var(--border-color);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }

        .login-content h2 {
            color: var(--text-primary);
            margin-bottom: 1.5rem;
            font-size: 2.5rem;
            font-weight: 700;
            background: linear-gradient(45deg, #1DB954, #1ed760);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .login-content p {
            color: var(--text-secondary);
            margin-bottom: 2.5rem;
            font-size: 1.2rem;
            line-height: 1.6;
            max-width: 80%;
            margin-left: auto;
            margin-right: auto;
        }

        .spotify-login-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.75rem;
            background: linear-gradient(45deg, #1DB954, #1ed760);
            color: white;
            border: none;
            padding: 1rem 2rem;
            border-radius: 50px;
            font-size: 1.1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(29, 185, 84, 0.2);
        }

        .spotify-login-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(29, 185, 84, 0.3);
        }

        .spotify-login-btn:active {
            transform: translateY(0);
        }

        .spotify-login-btn svg {
            width: 28px;
            height: 28px;
        }

        #login-container {
            padding: 2rem;
            min-height: 400px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--background-gradient);
        }

        @media (max-width: 768px) {
            .login-content {
                padding: 2rem;
                margin: 1rem;
            }

            .login-content h2 {
                font-size: 2rem;
            }

            .login-content p {
                font-size: 1.1rem;
                max-width: 100%;
            }

            .spotify-login-btn {
                padding: 0.8rem 1.5rem;
                font-size: 1rem;
            }
        }
    `;
    document.head.appendChild(style);
}

function showPlayer() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('player-container').style.display = 'block';
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.querySelector('.spotify-container').prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Show premium required message
function showPremiumRequired() {
    const playerContainer = document.getElementById('player-container');
    playerContainer.innerHTML = `
        <div class="premium-required">
            <h2>Spotify Premium Required</h2>
            <p>To use the full player features, you need a Spotify Premium account.</p>
            <div class="premium-options">
                <a href="https://www.spotify.com/premium" target="_blank" class="premium-button">
                    Upgrade to Premium
                </a>
                <p class="premium-note">Don't have Premium? You can still browse playlists and open tracks in Spotify!</p>
            </div>
        </div>
    `;
    document.getElementById('login-container').style.display = 'none';
    playerContainer.style.display = 'block';
}

// Authorization Code + PKCE login
async function login() {
    try {
        // Generate PKCE parameters
        const codeVerifier = generateRandomString(128);
        const codeChallenge = await generateCodeChallenge(codeVerifier);
        const state = generateRandomString(16);
        
        // Store verifier and state for later use
        localStorage.setItem('spotify_code_verifier', codeVerifier);
        localStorage.setItem('spotify_auth_state', state);
        
        // Build authorization URL
        const params = new URLSearchParams({
            client_id: CLIENT_ID,
            response_type: 'code',
            redirect_uri: REDIRECT_URI,
            state: state,
            scope: SCOPES,
            code_challenge_method: 'S256',
            code_challenge: codeChallenge,
            show_dialog: 'true'
        });
        
        const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
        console.log('Redirecting to:', authUrl);
        
        // Redirect to Spotify login
        window.location.href = authUrl;
    } catch (error) {
        console.error('Error during login:', error);
        showError('Failed to initiate login. Please try again.');
    }
}

// Exchange authorization code for access token
async function exchangeCodeForToken(code) {
    const codeVerifier = localStorage.getItem('spotify_code_verifier');
    
    if (!codeVerifier) {
        throw new Error('Code verifier not found');
    }
    
    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        code_verifier: codeVerifier
    });
    
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Token exchange failed: ${errorData.error_description || errorData.error}`);
    }
    
    const data = await response.json();
    
    // Store tokens
    token = data.access_token;
    localStorage.setItem('spotify_token', token);
    if (data.refresh_token) {
        localStorage.setItem('spotify_refresh_token', data.refresh_token);
    }
    
    // Clean up PKCE parameters
    localStorage.removeItem('spotify_code_verifier');
    localStorage.removeItem('spotify_auth_state');
    
    return data;
}

// Refresh access token
async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('spotify_refresh_token');
    
    if (!refreshToken) {
        throw new Error('No refresh token available');
    }
    
    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'refresh_token',
        refresh_token: refreshToken
    });
    
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
    });
    
    if (!response.ok) {
        throw new Error('Failed to refresh token');
    }
    
    const data = await response.json();
    
    token = data.access_token;
    localStorage.setItem('spotify_token', token);
    
    if (data.refresh_token) {
        localStorage.setItem('spotify_refresh_token', data.refresh_token);
    }
    
    return data;
}

// Update the player UI with current track info
function updatePlayerUI(state) {
    const track = state.track_window.current_track;
    const isPlaying = !state.paused;
    
    // Update album art
    const albumArt = document.getElementById('albumArt');
    if (albumArt) {
        albumArt.src = track.album.images[0]?.url || '';
    }
    
    // Update track name
    const trackName = document.getElementById('trackName');
    if (trackName) {
        trackName.textContent = track.name;
    }
    
    // Update artist name
    const artistName = document.getElementById('artistName');
    if (artistName) {
        artistName.textContent = track.artists.map(artist => artist.name).join(', ');
    }
    
    // Update play/pause button
    const playPause = document.getElementById('playPause');
    if (playPause) {
        playPause.textContent = isPlaying ? '⏸' : '▶';
    }
    
    // Update progress bar
    const progress = document.getElementById('progress');
    if (progress) {
        const progressPercent = (state.position / state.duration) * 100;
        progress.style.width = `${progressPercent}%`;
    }
    
    // Update current time and duration
    const currentTime = document.getElementById('currentTime');
    const duration = document.getElementById('duration');
    if (currentTime) {
        currentTime.textContent = formatDuration(state.position);
    }
    if (duration) {
        duration.textContent = formatDuration(state.duration);
    }
}

// Load user's public playlists
async function loadPlaylists() {
    try {
        const response = await fetch(`https://api.spotify.com/v1/users/${USER_ID}/playlists?limit=50`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 401) {
            // Token expired, try to refresh
            try {
                await refreshAccessToken();
                return loadPlaylists(); // Retry
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                handleAuthError();
                return;
            }
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        // Filter for public playlists only
        const publicPlaylists = data.items.filter(playlist => playlist.public);
        
        if (publicPlaylists.length === 0) {
            showError('No public playlists found.');
            return;
        }
        displayPlaylists(publicPlaylists);
    } catch (error) {
        console.error('Error loading playlists:', error);
        showError('Failed to load playlists. Please try again later.');
    }
}

// Display playlists in the grid
function displayPlaylists(playlists) {
    const grid = document.getElementById('playlistGrid');
    grid.innerHTML = '';

    playlists.forEach(playlist => {
        const card = document.createElement('div');
        card.className = 'playlist-card';
        card.innerHTML = `
            <img src="${playlist.images[0]?.url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGMkU4Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZmlsbD0iIzZCOUI3RiIgZm9udC1zaXplPSI0MCI+8J+OtTwvdGV4dD4KPC9zdmc+'}" 
                 alt="${playlist.name}" 
                 class="playlist-cover">
            <div class="playlist-info">
                <h3>${playlist.name}</h3>
                <p>${playlist.tracks.total} tracks</p>
            </div>
        `;
        card.onclick = () => loadPlaylistTracks(playlist.id);
        grid.appendChild(card);
    });
}

// Load tracks for a specific playlist
async function loadPlaylistTracks(playlistId) {
    try {
        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 401) {
            try {
                await refreshAccessToken();
                return loadPlaylistTracks(playlistId); // Retry
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                handleAuthError();
                return;
            }
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.items.length === 0) {
            showError('No tracks found in this playlist.');
            return;
        }
        displayTracks(data.items);
    } catch (error) {
        console.error('Error loading tracks:', error);
        showError('Failed to load tracks. Please try again later.');
    }
}

// Display tracks in the track list
function displayTracks(tracks) {
    const container = document.createElement('div');
    container.className = 'track-list';
    container.id = 'track-list-container';
    
    // Add a header to the track list
    const header = document.createElement('div');
    header.className = 'track-list-header';
    header.innerHTML = '<h2>Playlist Tracks</h2>';
    container.appendChild(header);
    
    tracks.forEach(item => {
        if (!item.track || item.track.is_local) return; // Skip local files
        
        const track = item.track;
        const trackElement = document.createElement('div');
        trackElement.className = 'track-item';
        trackElement.innerHTML = `
            <img src="${track.album.images[2]?.url || track.album.images[0]?.url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjVGMkU4Ii8+Cjx0ZXh0IHg9IjIwIiB5PSIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiIGZpbGw9IiM2QjlCN0YiIGZvbnQtc2l6ZT0iMTYiPvCfjpU8L3RleHQ+Cjwvc3ZnPg=='}" 
                 alt="${track.name}">
            <div class="track-item-info">
                <h4>${track.name}</h4>
                <p>${track.artists.map(artist => artist.name).join(', ')}</p>
            </div>
            <span class="track-duration">${formatDuration(track.duration_ms)}</span>
        `;
        trackElement.onclick = () => playTrack(track.uri);
        container.appendChild(trackElement);
    });

    // Remove existing track list if it exists
    const existingList = document.getElementById('track-list-container');
    if (existingList) {
        existingList.remove();
    }

    // Insert the track list at the top of the container
    const spotifyContainer = document.querySelector('.spotify-container');
    spotifyContainer.insertBefore(container, spotifyContainer.firstChild);

    // Add margin after track list
    container.style.marginBottom = '3rem';

    // Scroll to the track list with smooth animation
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Format track duration
function formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Modify playTrack function to handle non-Premium users
async function playTrack(uri) {
    if (!deviceId) {
        // If no device ID (non-Premium user), open in Spotify
        window.open(`https://open.spotify.com/track/${uri.split(':').pop()}`, '_blank');
        return;
    }
    
    try {
        const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uris: [uri]
            })
        });
        
        if (response.status === 401) {
            try {
                await refreshAccessToken();
                return playTrack(uri); // Retry
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                handleAuthError();
                return;
            }
        }
        
        if (response.status === 404) {
            showError('Player not found. Please make sure Spotify is open and try again.');
            return;
        }
        
        if (!response.ok) {
            const errorData = await response.text();
            console.error('Play error:', errorData);
            showError('Failed to play track. Please try again.');
        }
    } catch (error) {
        console.error('Error playing track:', error);
        showError('Failed to play track. Please try again.');
    }
}

// Player controls
function setupPlayerControls() {
    document.getElementById('playPause').onclick = () => {
        if (player) {
            player.togglePlay();
        }
    };

    document.getElementById('prevTrack').onclick = () => {
        if (player) {
            player.previousTrack();
        }
    };

    document.getElementById('nextTrack').onclick = () => {
        if (player) {
            player.nextTrack();
        }
    };
}

// Add styles for the player bar
function addPlayerStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .player-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: var(--background-secondary);
            padding: 1rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
            z-index: 1000;
        }

        .player-bar img {
            width: 60px;
            height: 60px;
            border-radius: 4px;
        }

        .player-info {
            flex: 1;
            min-width: 0;
        }

        .player-info h3 {
            margin: 0;
            font-size: 1rem;
            color: var(--text-primary);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .player-info p {
            margin: 0;
            font-size: 0.9rem;
            color: var(--text-secondary);
        }

        .player-controls {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .player-controls button {
            background: none;
            border: none;
            color: var(--text-primary);
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 50%;
            transition: background-color 0.2s;
        }

        .player-controls button:hover {
            background: var(--background-hover);
        }

        .progress-container {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--background-hover);
        }

        .progress-bar {
            height: 100%;
            background: #1DB954;
            width: 0;
            transition: width 0.1s linear;
        }

        .time-info {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.8rem;
            color: var(--text-secondary);
        }
    `;
    document.head.appendChild(style);
}

// Initialize player bar HTML
function initializePlayerBar() {
    const playerBar = document.createElement('div');
    playerBar.className = 'player-bar';
    playerBar.innerHTML = `
        <div class="progress-container">
            <div id="progress" class="progress-bar"></div>
        </div>
        <img id="albumArt" src="" alt="Album Art">
        <div class="player-info">
            <h3 id="trackName">No track playing</h3>
            <p id="artistName">Select a track to play</p>
        </div>
        <div class="player-controls">
            <button id="prevTrack">⏮</button>
            <button id="playPause">▶</button>
            <button id="nextTrack">⏭</button>
        </div>
        <div class="time-info">
            <span id="currentTime">0:00</span>
            <span>/</span>
            <span id="duration">0:00</span>
        </div>
    `;
    document.body.appendChild(playerBar);
}

// Add styles for premium required message
function addPremiumStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .premium-required {
            text-align: center;
            padding: 2rem;
            max-width: 600px;
            margin: 0 auto;
            background: var(--background-secondary);
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .premium-required h2 {
            color: var(--text-primary);
            margin-bottom: 1rem;
        }

        .premium-required p {
            color: var(--text-secondary);
            margin-bottom: 2rem;
        }

        .premium-options {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
        }

        .premium-button {
            background: #1DB954;
            color: white;
            text-decoration: none;
            padding: 0.8rem 1.5rem;
            border-radius: 50px;
            font-weight: 600;
            transition: all 0.2s ease;
        }

        .premium-button:hover {
            background: #1ed760;
            transform: translateY(-2px);
        }

        .premium-note {
            font-size: 0.9rem;
            color: var(--text-secondary);
            margin-top: 1rem;
        }
    `;
    document.head.appendChild(style);
}

// Add premium styles to the onload function
window.onload = () => {
    console.log('Window loaded, checking authentication...');
    
    // Add login styles
    addLoginStyles();
    
    // Add premium styles
    addPremiumStyles();
    
    // Add player styles and initialize player bar
    addPlayerStyles();
    initializePlayerBar();
    
    // Setup player controls
    setupPlayerControls();
    
    // Check for authorization code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    
    if (error) {
        console.error('Authentication error:', error);
        showError(`Authentication error: ${error}`);
        localStorage.removeItem('spotify_token');
        localStorage.removeItem('spotify_refresh_token');
        localStorage.removeItem('spotify_code_verifier');
        localStorage.removeItem('spotify_auth_state');
        showLogin();
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
    }
    
    if (code && state) {
        console.log('Authorization code found, exchanging for token...');
        
        // Validate state parameter
        const storedState = localStorage.getItem('spotify_auth_state');
        if (state !== storedState) {
            console.error('State mismatch');
            showError('Invalid state parameter. Please try again.');
            localStorage.removeItem('spotify_token');
            localStorage.removeItem('spotify_refresh_token');
            localStorage.removeItem('spotify_code_verifier');
            localStorage.removeItem('spotify_auth_state');
            showLogin();
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
        }
        
        // Exchange code for token
        exchangeCodeForToken(code)
            .then(tokenData => {
                console.log('Token exchange successful');
                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname);
                
                if (window.Spotify) {
                    initializePlayer();
                } else {
                    console.log('Waiting for Spotify SDK...');
                }
            })
            .catch(error => {
                console.error('Token exchange failed:', error);
                showError('Failed to complete authentication. Please try again.');
                showLogin();
                window.history.replaceState({}, document.title, window.location.pathname);
            });
    } else {
        // Check if we have a stored token
        const storedToken = localStorage.getItem('spotify_token');
        if (storedToken) {
            console.log('Using stored token');
            token = storedToken;
            if (window.Spotify) {
                initializePlayer();
            } else {
                console.log('Waiting for Spotify SDK...');
            }
        } else {
            console.log('No token found, showing login');
            showLogin();
        }
    }
};