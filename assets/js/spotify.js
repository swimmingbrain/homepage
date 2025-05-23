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
        showError('Account error. Please check your Spotify Premium subscription.');
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
    document.getElementById('login-container').style.display = 'block';
    document.getElementById('player-container').style.display = 'none';
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
    
    document.getElementById('albumArt').src = track.album.images[0]?.url || '';
    document.getElementById('trackName').textContent = track.name;
    document.getElementById('artistName').textContent = track.artists.map(artist => artist.name).join(', ');
    
    // Update play/pause button
    document.getElementById('playPause').textContent = isPlaying ? '⏸' : '▶';
    
    // Update progress bar
    const progress = (state.position / state.duration) * 100;
    document.getElementById('progress').style.width = `${progress}%`;
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

    // Scroll to the track list with smooth animation
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Format track duration
function formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Play a specific track
async function playTrack(uri) {
    if (!deviceId) {
        showError('Player not ready. Please wait a moment and try again.');
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

// Check for authentication when page loads
window.onload = () => {
    console.log('Window loaded, checking authentication...');
    
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