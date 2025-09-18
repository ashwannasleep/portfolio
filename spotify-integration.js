// Spotify API Integration
class SpotifyIntegration {
    constructor() {
        // Spotify API credentials - you'll need to replace these with your actual values
        this.clientId = 'YOUR_SPOTIFY_CLIENT_ID'; // Replace with your actual Client ID
        this.redirectUri = window.location.origin; // Use current domain
        this.scope = 'user-read-recently-played user-read-currently-playing';
        this.accessToken = null;
        this.refreshToken = null;
        
        this.init();
    }

    init() {
        // Show YOUR actual Spotify data immediately - your real music taste
        this.showYourSpotifyData();
    }

    showLoginButton() {
        const tracksContainer = document.getElementById('tracks-container');
        if (tracksContainer) {
            const loginSection = document.createElement('div');
            loginSection.className = 'spotify-login';
            loginSection.innerHTML = `
                <div class="login-container">
                    <div class="login-icon">🎵</div>
                    <h3>Connect Your Spotify</h3>
                    <p>Show your <strong>real</strong> recently played tracks from Spotify</p>
                    <button id="spotify-login" class="spotify-login-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                        </svg>
                        Connect to Spotify
                    </button>
                    <div class="setup-steps">
                        <p><strong>Quick Setup:</strong></p>
                        <ol>
                            <li>Click the button above</li>
                            <li>Authorize with Spotify</li>
                            <li>See your real tracks!</li>
                        </ol>
                    </div>
                    <p class="login-note">This will only access your public listening data</p>
                </div>
            `;
            
            tracksContainer.innerHTML = '';
            tracksContainer.appendChild(loginSection);
            
            // Add event listener
            document.getElementById('spotify-login').addEventListener('click', () => {
                this.authenticate();
            });
        }
    }

    authenticate() {
        const authUrl = `https://accounts.spotify.com/authorize?client_id=${this.clientId}&response_type=code&redirect_uri=${encodeURIComponent(this.redirectUri)}&scope=${encodeURIComponent(this.scope)}&show_dialog=true`;
        window.location.href = authUrl;
    }

    async handleAuthCallback(code) {
        try {
            // In a real implementation, you'd exchange this code for tokens on your backend
            // For now, we'll use the code to demonstrate the flow
            console.log('Auth code received:', code);
            
            // Show a message that the user needs to complete setup
            this.showSetupMessage();
        } catch (error) {
            console.error('Auth error:', error);
            this.showLoginButton();
        }
    }

    showYourSpotifyData() {
        // Your actual Spotify listening history - real tracks you've been listening to
        const yourTracks = [
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

        this.displayYourTracks(yourTracks);
        this.updateMusicIntro("Ashley's Recent Tracks");
    }

    displayYourTracks(tracks) {
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
                        Listen on Spotify
                    </a>
                </div>
            `;
            
            tracksContainer.appendChild(trackCard);
        });
    }

    updateMusicIntro(text) {
        const musicSubtitle = document.querySelector('.music-subtitle');
        if (musicSubtitle) {
            musicSubtitle.textContent = text;
        }
    }

    showSetupMessage() {
        const musicBlock = document.querySelector('.music-block');
        if (musicBlock) {
            const setupSection = document.createElement('div');
            setupSection.className = 'spotify-setup';
            setupSection.innerHTML = `
                <div class="setup-container">
                    <h3>🎉 Spotify Connected!</h3>
                    <p>To complete the setup and show your real listening history, you'll need to:</p>
                    <ol>
                        <li>Go to <a href="https://github.com/alecchendev/spotify-refresh-token" target="_blank">this tool</a> to get your refresh token</li>
                        <li>Add your Spotify Client ID and refresh token to the code</li>
                        <li>Deploy your updated portfolio</li>
                    </ol>
                    <div class="setup-note">
                        <strong>Note:</strong> This requires setting up a Spotify Developer app and getting proper tokens.
                        The tool above makes this process much easier!
                    </div>
                </div>
            `;
            
            const songList = musicBlock.querySelector('.song-list');
            if (songList) {
                songList.innerHTML = '';
                songList.appendChild(setupSection);
            }
        }
    }

    async loadUserData() {
        try {
            // Load recently played tracks
            const recentTracks = await this.fetchRecentlyPlayed();
            this.displayRecentlyPlayed(recentTracks);
            
            // Load current playing track
            const currentTrack = await this.fetchCurrentTrack();
            if (currentTrack) {
                this.displayCurrentTrack(currentTrack);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            this.showLoginButton();
        }
    }

    async fetchRecentlyPlayed() {
        const response = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=3', {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch recently played');
        }
        
        return await response.json();
    }

    async fetchCurrentTrack() {
        const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        });
        
        if (!response.ok) {
            return null;
        }
        
        return await response.json();
    }

    displayRecentlyPlayed(tracks) {
        const tracksContainer = document.getElementById('tracks-container');
        if (!tracksContainer || !tracks.items) return;

        tracksContainer.innerHTML = '';
        
        tracks.items.forEach(track => {
            const trackCard = document.createElement('div');
            trackCard.className = 'track-card';
            
            trackCard.innerHTML = `
                <div class="track-image">
                    <img src="${track.track.album.images[0]?.url || 'v2-images/fuji.jpg'}" alt="${track.track.name} cover">
                    <div class="play-overlay">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                </div>
                <div class="track-info">
                    <h4 class="track-name">${track.track.name}</h4>
                    <p class="track-artist">${track.track.artists.map(artist => artist.name).join(', ')}</p>
                    <div class="track-actions">
                        <a href="${track.track.external_urls.spotify}" target="_blank" class="spotify-link">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                            </svg>
                            Listen on Spotify
                        </a>
                    </div>
                </div>
            `;
            
            tracksContainer.appendChild(trackCard);
        });
    }

    displayCurrentTrack(trackData) {
        if (!trackData.item) return;
        
        const currentTrack = trackData.item;
        const musicIntro = document.querySelector('.music-intro');
        if (musicIntro) {
            musicIntro.innerHTML = `
                <span class="now-playing">
                    <span class="playing-indicator">▶</span>
                    Now playing: <strong>${currentTrack.name}</strong> by ${currentTrack.artists.map(artist => artist.name).join(', ')}
                </span>
            `;
        }
    }
}

// Initialize Spotify integration when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SpotifyIntegration();
});
