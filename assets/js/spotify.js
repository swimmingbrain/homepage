// Spotify Web Playback SDK setup
let player;
let token; // This will hold the access token
let deviceId;

const CLIENT_ID = 'bf45e9aa56e64d4c924c7136bc358631'; // Your Spotify Client ID
const REDIRECT_URI = 'https://swimmingbrain.dev/spotify.html'; // Your exact redirect URI
const USER_ID = 'kg78o2lmqe4af77s3morbt5eq'; // Your Spotify user ID

// IMPORTANT: Review your API call URLs.
// The standard Spotify API base is 'https://api.spotify.com/v1'.
// If 'googleusercontent.com/spotify.com/...' are placeholders or your own proxy, ensure they are correct.
// Otherwise, replace them with the standard Spotify API endpoints.
// For example: `https://api.spotify.com/v1/users/${USER_ID}/playlists`
const SPOTIFY_API_BASE_URL = 'https://api.spotify.com/v1'; // Standard Spotify API base

// Initialize the Spotify Web Playback SDK
window.onSpotifyWebPlaybackSDKReady = () => {
    player = new Spotify.Player({
        name: 'SwimmingBrain Player',
        getOAuthToken: cb => { 
            // This function is called by the SDK when it needs a token
            if (!token) {
                console.warn('OAuth token requested by SDK, but not available yet.');
                // Optionally, you could trigger the auth flow again or show an error
                // For now, we rely on the window.onload logic to get the token.
            }
            cb(token); 
        },
        volume: 0.5
    });

    // Error handling
    player.addListener('initialization_error', ({ message }) => { 
        console.error('Initialization Error:', message);
        showError('Failed to initialize player. Please try refreshing the page.');
    });
    player.addListener('authentication_error', ({ message }) => { 
        console.error('Authentication Error:', message);
        showError('Authentication failed with player. Please ensure you are logged in to Spotify and try refreshing. Error: ' + message);
        // It's possible the token expired or is invalid.
        // Consider redirecting to login if message indicates token issues.
        // e.g., if (message.includes('Invalid access token')) redirectToLogin();
    });
    player.addListener('account_error', ({ message }) => { 
        console.error('Account Error:', message);
        showError('Account error. Please check your Spotify account (e.g., Premium required for SDK). Error: ' + message);
    });
    player.addListener('playback_error', ({ message }) => { 
        console.error('Playback Error:', message);
        showError('Playback error: ' + message);
    });

    // Playback status updates
    player.addListener('player_state_changed', state => {
        if (state) {
            updatePlayerUI(state);
        } else {
            // Handle cases where state is null (e.g. player becomes inactive)
            document.getElementById('trackName').textContent = 'Player inactive. Select a track.';
            document.getElementById('artistName').textContent = '-';
            document.getElementById('albumArt').src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='; // Placeholder
            document.getElementById('progress').style.width = '0%';
        }
    });

    // Ready
    player.addListener('ready', ({ device_id }) => {
        deviceId = device_id;
        console.log('Ready with Device ID', device_id);
        // You can now transfer playback to this device if needed using the API
    });

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
    });

    // Connect to the player
    // Connection will attempt once window.onload has potentially set the token.
    // If token is not set, getOAuthToken will be called with an undefined token,
    // which might lead to an authentication_error for the player.
    if (token) { // Attempt to connect only if token is already available
        player.connect().then(success => {
            if (success) {
                console.log('The Web Playback SDK successfully connected to Spotify!');
            } else {
                console.error('The Web Playback SDK failed to connect to Spotify.');
            }
        });
    } else {
        console.warn("Player SDK: Token not available at initial onSpotifyWebPlaybackSDKReady. Connect will be attempted later or if auth succeeds.");
    }
};

// Show error message to user
function showError(message) {
    // Remove any existing error message
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message'; // Add a class for styling
    errorDiv.textContent = message;
    
    const spotifyContainer = document.querySelector('.spotify-container');
    if (spotifyContainer) {
        spotifyContainer.prepend(errorDiv); // Add message at the top of the container
        setTimeout(() => {
            if (errorDiv) errorDiv.remove();
        }, 7000); // Keep error for 7 seconds
    } else {
        alert(message); // Fallback if container not found
    }
}

