// Apple Music Integration - Display Ashley's Own Playlist Only
// This displays ONLY Ashley's personal playlist, not any visitor's data
class AppleMusicIntegration {
    constructor() {
        // Hardcoded configuration - Ashley's personal playlist only
        // This ensures we ONLY show Ashley's music, never visitor data
        this.mediaIdentifier = 'media.ashwannasleep.music'; // Ashley's Apple Music Media Identifier
        // Using Cloudflare Workers dev URL for now
        // After setting up custom route in Dashboard, change to: '/api/apple-music'
        this.apiBase = 'https://apple-music-data.wunjingchang-work.workers.dev'; // Cloudflare Worker URL
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
        // Show placeholder immediately
        this.showPlaceholderPlayer();
        this.showEmptyState('Loading...');
        
        // Load data with retry mechanism
        this.loadPlaylistDataWithRetry(3); // Retry up to 3 times
        
        // Match heights on window resize
        window.addEventListener('resize', () => {
            setTimeout(() => this.matchHeights(), 100);
        });
        
        // DISABLED: Auto-refresh disabled to prevent exceeding free tier limits
        // this.startAutoRefresh();
        
        // DISABLED: Visibility change refresh disabled to save API calls
        // Data will only refresh on full page reload
    }
    
    async loadPlaylistDataWithRetry(maxRetries = 3, retryDelay = 2000) {
        let lastError = null;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`Attempt ${attempt} of ${maxRetries} to load playlist data...`);
                await this.loadPlaylistData();
                // If successful, return early
                return;
            } catch (error) {
                lastError = error;
                console.warn(`Attempt ${attempt} failed:`, error.message);
                
                if (attempt < maxRetries) {
                    console.log(`Retrying in ${retryDelay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                    // Increase delay for next retry
                    retryDelay *= 1.5;
                }
            }
        }
        
        // All retries failed - show error but keep trying to load
        console.error('All retry attempts failed. Last error:', lastError);
        // Don't show fallback - let the user see the loading state
        // The API might work on next page load
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

    escapeHtml(value) {
        if (typeof value !== 'string') return '';

        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    async loadPlaylistData() {
        try {
            console.log('Loading playlist data...');
            
            // Check cache first to avoid unnecessary API calls
            const now = Date.now();
            if (this.cachedData && this.cacheTimestamp && (now - this.cacheTimestamp) < this.cacheExpiry) {
                console.log('Using cached data');
                this.displayPlaylistPlayer(this.cachedData.playlistInfo);
                this.displayPlaylistTracks(this.cachedData.playlistData);
                return;
            }
            
            // Show loading state immediately
            this.showEmptyState('Loading...');
            
            // Fetch playlist tracks first to get the count
            let trackCount = 0;
            let playlistData = null;
            
            try {
                console.log('Fetching playlist tracks from:', this.apiBase);
                console.log('Playlist ID:', this.playlistId);
                playlistData = await this.fetchPlaylistTracks();
                console.log('Received playlist data:', playlistData);
                
                if (playlistData && playlistData.data && Array.isArray(playlistData.data) && playlistData.data.length > 0) {
                    // Get total count from meta if available, otherwise use a reasonable default
                    // The API might not return total in meta, so we'll use the relationships count
                    trackCount = playlistData.meta?.total || playlistData.data.length;
                    console.log('✅ Successfully loaded', playlistData.data.length, 'tracks');
                    console.log('First track:', playlistData.data[0]?.attributes?.name);
                    this.displayPlaylistTracks(playlistData);
                } else {
                    console.warn('⚠️ No tracks found in playlist data. Response:', playlistData);
                    // Check if there's an error in the response
                    if (playlistData && playlistData.error) {
                        console.error('API Error:', playlistData.error);
                        throw new Error(playlistData.error);
                    }
                    throw new Error('No tracks found in playlist');
                }
            } catch (error) {
                console.error('❌ Error fetching playlist tracks:', error);
                console.error('Error details:', {
                    message: error.message,
                    stack: error.stack,
                    apiBase: this.apiBase,
                    playlistId: this.playlistId,
                    storefront: this.storefront
                });
                // Re-throw to trigger retry
                throw error;
            }
            
            // Fetch playlist info for the player (with track count)
            let playlistInfo = null;
            try {
                console.log('Fetching playlist info...');
                playlistInfo = await this.fetchPlaylistInfo();
                console.log('Received playlist info:', playlistInfo);
                
                if (playlistInfo && playlistInfo.data) {
                    // Update track count if we have it from tracks endpoint
                    if (trackCount > 0) {
                        playlistInfo.data.attributes = playlistInfo.data.attributes || {};
                        playlistInfo.data.attributes.trackCount = trackCount;
                    }
                    console.log('📋 Playlist data structure:', {
                        hasData: !!playlistInfo.data,
                        hasAttributes: !!playlistInfo.data.attributes,
                        name: playlistInfo.data.attributes?.name,
                        allKeys: Object.keys(playlistInfo.data)
                    });
                    this.displayPlaylistPlayer(playlistInfo.data);
                } else {
                    console.warn('No playlist info received, showing placeholder');
                    this.showPlaceholderPlayer();
                }
            } catch (error) {
                console.error('Error fetching playlist info:', error);
                console.error('Error details:', {
                    message: error.message,
                    stack: error.stack,
                    apiBase: this.apiBase,
                    playlistId: this.playlistId
                });
                this.showPlaceholderPlayer();
            }
            
            // Cache the data to reduce future API calls
            if (playlistData && playlistInfo) {
                this.cachedData = {
                    playlistData: playlistData,
                    playlistInfo: playlistInfo.data
                };
                this.cacheTimestamp = now;
            }
            } catch (error) {
                console.error('Error loading Apple Music data:', error);
                // Re-throw to allow retry mechanism to handle it
                throw error;
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
                throw new Error(`Expected JSON but got ${contentType}. Response: ${text.substring(0, 200)}`);
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText.substring(0, 200)}`);
            }

            const data = await response.json();
            
            // Debug: Log the playlist data structure
            if (data && data.data) {
                console.log('Playlist Info Response:', {
                    id: data.data.id,
                    type: data.data.type,
                    attributes: data.data.attributes,
                    name: data.data.attributes?.name,
                    hasArtwork: !!data.data.attributes?.artwork,
                    artwork: data.data.attributes?.artwork,
                    artworkUrl: data.data.attributes?.artwork?.url
                });
            }
            
            return data;
        } catch (error) {
            console.error('Error fetching playlist info:', error);
            throw error;
        }
    }

    async displayPlaylistPlayer(playlist) {
        const playerContainer = document.getElementById('apple-music-player');
        if (!playerContainer) return;

        // Debug: Log the playlist object structure
        console.log('Display Playlist Player - Full playlist object:', playlist);
        console.log('Playlist attributes:', playlist.attributes);
        console.log('Playlist keys:', Object.keys(playlist));
        
        // Try multiple ways to get the playlist name - check all possible locations
        let playlistName = null;
        
        // Check various possible locations for the name
        if (playlist.attributes?.name) {
            playlistName = playlist.attributes.name;
        } else if (playlist.name) {
            playlistName = playlist.name;
        } else if (playlist.attributes?.playParams?.name) {
            playlistName = playlist.attributes.playParams.name;
        } else if (playlist.data?.attributes?.name) {
            playlistName = playlist.data.attributes.name;
        } else if (playlist.data?.name) {
            playlistName = playlist.data.name;
        } else if (Array.isArray(playlist) && playlist[0]?.attributes?.name) {
            playlistName = playlist[0].attributes.name;
        } else if (Array.isArray(playlist) && playlist[0]?.name) {
            playlistName = playlist[0].name;
        }
        
        // If still no name found, log detailed structure for debugging
        if (!playlistName) {
            console.warn('⚠️ Could not find playlist name. Full structure:', JSON.stringify(playlist, null, 2));
            playlistName = 'My Playlist'; // Fallback
        }
        
        console.log('✅ Extracted playlist name:', playlistName);
        
        // Get artwork URL and format it properly - check multiple locations
        let playlistArtwork = '';
        
        // Try multiple locations for artwork
        if (playlist.attributes?.artwork?.url) {
            playlistArtwork = playlist.attributes.artwork.url;
        } else if (playlist.artwork?.url) {
            playlistArtwork = playlist.artwork.url;
        } else if (playlist.data?.attributes?.artwork?.url) {
            playlistArtwork = playlist.data.attributes.artwork.url;
        } else if (playlist.data?.artwork?.url) {
            playlistArtwork = playlist.data.artwork.url;
        } else if (Array.isArray(playlist) && playlist[0]?.attributes?.artwork?.url) {
            playlistArtwork = playlist[0].attributes.artwork.url;
        }
        
        // Format the artwork URL if found - handle Apple Music URL format
        if (playlistArtwork) {
            // Apple Music artwork URLs use placeholders like {w}, {h}, {f}
            // Replace them with actual values
            playlistArtwork = playlistArtwork
                .replace(/\{w\}/g, '300')
                .replace(/\{h\}/g, '300')
                .replace(/\{f\}/g, 'jpg')
                .replace(/\{c\}/g, 'bb')  // Sometimes {c} for crop
                .replace(/\{b\}/g, 'bb');  // Sometimes {b} for background
            console.log('✅ Found playlist artwork:', playlistArtwork);
        } else {
            console.log('⚠️ No playlist artwork found in playlist object');
        }
        
        // Fetch tracks to get count and artwork
        let trackCount = 0;
        try {
            const tracksData = await this.fetchPlaylistTracks();
            if (tracksData && tracksData.data && Array.isArray(tracksData.data)) {
                trackCount = tracksData.data.length;
                
                // If no playlist artwork, try to get from first track
                if (!playlistArtwork && tracksData.data.length > 0) {
                    const firstTrack = tracksData.data[0];
                    if (firstTrack.attributes?.artwork?.url) {
                        playlistArtwork = firstTrack.attributes.artwork.url
                            .replace(/\{w\}/g, '300')
                            .replace(/\{h\}/g, '300')
                            .replace(/\{f\}/g, 'jpg')
                            .replace(/\{c\}/g, 'bb')
                            .replace(/\{b\}/g, 'bb');
                        console.log('✅ Using first track artwork:', playlistArtwork);
                    } else if (firstTrack.artwork?.url) {
                        playlistArtwork = firstTrack.artwork.url
                            .replace(/\{w\}/g, '300')
                            .replace(/\{h\}/g, '300')
                            .replace(/\{f\}/g, 'jpg')
                            .replace(/\{c\}/g, 'bb')
                            .replace(/\{b\}/g, 'bb');
                        console.log('✅ Using first track artwork (alt path):', playlistArtwork);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching tracks for player:', error);
        }
        
        if (!playlistArtwork) {
            console.warn('⚠️ Could not find any artwork for playlist');
        }

        // Get track count from playlist attributes if available
        if (trackCount === 0) {
            trackCount = playlist.attributes?.trackCount || 0;
        }

        // Create playlist URL first (before using it in template strings)
        const playlistUrl = `https://music.apple.com/us/playlist/${this.playlistId}`;

        const safePlaylistName = this.escapeHtml(playlistName);

        // Create cover image HTML with error handling and play button overlay
        const coverImageHtml = playlistArtwork 
            ? `<a class="playlist-cover-container" href="${playlistUrl}" target="_blank" rel="noopener noreferrer" aria-label="Open ${safePlaylistName} on Apple Music">
                   <img class="playlist-cover-img" src="${playlistArtwork}" alt="${safePlaylistName}" loading="lazy">
                   <div class="playlist-cover-overlay">
                       <svg class="playlist-cover-play-icon" viewBox="0 0 24 24" fill="white">
                           <path d="M8 5v14l11-7z"/>
                       </svg>
                   </div>
                   <div class="playlist-cover-fallback">
                       <svg class="playlist-cover-icon" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                           <path d="M9 18V5l12-2v13"></path>
                           <circle cx="6" cy="18" r="3"></circle>
                           <circle cx="18" cy="16" r="3"></circle>
                       </svg>
                   </div>
               </a>`
            : `<a class="playlist-cover-container" href="${playlistUrl}" target="_blank" rel="noopener noreferrer" aria-label="Open playlist on Apple Music">
                   <svg class="playlist-cover-icon" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                       <path d="M9 18V5l12-2v13"></path>
                       <circle cx="6" cy="18" r="3"></circle>
                       <circle cx="18" cy="16" r="3"></circle>
                   </svg>
               </a>`;
        
        // Get playlist description if available
        const playlistDescription = playlist.attributes?.description?.standard || 
            playlist.attributes?.description?.short ||
            playlist.description ||
            null;
        const safeDescription = this.escapeHtml(
            (playlistDescription && playlistDescription.trim()) ||
            'Personal focus mix for coding, studying, and deep work.'
        );
        const songLabel = trackCount === 1 ? 'song' : 'songs';
        
        playerContainer.innerHTML = `
            <div class="custom-player">
                <div class="playlist-header${playlistDescription ? ' has-description' : ''}">
                    ${coverImageHtml}
                    <div class="playlist-meta">
                        <h3 class="playlist-name">${safePlaylistName}</h3>
                        <p class="playlist-count">${trackCount} ${songLabel}</p>
                        <p class="playlist-description">${safeDescription}</p>
                    </div>
                </div>
                <div class="playlist-footer">
                    <div class="playlist-footer-note">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 18V5l12-2v13"></path>
                            <circle cx="6" cy="18" r="3"></circle>
                            <circle cx="18" cy="16" r="3"></circle>
                        </svg>
                        <span>Music helps me focus and stay creative while working</span>
                    </div>
                </div>
            </div>
        `;
        
        // Add error handling for cover image
        if (playlistArtwork) {
            const coverImg = playerContainer.querySelector('.playlist-cover-img');
            const coverFallback = playerContainer.querySelector('.playlist-cover-fallback');
            if (coverImg && coverFallback) {
                coverImg.addEventListener('error', () => {
                    coverImg.style.display = 'none';
                    coverFallback.style.display = 'flex';
                });
            }
        }

        // Match heights after rendering (with multiple attempts to ensure accuracy)
        setTimeout(() => {
            this.matchHeights();
            // Try again after a short delay to account for any async rendering
            setTimeout(() => this.matchHeights(), 200);
        }, 100);
    }
    
    matchHeights() {
        const playerContainer = document.getElementById('apple-music-player');
        const tracksContainer = document.getElementById('tracks-container');
        
        if (!playerContainer || !tracksContainer) return;
        
        // Get the actual content heights
        const customPlayer = playerContainer.querySelector('.custom-player');
        if (customPlayer) {
            customPlayer.style.height = 'auto';
            customPlayer.style.minHeight = '0';
            tracksContainer.style.height = 'auto';
            tracksContainer.style.minHeight = '0';
        }
    }

    showPlaceholderPlayer() {
        const playerContainer = document.getElementById('apple-music-player');
        if (!playerContainer) {
            console.error('Player container not found');
            return;
        }

        console.log('Showing placeholder player');
        
        // Use CSS classes instead of inline styles for better theme support
        playerContainer.innerHTML = `
            <div class="custom-player custom-player-loading">
                <div class="playlist-header">
                    <div class="playlist-cover-container">
                        <svg class="playlist-cover-icon" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 18V5l12-2v13"></path>
                            <circle cx="6" cy="18" r="3"></circle>
                            <circle cx="18" cy="16" r="3"></circle>
                        </svg>
                    </div>
                    <div class="playlist-meta">
                        <h3 class="playlist-name">Ashwannamusic</h3>
                        <p class="playlist-count">Loading playlist...</p>
                        <p class="playlist-description">Syncing your latest tracks from Apple Music.</p>
                    </div>
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
                throw new Error(`Expected JSON but got ${contentType}. Response: ${text.substring(0, 200)}`);
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText.substring(0, 200)}`);
            }

            const data = await response.json();
            
            // Check for API errors in response
            if (data.error) {
                console.error('API returned error:', data.error);
                throw new Error(data.error);
            }
            
            // Debug: Log the data structure
            if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
                console.log('✅ Successfully fetched', data.data.length, 'tracks from API');
                console.log('First track sample:', {
                    id: data.data[0]?.id,
                    name: data.data[0]?.attributes?.name,
                    artist: data.data[0]?.attributes?.artistName,
                    duration: data.data[0]?.attributes?.durationInMillis,
                    hasArtwork: !!data.data[0]?.attributes?.artwork,
                    artworkUrl: data.data[0]?.attributes?.artwork?.url
                });
            } else {
                console.warn('⚠️ No tracks found in API response. Full response:', data);
                // If response has data but empty array, that's still valid
                if (!data.data || !Array.isArray(data.data)) {
                    throw new Error('Invalid API response format');
                }
            }
            
            return data;
        } catch (error) {
            console.error('Error fetching playlist tracks:', error);
            throw error;
        }
    }

    displayPlaylistTracks(playlistData) {
        const tracksContainer = document.getElementById('tracks-container');
        if (!tracksContainer || !playlistData.data || !playlistData.data.length) {
            this.showEmptyState();
            return;
        }

        tracksContainer.innerHTML = '';
        
        // Get random 3 tracks from the playlist
        const allTracks = [...playlistData.data];
        const shuffled = allTracks.sort(() => Math.random() - 0.5);
        let tracks = shuffled.slice(0, 3);
        
        tracks.forEach((item, index) => {
            if (!item || !item.attributes) {
                console.warn('Invalid track item at index', index);
                return;
            }
            
            const track = item.attributes;
            const trackCard = document.createElement('div');
            trackCard.className = 'track-card';
            
            // Format artwork URL properly - use smaller size for better performance
            let albumArt = '';
            if (track.artwork && track.artwork.url) {
                albumArt = track.artwork.url
                    .replace('{w}', '200')
                    .replace('{h}', '200')
                    .replace('{f}', 'jpg');
            }
            
            const trackName = this.escapeHtml(track.name || 'Unknown Track');
            const artist = this.escapeHtml(track.artistName || 'Unknown Artist');
            const appleMusicUrl = track.url || (track.albumId ? `https://music.apple.com/us/album/${track.albumId}` : '#');
            
            trackCard.setAttribute('role', 'link');
            trackCard.setAttribute('tabindex', '0');

            trackCard.innerHTML = `
                <div class="track-image">
                    <img src="${albumArt || 'images/fuji.jpg'}" alt="${trackName} cover" loading="lazy" onerror="this.src='images/fuji.jpg'">
                    <div class="track-play-overlay">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    </div>
                </div>
                <div class="track-info">
                    <h4 class="track-name">${trackName}</h4>
                    <p class="track-artist">${artist}</p>
                </div>
                <div class="track-link-indicator" aria-hidden="true">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M7 17L17 7"></path>
                        <path d="M9 7h8v8"></path>
                    </svg>
                </div>
            `;
            
            const openTrack = () => {
                window.open(appleMusicUrl, '_blank');
            };

            trackCard.addEventListener('click', openTrack);
            trackCard.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openTrack();
                }
            });
            
            tracksContainer.appendChild(trackCard);
        });
        
        // Match heights after rendering (with multiple attempts to ensure accuracy)
        setTimeout(() => {
            this.matchHeights();
            // Try again after a short delay to account for any async rendering
            setTimeout(() => this.matchHeights(), 200);
        }, 100);
    }

    showEmptyState(errorMessage = null) {
        const tracksContainer = document.getElementById('tracks-container');
        const playerContainer = document.getElementById('apple-music-player');
        
        if (!tracksContainer) return;

        // Show loading skeleton - don't show error messages, just keep loading
        tracksContainer.innerHTML = '';
        
        // Create 3 skeleton loading cards
        for (let i = 0; i < 3; i++) {
            const skeletonCard = document.createElement('div');
            skeletonCard.className = 'track-card';
            skeletonCard.style.opacity = '0.6';
            skeletonCard.innerHTML = `
                <div class="track-image" style="background: linear-gradient(90deg, var(--border-color) 25%, rgba(255,255,255,0.1) 50%, var(--border-color) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite;"></div>
                <div class="track-info" style="flex: 1;">
                    <div style="height: 20px; background: linear-gradient(90deg, var(--border-color) 25%, rgba(255,255,255,0.1) 50%, var(--border-color) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px; margin-bottom: 8px; width: 70%;"></div>
                    <div style="height: 16px; background: linear-gradient(90deg, var(--border-color) 25%, rgba(255,255,255,0.1) 50%, var(--border-color) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px; margin-bottom: 8px; width: 50%;"></div>
                    <div style="height: 14px; background: linear-gradient(90deg, var(--border-color) 25%, rgba(255,255,255,0.1) 50%, var(--border-color) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px; width: 40%;"></div>
                </div>
            `;
            tracksContainer.appendChild(skeletonCard);
        }
        
        // Also show placeholder player if needed
        if (playerContainer && !playerContainer.querySelector('.custom-player')) {
            this.showPlaceholderPlayer();
        }
        
        // Log error for debugging (but don't show to user)
        if (errorMessage && errorMessage !== 'Loading...') {
            console.error('Music section error:', errorMessage);
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
