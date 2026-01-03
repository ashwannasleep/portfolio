// Apple Music Integration - Display Ashley's Own Playlist Only
// This displays ONLY Ashley's personal playlist, not any visitor's data
class AppleMusicIntegration {
    constructor() {
        // Hardcoded configuration - Ashley's personal playlist only
        // This ensures we ONLY show Ashley's music, never visitor data
        this.mediaIdentifier = 'media.ashwannasleep.music'; // Ashley's Apple Music Media Identifier
        this.apiBase = '/.netlify/functions/apple-music-data'; // Netlify function endpoint
        this.playlistId = 'pl.u-8aAVZ6qho0lEWVJ'; // Ashley's personal Apple Music playlist ID (hardcoded)
        this.storefront = 'us'; // United States storefront
        this.refreshInterval = 5 * 60 * 1000; // Refresh every 5 minutes
        this.refreshTimer = null;
        
        // Ensure we never use any user input or visitor data
        this.isOwnerOnly = true; // Flag to ensure only owner's data is shown
        
        this.init();
    }

    init() {
        // Load data immediately on page load
        this.loadPlaylistData();
        
        // Set up automatic refresh
        this.startAutoRefresh();
        
        // Refresh when page becomes visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.loadPlaylistData();
            }
        });
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
            // Fetch playlist info for the player
            try {
                const playlistInfo = await this.fetchPlaylistInfo();
                if (playlistInfo && playlistInfo.data) {
                    this.displayPlaylistPlayer(playlistInfo.data);
                } else {
                    console.warn('No playlist info data received');
                    this.showPlaceholderPlayer();
                }
            } catch (error) {
                console.error('Error fetching playlist info:', error);
                this.showPlaceholderPlayer();
            }
            
            // Fetch real playlist tracks from Apple Music API
            try {
                const playlistData = await this.fetchPlaylistTracks();
                console.log('Playlist data received:', playlistData);
                if (playlistData && playlistData.data && playlistData.data.length > 0) {
                    this.displayPlaylistTracks(playlistData);
                } else {
                    console.warn('No track data received or empty array. Response:', playlistData);
                    this.showEmptyState('No tracks found in playlist');
                }
            } catch (error) {
                console.error('Error fetching playlist tracks:', error);
                this.showEmptyState(error.message || 'Failed to load tracks');
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
        const playlistArtwork = playlist.attributes?.artwork?.url?.replace('{w}', '500').replace('{h}', '500') || '';
        const playlistUrl = `https://music.apple.com/us/playlist/${this.playlistId}`;
        const trackCount = playlist.attributes?.trackCount || 0;
        const curatorName = playlist.attributes?.curatorName || 'Ashley';

        playerContainer.innerHTML = `
            <div style="display: flex; align-items: center; gap: var(--spacing-lg); padding: var(--spacing-md);">
                <div style="flex-shrink: 0;">
                    <img src="${playlistArtwork}" alt="${playlistName}" 
                         style="width: 80px; height: 80px; border-radius: 8px; object-fit: cover;"
                         onerror="this.style.display='none'">
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
            const endpoint = encodeURIComponent(`catalog/${this.storefront}/playlists/${this.playlistId}/tracks?limit=3`);
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
        
        playlistData.data.forEach((item, index) => {
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
                    <a href="${appleMusicUrl}" target="_blank" class="spotify-link">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="display: inline-block; vertical-align: middle;">
                            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.96-3.24-1.44-1.88-.96-2.91-2.07-3.24-3.24-.28-1.02-.04-2.05.4-3.08.44-1.03 1.03-2.05 1.64-3.08.78-1.34 1.34-2.05 1.64-2.12.3-.08.61-.1.91-.1.3 0 .6.02.91.1.3.07.86.78 1.64 2.12.61 1.03 1.2 2.05 1.64 3.08.44 1.03.68 2.06.4 3.08-.33 1.17-1.36 2.28-3.24 3.24-1.16.48-2.15.94-3.24 1.44-1.03.48-2.1.55-3.08.4-.98-.15-1.93-.5-2.84-1.05-.91-.55-1.67-1.19-2.28-1.92-.61-.73-1.05-1.5-1.32-2.3-.27-.8-.35-1.62-.24-2.44.11-.82.4-1.62.87-2.38.47-.76 1.11-1.45 1.92-2.05.81-.6 1.76-1.08 2.84-1.44 1.08-.36 2.27-.54 3.56-.54s2.48.18 3.56.54c1.08.36 2.03.84 2.84 1.44.81.6 1.45 1.29 1.92 2.05.47.76.76 1.56.87 2.38.11.82.03 1.64-.24 2.44-.27.8-.71 1.57-1.32 2.3-.61.73-1.37 1.37-2.28 1.92z"/>
                        </svg>
                        Listen on Apple Music
                    </a>
                </div>
            `;
            
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

