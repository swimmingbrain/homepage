// Spotify Web Playback SDK setup
let player;
let token;
let deviceId;

// Replace with your Spotify Client ID
const CLIENT_ID = 'bf45e9aa56e64d4c924c7136bc358631';
const REDIRECT_URI = 'https://swimmingbrain.dev/spotify.html';
const USER_ID = 'kg78o2lmqe4af77s3morbt5eq'; // Your Spotify user ID

// Initialize the Spotify Web Playback SDK
window.onSpotifyWebPlaybackSDKReady = () => {
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
        // Clear token and redirect to login
        localStorage.removeItem('spotify_token');
        window.location.href = getAuthUrl();
    });
    player.addListener('account_error', ({ message }) => { 
        console.error('Account Error:', message);
        showError('Account error. Please check your Spotify account status.');
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
    });

    // Connect to the player
    player.connect();
};

// Get authentication URL
function getAuthUrl() {
    const scope = 'user-read-private user-read-email user-read-playback-state user-modify-playback-state user-read-currently-playing playlist-read-private';
    const state = generateRandomString(16);
    localStorage.setItem('spotify_auth_state', state);
    
    const params = new URLSearchParams({
        client_id: CLIENT_ID,
        response_type: 'token',
        redirect_uri: REDIRECT_URI,
        state: state,
        scope: scope,
        show_dialog: true
    });
    
    return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

// Show error message to user
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.querySelector('.spotify-container').prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Update the player UI with current track info
function updatePlayerUI(state) {
    const track = state.track_window.current_track;
    document.getElementById('albumArt').src = track.album.images[0].url;
    document.getElementById('trackName').textContent = track.name;
    document.getElementById('artistName').textContent = track.artists.map(artist => artist.name).join(', ');
    
    // Update progress bar
    const progress = (state.position / state.duration) * 100;
    document.getElementById('progress').style.width = `${progress}%`;
}

// Load user's public playlists
async function loadPlaylists() {
    try {
        const response = await fetch(`https://api.spotify.com/v1/users/${USER_ID}/playlists`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.items.length === 0) {
            showError('No public playlists found.');
            return;
        }
        displayPlaylists(data.items);
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
            <img src="${playlist.images[0]?.url || 'default-playlist-cover.jpg'}" 
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
        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
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
    
    tracks.forEach(item => {
        const track = item.track;
        const trackElement = document.createElement('div');
        trackElement.className = 'track-item';
        trackElement.innerHTML = `
            <img src="${track.album.images[2]?.url || 'default-track-cover.jpg'}" 
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

    // Replace existing track list
    const existingList = document.querySelector('.track-list');
    if (existingList) {
        existingList.remove();
    }
    document.querySelector('.spotify-container').appendChild(container);
}

// Format track duration
function formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Play a specific track
async function playTrack(uri) {
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
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error playing track:', error);
        showError('Failed to play track. Please try again.');
    }
}

// Player controls
document.getElementById('playPause').onclick = () => {
    player.togglePlay();
};

document.getElementById('prevTrack').onclick = () => {
    player.previousTrack();
};

document.getElementById('nextTrack').onclick = () => {
    player.nextTrack();
};

// Check for authentication
window.onload = () => {
    console.log('Window loaded, checking authentication...');
    
    // Check for error in URL
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error) {
        console.error('Authentication error:', error);
        showError(`Authentication error: ${error}`);
        return;
    }

    // Check for token in URL hash
    const hash = window.location.hash
        .substring(1)
        .split('&')
        .reduce((initial, item) => {
            if (item) {
                const parts = item.split('=');
                initial[parts[0]] = decodeURIComponent(parts[1]);
            }
            return initial;
        }, {});

    console.log('Hash contents:', hash);

    if (hash.access_token) {
        console.log('Access token found, initializing player...');
        token = hash.access_token;
        localStorage.setItem('spotify_token', token);
        // Remove hash from URL to prevent refresh loop
        window.history.replaceState({}, document.title, window.location.pathname);
        loadPlaylists();
    } else {
        // Check if we have a stored token
        const storedToken = localStorage.getItem('spotify_token');
        if (storedToken) {
            console.log('Using stored token...');
            token = storedToken;
            loadPlaylists();
        } else {
            console.log('No token found, redirecting to Spotify login...');
            window.location.href = getAuthUrl();
        }
    }
};

// Generate random string for state parameter
function generateRandomString(length) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
} 