// Update the player UI with current track info
function updatePlayerUI(state) {
    if (!state || !state.track_window || !state.track_window.current_track) {
        // Potentially player is not active, or no track is loaded
        document.getElementById('trackName').textContent = 'Nothing playing';
        document.getElementById('artistName').textContent = '-';
        document.getElementById('albumArt').src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='; // Placeholder
        document.getElementById('playPause').textContent = '▶';
        document.getElementById('progress').style.width = '0%';
        return;
    }

    const track = state.track_window.current_track;
    document.getElementById('albumArt').src = track.album.images[0]?.url || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
    document.getElementById('trackName').textContent = track.name;
    document.getElementById('artistName').textContent = track.artists.map(artist => artist.name).join(', ');
    
    document.getElementById('playPause').textContent = state.paused ? '▶' : '❚❚';

    // Update progress bar
    if (state.duration > 0) {
        const progressPercentage = (state.position / state.duration) * 100;
        document.getElementById('progress').style.width = `${progressPercentage}%`;
    } else {
        document.getElementById('progress').style.width = '0%';
    }
}

// Load user's public playlists
async function loadPlaylists() {
    if (!token) {
        showError("Not authenticated. Cannot load playlists.");
        return;
    }
    try {
        // Ensure you are using the correct endpoint. Standard is: ${SPOTIFY_API_BASE_URL}/me/playlists or /users/${USER_ID}/playlists
        const response = await fetch(`${SPOTIFY_API_BASE_URL}/users/${USER_ID}/playlists`, { // Corrected to use SPOTIFY_API_BASE_URL
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 401) {
            showError('Spotify token is invalid or expired. Please re-authenticate.');
            redirectToLogin(); // Helper function to redirect
            return;
        }
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${await response.text()}`);
        }
        
        const data = await response.json();
        if (!data.items || data.items.length === 0) {
            showError('No public playlists found.');
            return;
        }
        displayPlaylists(data.items);
    } catch (error) {
        console.error('Error loading playlists:', error);
        showError(`Failed to load playlists: ${error.message}. Please try again later.`);
    }
}

// Display playlists in the grid
function displayPlaylists(playlists) {
    const grid = document.getElementById('playlistGrid');
    grid.innerHTML = ''; // Clear previous playlists

    playlists.forEach(playlist => {
        const card = document.createElement('div');
        card.className = 'playlist-card';
        card.innerHTML = `
            <img src="${playlist.images[0]?.url || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}" 
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
    if (!token) {
        showError("Not authenticated. Cannot load tracks.");
        return;
    }
    try {
        // Ensure you are using the correct endpoint. Standard is: ${SPOTIFY_API_BASE_URL}/playlists/${playlistId}/tracks
        const response = await fetch(`${SPOTIFY_API_BASE_URL}/playlists/${playlistId}/tracks`, { // Corrected
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 401) {
            showError('Spotify token is invalid or expired. Please re-authenticate.');
            redirectToLogin();
            return;
        }
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${await response.text()}`);
        }
        
        const data = await response.json();
        if (!data.items || data.items.length === 0) {
            showError('No tracks found in this playlist.');
            // Clear existing track list if no tracks are found
            const existingList = document.querySelector('.track-list');
            if (existingList) existingList.remove();
            return;
        }
        displayTracks(data.items.filter(item => item.track)); // Filter out null tracks if any
    } catch (error) {
        console.error('Error loading tracks:', error);
        showError(`Failed to load tracks: ${error.message}. Please try again later.`);
    }
}

// Display tracks in the track list
function displayTracks(tracks) {
    // Remove existing track list first
    const existingList = document.querySelector('.track-list');
    if (existingList) {
        existingList.remove();
    }

    const container = document.createElement('div');
    container.className = 'track-list';
    
    tracks.forEach(item => {
        const track = item.track;
        if (!track) return; // Skip if track object is null

        const trackElement = document.createElement('div');
        trackElement.className = 'track-item';
        trackElement.innerHTML = `
            <img src="${track.album.images[2]?.url || track.album.images[0]?.url || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}" 
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

    document.querySelector('.spotify-container').appendChild(container);
}

// Format track duration
function formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Play a specific track using the Web Playback SDK
async function playTrack(trackUri) {
    if (!token) {
        showError("Not authenticated. Cannot play track.");
        return;
    }
    if (!deviceId) {
        showError("Player not ready. Please wait or select 'SwimmingBrain Player' in Spotify Connect.");
        // Optionally, try to connect the player again if it's not connected.
        if (player && !player.isConnected()) {
             player.connect().then(success => {
                if (success) playTrack(trackUri); // Retry playing after connect
             });
        }
        return;
    }

    try {
        // Using Web Playback SDK to play requires transferring playback and then playing.
        // The more direct SDK way is to use its play method after ensuring the device is active.
        // However, the Spotify API PUT /me/player/play is also common.
        const response = await fetch(`${SPOTIFY_API_BASE_URL}/me/player/play?device_id=${deviceId}`, { // Corrected
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uris: [trackUri]
            })
        });
        
        if (response.status === 401) {
            showError('Spotify token is invalid or expired. Please re-authenticate.');
            redirectToLogin();
            return;
        }
        if (!response.ok) {
             const errorData = await response.json();
             console.error('API Play Error:', errorData);
             // Check for specific errors like "NO_ACTIVE_DEVICE"
             if (errorData.error && errorData.error.reason === 'NO_ACTIVE_DEVICE') {
                showError('No active Spotify device. Please select "SwimmingBrain Player" in Spotify or start playback on another device first.');
             } else {
                throw new Error(`HTTP error! status: ${response.status} - ${errorData.error?.message || 'Failed to play track'}`);
             }
        }
        // If successful, the player_state_changed listener should update the UI.
    } catch (error) {
        console.error('Error playing track:', error);
        showError(`Failed to play track: ${error.message}.`);
    }
}

// Player controls
document.getElementById('playPause').onclick = () => {
    if (player) player.togglePlay().catch(err => console.error("Toggle play error:", err));
};

document.getElementById('prevTrack').onclick = () => {
    if (player) player.previousTrack().catch(err => console.error("Previous track error:", err));
};

document.getElementById('nextTrack').onclick = () => {
    if (player) player.nextTrack().catch(err => console.error("Next track error:", err));
};


function redirectToLogin() {
    // Clear any stored token that might be invalid
    token = null; 
    // Construct the authorization URL
    // Added 'streaming' scope for Web Playback SDK, 'user-library-read' for liked songs (example)
    const scopes = [
        'user-read-private', 
        'user-read-email', 
        'user-read-playback-state', 
        'user-modify-playback-state', 
        'user-read-currently-playing', 
        'playlist-read-private',
        'playlist-read-collaborative', // If you want to read collaborative playlists
        'streaming' // Essential for Web Playback SDK
    ];
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(scopes.join(' '))}&show_dialog=true`; // show_dialog can be useful for testing
    window.location.href = authUrl;
}

// Check for authentication when the page loads
window.onload = () => {
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

    if (hash.error) {
        // Spotify returned an error
        console.error('Spotify Authentication Error:', hash.error, hash.error_description || '');
        showError(`Spotify Authentication Failed: ${hash.error}. ${hash.error_description || ''}. Please try logging in again.`);
        // Clear the hash to prevent re-processing on manual refresh
        if (history.pushState) {
            history.pushState("", document.title, window.location.pathname + window.location.search);
        } else {
            window.location.hash = '';
        }
    } else if (hash.access_token) {
        // Successfully authenticated
        token = hash.access_token;
        console.log("Access token obtained:", token);

        // Clean the hash from the URL
        if (history.pushState) {
            history.pushState("", document.title, window.location.pathname + window.location.search);
        } else {
            window.location.hash = ''; // Fallback for older browsers
        }
        
        // Now that we have a token, load playlists and try to connect the player
        loadPlaylists(); 
        if (player) { // If player was initialized by onSpotifyWebPlaybackSDKReady
            player.connect().then(success => { // Connect if not already
                if (success) {
                    console.log('Web Playback SDK connected after obtaining token.');
                } else {
                     console.error('Web Playback SDK failed to connect after obtaining token.');
                }
            }).catch(err => console.error("Error connecting player post-token:", err));
        }

    } else {
        // No token and no error, so initiate login
        console.log("No token or error in hash, redirecting to Spotify login.");
        redirectToLogin();
    }
};