// Spotify API Integration - Real Data Fetching
class SpotifyIntegration {
    constructor() {
        // Configuration - update these with your values
        // Get your Client ID from: https://developer.spotify.com/dashboard
        this.clientId = 'YOUR_SPOTIFY_CLIENT_ID'; // Replace with your Client ID
        this.apiBase = '/.netlify/functions/spotify-data'; // Netlify function endpoint
        this.refreshInterval = 5 * 60 * 1000; // Refresh every 5 minutes (in milliseconds)
        this.refreshTimer = null;
        
        this.init();
    }

    init() {
        // Load data immediately on page load
        this.loadUserData();
        
        // Set up automatic refresh
        this.startAutoRefresh();
        
        // Refresh when page becomes visible (user switches back to tab)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.loadUserData();
            }
        });
    }

    startAutoRefresh() {
        // Clear any existing timer
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        
        // Set up interval to refresh data periodically
        this.refreshTimer = setInterval(() => {
            this.loadUserData();
        }, this.refreshInterval);
    }

    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    async loadUserData() {
        try {
            // Fetch recently played tracks
            const recentTracks = await this.fetchRecentlyPlayed();
            if (recentTracks && recentTracks.items) {
                this.displayRecentlyPlayed(recentTracks);
            } else {
                // Fallback to placeholder if API fails
                this.showPlaceholderData();
            }
            
            // Fetch currently playing track (optional)
            const currentTrack = await this.fetchCurrentTrack();
            if (currentTrack && currentTrack.item) {
                this.displayCurrentTrack(currentTrack);
            }
        } catch (error) {
            console.error('Error loading Spotify data:', error);
            // Show placeholder data if API fails
            this.showPlaceholderData();
        }
    }

    async fetchRecentlyPlayed() {
        try {
            // Encode the endpoint to handle query parameters
            const endpoint = encodeURIComponent('me/player/recently-played?limit=3');
            const response = await fetch(`${this.apiBase}?endpoint=${endpoint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching recently played:', error);
            throw error;
        }
    }

    async fetchCurrentTrack() {
        try {
            const response = await fetch(`${this.apiBase}?endpoint=me/player/currently-playing`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                // It's okay if no track is currently playing
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching current track:', error);
            return null;
        }
    }

    displayRecentlyPlayed(tracks) {
        const tracksContainer = document.getElementById('tracks-container');
        if (!tracksContainer || !tracks.items || tracks.items.length === 0) {
            this.showPlaceholderData();
            return;
        }

        tracksContainer.innerHTML = '';
        
        tracks.items.forEach(track => {
            const trackCard = document.createElement('div');
            trackCard.className = 'track-card';
            
            const albumArt = track.track.album.images[0]?.url || '';
            const trackName = track.track.name;
            const artists = track.track.artists.map(artist => artist.name).join(', ');
            const spotifyUrl = track.track.external_urls.spotify;
            const playedAt = this.formatPlayedTime(track.played_at);
            
            trackCard.innerHTML = `
                <div class="track-image">
                    <img src="${albumArt}" alt="${trackName} cover" onerror="this.src='images/fuji.jpg'">
                </div>
                <div class="track-info">
                    <h4 class="track-name">${trackName}</h4>
                    <p class="track-artist">${artists}</p>
                    <span class="played-time">${playedAt}</span>
                    <a href="${spotifyUrl}" target="_blank" class="spotify-link">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="display: inline-block; vertical-align: middle;">
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                        </svg>
                        Listen on Spotify
                    </a>
                </div>
            `;
            
            tracksContainer.appendChild(trackCard);
        });
    }

    displayCurrentTrack(trackData) {
        if (!trackData.item) return;
        
        const currentTrack = trackData.item;
        const musicSubtitle = document.querySelector('.section-subtitle');
        if (musicSubtitle) {
            musicSubtitle.innerHTML = `
                <span class="now-playing">
                    <span class="playing-indicator">▶</span>
                    Now playing: <strong>${currentTrack.name}</strong> by ${currentTrack.artists.map(artist => artist.name).join(', ')}
                </span>
            `;
        }
    }

    formatPlayedTime(playedAt) {
        if (!playedAt) return '';
        
        const playedDate = new Date(playedAt);
        const now = new Date();
        const diffMs = now - playedDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
        if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
        if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
        
        return playedDate.toLocaleDateString();
    }

    showPlaceholderData() {
        // Fallback placeholder data if API fails
        const placeholderTracks = [
            {
                name: "Shinunoga E-Wa",
                artist: "Fujii Kaze",
                albumArt: "images/fuji.jpg",
                spotifyUrl: "https://open.spotify.com/track/0E3LzDo6s8GX0ChVT8lXjK",
                playedAt: "2 hours ago"
            },
            {
                name: "Mutt", 
                artist: "Leon Thomas",
                albumArt: "images/leon.jpg",
                spotifyUrl: "https://open.spotify.com/track/1mh9eHVRdNhzryG43PXdW1",
                playedAt: "4 hours ago"
            },
            {
                name: "Really Like You",
                artist: "BABYMONSTER", 
                albumArt: "images/babymonster.jpg",
                spotifyUrl: "https://open.spotify.com/track/3entdIWiOuQfcXIkJEABsV",
                playedAt: "6 hours ago"
            }
        ];

        this.displayPlaceholderTracks(placeholderTracks);
    }

    displayPlaceholderTracks(tracks) {
        const tracksContainer = document.getElementById('tracks-container');
        if (!tracksContainer) return;

        tracksContainer.innerHTML = '';
        
        tracks.forEach(track => {
            const trackCard = document.createElement('div');
            trackCard.className = 'track-card';
            
            trackCard.innerHTML = `
                <div class="track-image">
                    <img src="${track.albumArt}" alt="${track.name} cover">
                </div>
                <div class="track-info">
                    <h4 class="track-name">${track.name}</h4>
                    <p class="track-artist">${track.artist}</p>
                    <span class="played-time">${track.playedAt}</span>
                    <a href="${track.spotifyUrl}" target="_blank" class="spotify-link">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="display: inline-block; vertical-align: middle;">
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                        </svg>
                        Listen on Spotify
                    </a>
                </div>
            `;
            
            tracksContainer.appendChild(trackCard);
        });
    }
}

// Initialize Spotify integration when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new SpotifyIntegration();
    });
} else {
    new SpotifyIntegration();
}
