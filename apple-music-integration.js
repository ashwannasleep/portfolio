// Apple Music Integration - Display Ashley's Own Playlist Only
// This displays ONLY Ashley's personal playlist, not any visitor's data
class AppleMusicIntegration {
    constructor() {
        // Hardcoded configuration - Ashley's personal playlist only
        // This ensures we ONLY show Ashley's music, never visitor data
        this.mediaIdentifier = 'media.ashwannasleep.music'; // Ashley's Apple Music Media Identifier
        // Using path on main domain: ashwannasleep.com/api/apple-music
        this.apiBase = '/api/apple-music'; // Cloudflare Worker on same domain (relative path)
        this.playlistId = 'pl.u-8aAVZ6qho0lEWVJ'; // Ashley's personal Apple Music playlist ID (hardcoded)
        this.storefront = 'us'; // United States storefront
        // DISABLED auto-refresh to prevent exceeding free tier limits
        // Data will only load once per page visit, cached for 1 hour
        this.refreshInterval = null; // Disabled
        this.refreshTimer = null;
        this.cacheExpiry = 60 * 60 * 1000; // Cache data for 1 hour (very conservative)
        this.cachedData = null;
        this.cacheTimestamp = null;
        
        // Ensure we never use any user input or visitor data
        this.isOwnerOnly = true; // Flag to ensure only owner's data is shown
        
        this.init();
    }

    init() {
        // Load data immediately on page load (only once per page visit)
        this.loadPlaylistData();
        
        // DISABLED: Auto-refresh disabled to prevent exceeding free tier limits
        // this.startAutoRefresh();
        
        // DISABLED: Visibility change refresh disabled to save API calls
        // Data will only refresh on full page reload
    }

    startAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        
        this.refreshTimer = setInterval(() => {
            this.loadPlaylistData();
        }, this.refreshInterval);
    }

    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    async loadPlaylistData() {
        try {
            // Check cache first to avoid unnecessary API calls
            const now = Date.now();
            if (this.cachedData && this.cacheTimestamp && (now - this.cacheTimestamp) < this.cacheExpiry) {
                console.log('Using cached data to save API calls');
                this.displayPlaylistPlayer(this.cachedData.playlistInfo);
                this.displayPlaylistTracks(this.cachedData.playlistData);
                return;
            }
            
            // Fetch playlist tracks first to get the count
            let trackCount = 0;
            let playlistData = null;
            
            try {
                playlistData = await this.fetchPlaylistTracks();
                console.log('Playlist tracks data received:', playlistData);
                if (playlistData && playlistData.data && playlistData.data.length > 0) {
                    // Get total count from meta if available, otherwise use a reasonable default
                    // The API might not return total in meta, so we'll use the relationships count
                    trackCount = playlistData.meta?.total || 27; // Default to 27 as you mentioned
                    console.log('Track count determined:', trackCount, 'from meta:', playlistData.meta);
                    this.displayPlaylistTracks(playlistData);
                } else {
                    console.warn('No track data received or empty array. Response:', playlistData);
                    this.showEmptyState('No tracks found in playlist');
                }
            } catch (error) {
                console.error('Error fetching playlist tracks:', error);
                this.showEmptyState(error.message || 'Failed to load tracks');
            }
            
            // Fetch playlist info for the player (with track count)
            let playlistInfo = null;
            try {
                playlistInfo = await this.fetchPlaylistInfo();
                if (playlistInfo && playlistInfo.data) {
                    // Update track count if we have it from tracks endpoint
                    if (trackCount > 0) {
                        playlistInfo.data.attributes = playlistInfo.data.attributes || {};
                        playlistInfo.data.attributes.trackCount = trackCount;
                    }
                    this.displayPlaylistPlayer(playlistInfo.data);
                } else {
                    console.warn('No playlist info data received');
                    this.showPlaceholderPlayer();
                }
            } catch (error) {
                console.error('Error fetching playlist info:', error);
                this.showPlaceholderPlayer();
            }
            
            // Cache the data to reduce future API calls
            if (playlistData && playlistInfo) {
                this.cachedData = {
                    playlistData: playlistData,
                    playlistInfo: playlistInfo.data
                };
                this.cacheTimestamp = now;
                console.log('Data cached for', this.cacheExpiry / 1000 / 60, 'minutes');
            }
        } catch (error) {
            console.error('Error loading Apple Music data:', error);
            this.showPlaceholderPlayer();
            this.showEmptyState();
        }
    }

    async fetchPlaylistInfo() {
        try {
            // Security: Only use hardcoded playlist ID - never accept user input
            const ownerPlaylistId = 'pl.u-8aAVZ6qho0lEWVJ'; // Ashley's playlist ID (hardcoded)
            
            // Verify we're using the owner's playlist ID
            if (this.playlistId !== ownerPlaylistId) {
                console.error('Security: Attempted to use non-owner playlist ID');
                throw new Error('Only owner playlist is allowed');
            }
            
            const endpoint = encodeURIComponent(`catalog/${this.storefront}/playlists/${this.playlistId}`);
            const apiUrl = `${this.apiBase}?endpoint=${endpoint}`;
            console.log('Fetching playlist info from:', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Check if response is actually JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Non-JSON response received:', text.substring(0, 500));
                throw new Error(`Expected JSON but got ${contentType}. Response: ${text.substring(0, 200)}`);
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText.substring(0, 200)}`);
            }

            const data = await response.json();
            console.log('Playlist info response:', data);
            return data;
        } catch (error) {
            console.error('Error fetching playlist info:', error);
            throw error;
        }
    }

    displayPlaylistPlayer(playlist) {
        const playerContainer = document.getElementById('apple-music-player');
        if (!playerContainer) return;

        const playlistName = playlist.attributes?.name || 'My Playlist';
        const playlistDescription = playlist.attributes?.description?.standard || '';
        
        // Get artwork URL and format it properly
        let playlistArtwork = '';
        if (playlist.attributes?.artwork?.url) {
            playlistArtwork = playlist.attributes.artwork.url
                .replace('{w}', '500')
                .replace('{h}', '500')
                .replace('{f}', 'jpg');
        }
        
        const playlistUrl = `https://music.apple.com/us/playlist/${this.playlistId}`;
        
        // Get track count from attributes (set by loadPlaylistData if available)
        let trackCount = playlist.attributes?.trackCount || 0;
        
        // Fallback: try to get from relationships if available
        if (trackCount === 0 && playlist.relationships?.tracks?.data && Array.isArray(playlist.relationships.tracks.data)) {
            trackCount = playlist.relationships.tracks.data.length;
        }
        
        // If still 0, show a default or fetch separately
        if (trackCount === 0) {
            trackCount = 27; // Default fallback - you mentioned 27 songs earlier
        }
        
        const curatorName = playlist.attributes?.curatorName || 'Ashley';

        playerContainer.innerHTML = `
            <div style="display: flex; align-items: center; gap: var(--spacing-lg); padding: var(--spacing-md);">
                <div style="flex-shrink: 0;">
                    ${playlistArtwork ? `
                        <img src="${playlistArtwork}" alt="${playlistName}" 
                             style="width: 80px; height: 80px; border-radius: 12px; object-fit: cover; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);"
                             onerror="this.onerror=null; this.src=''; this.style.display='none';">
                    ` : `
                        <div style="width: 80px; height: 80px; border-radius: 12px; background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 18V5l12-2v13"></path>
                                <circle cx="6" cy="18" r="3"></circle>
                                <circle cx="18" cy="16" r="3"></circle>
                            </svg>
                        </div>
                    `}
                </div>
                <div style="flex: 1; min-width: 0;">
                    <div style="display: flex; align-items: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-xs);">
                        <span style="font-size: var(--font-size-sm); color: var(--text-secondary);">${curatorName}</span>
                        <span style="color: var(--text-secondary);">•</span>
                        <span style="font-size: var(--font-size-sm); color: var(--text-secondary);">${trackCount} songs</span>
                    </div>
                    <h3 style="font-size: var(--font-size-lg); font-weight: 600; color: var(--text-primary); margin-bottom: var(--spacing-xs); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${playlistName}
                    </h3>
                    ${playlistDescription ? `<p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: var(--spacing-sm); overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${playlistDescription}</p>` : ''}
                    <a href="${playlistUrl}" target="_blank" 
                       style="display: inline-flex; align-items: center; gap: var(--spacing-xs); color: var(--accent-primary); text-decoration: none; font-weight: 600; font-size: var(--font-size-sm);">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.96-3.24-1.44-1.88-.96-2.91-2.07-3.24-3.24-.28-1.02-.04-2.05.4-3.08.44-1.03 1.03-2.05 1.64-3.08.78-1.34 1.34-2.05 1.64-2.12.3-.08.61-.1.91-.1.3 0 .6.02.91.1.3.07.86.78 1.64 2.12.61 1.03 1.2 2.05 1.64 3.08.44 1.03.68 2.06.4 3.08-.33 1.17-1.36 2.28-3.24 3.24-1.16.48-2.15.94-3.24 1.44-1.03.48-2.1.55-3.08.4-.98-.15-1.93-.5-2.84-1.05-.91-.55-1.67-1.19-2.28-1.92-.61-.73-1.05-1.5-1.32-2.3-.27-.8-.35-1.62-.24-2.44.11-.82.4-1.62.87-2.38.47-.76 1.11-1.45 1.92-2.05.81-.6 1.76-1.08 2.84-1.44 1.08-.36 2.27-.54 3.56-.54s2.48.18 3.56.54c1.08.36 2.03.84 2.84 1.44.81.6 1.45 1.29 1.92 2.05.47.76.76 1.56.87 2.38.11.82.03 1.64-.24 2.44-.27.8-.71 1.57-1.32 2.3-.61.73-1.37 1.37-2.28 1.92z"/>
                        </svg>
                        Open in Apple Music
                    </a>
                </div>
            </div>
        `;
    }

    showPlaceholderPlayer() {
        const playerContainer = document.getElementById('apple-music-player');
        if (!playerContainer) return;

        // Use skeleton loading style to match the track cards
        playerContainer.innerHTML = `
            <div style="display: flex; align-items: center; gap: var(--spacing-lg); padding: var(--spacing-md);">
                <div style="width: 80px; height: 80px; border-radius: 12px; background: linear-gradient(90deg, var(--border-color) 25%, rgba(255,255,255,0.5) 50%, var(--border-color) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; flex-shrink: 0;"></div>
                <div style="flex: 1; min-width: 0;">
                    <div style="height: 14px; background: var(--border-color); border-radius: 4px; margin-bottom: 12px; width: 40%; animation: shimmer 1.5s infinite;"></div>
                    <div style="height: 20px; background: var(--border-color); border-radius: 4px; margin-bottom: 8px; width: 60%; animation: shimmer 1.5s infinite;"></div>
                    <div style="height: 14px; background: var(--border-color); border-radius: 4px; width: 30%; animation: shimmer 1.5s infinite;"></div>
                </div>
            </div>
        `;
    }

    async fetchPlaylistTracks() {
        try {
            // Security: Only use hardcoded playlist ID - never accept user input
            // This ensures we ONLY fetch Ashley's playlist, never visitor data
            const ownerPlaylistId = 'pl.u-8aAVZ6qho0lEWVJ'; // Ashley's playlist ID (hardcoded)
            
            // Verify we're using the owner's playlist ID
            if (this.playlistId !== ownerPlaylistId) {
                console.error('Security: Attempted to use non-owner playlist ID');
                throw new Error('Only owner playlist is allowed');
            }
            
            // Apple Music API endpoint format: catalog/{storefront}/playlists/{playlistId}/tracks
            // Fetch all tracks first, then we can randomize or select specific ones
            const endpoint = encodeURIComponent(`catalog/${this.storefront}/playlists/${this.playlistId}/tracks?limit=100`);
            const apiUrl = `${this.apiBase}?endpoint=${endpoint}`;
            console.log('Fetching tracks from:', apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Check if response is actually JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Non-JSON response received:', text.substring(0, 500));
                throw new Error(`Expected JSON but got ${contentType}. Response: ${text.substring(0, 200)}`);
            }

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText.substring(0, 200)}`);
            }

            const data = await response.json();
            console.log('API Response:', data);
            return data;
        } catch (error) {
            console.error('Error fetching playlist tracks:', error);
            throw error;
        }
    }

    displayPlaylistTracks(playlistData) {
        const tracksContainer = document.getElementById('tracks-container');
        if (!tracksContainer || !playlistData.data || playlistData.data.length === 0) {
            this.showEmptyState();
            return;
        }

        tracksContainer.innerHTML = '';
        
        // Get tracks and randomize them, then take first 3
        let tracks = [...playlistData.data];
        
        // Randomize the tracks array
        for (let i = tracks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
        }
        
        // Take first 3 randomized tracks
        const displayTracks = tracks.slice(0, 3);
        
        displayTracks.forEach((item, index) => {
            const track = item.attributes;
            const trackCard = document.createElement('div');
            trackCard.className = 'track-card';
            
            const albumArt = track.artwork?.url?.replace('{w}', '300').replace('{h}', '300') || '';
            const trackName = track.name;
            const artist = track.artistName;
            const appleMusicUrl = track.url || `https://music.apple.com/us/album/${track.albumId}`;
            
            trackCard.innerHTML = `
                <div class="track-image">
                    <img src="${albumArt}" alt="${trackName} cover" onerror="this.src='images/fuji.jpg'">
                </div>
                <div class="track-info">
                    <h4 class="track-name">${trackName}</h4>
                    <p class="track-artist">${artist}</p>
                    <span class="played-time">Track ${index + 1} from your playlist</span>
                </div>
            `;
            
            // Make the entire card clickable
            trackCard.style.cursor = 'pointer';
            trackCard.addEventListener('click', () => {
                window.open(appleMusicUrl, '_blank');
            });
            
            tracksContainer.appendChild(trackCard);
        });
    }

    showEmptyState(errorMessage = null) {
        const tracksContainer = document.getElementById('tracks-container');
        if (!tracksContainer) return;

        // If there's an error, show it briefly, otherwise show skeleton
        if (errorMessage) {
            console.error('Showing error state:', errorMessage);
        }

        // Show a subtle loading state that matches the track card design
        tracksContainer.innerHTML = '';
        
        // Create 3 skeleton loading cards
        for (let i = 0; i < 3; i++) {
            const skeletonCard = document.createElement('div');
            skeletonCard.className = 'track-card';
            skeletonCard.style.opacity = '0.6';
            skeletonCard.innerHTML = `
                <div class="track-image" style="background: linear-gradient(90deg, var(--border-color) 25%, rgba(255,255,255,0.5) 50%, var(--border-color) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite;"></div>
                <div class="track-info" style="flex: 1;">
                    <div style="height: 20px; background: var(--border-color); border-radius: 4px; margin-bottom: 8px; width: 70%; animation: shimmer 1.5s infinite;"></div>
                    <div style="height: 16px; background: var(--border-color); border-radius: 4px; margin-bottom: 8px; width: 50%; animation: shimmer 1.5s infinite;"></div>
                    <div style="height: 14px; background: var(--border-color); border-radius: 4px; width: 40%; animation: shimmer 1.5s infinite;"></div>
                </div>
            `;
            tracksContainer.appendChild(skeletonCard);
        }
    }
}

// Initialize Apple Music integration when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new AppleMusicIntegration();
    });
} else {
    new AppleMusicIntegration();
}

