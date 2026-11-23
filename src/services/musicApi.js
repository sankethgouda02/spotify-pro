// Service to fetch real music metadata & full-length streamable audio from Audius & iTunes APIs
export async function searchGlobalSongs(query) {
  if (!query || query.trim().length === 0) return [];
  
  const trimmed = query.trim();

  try {
    // 1. Fetch from Audius API (Provides 100% FULL LENGTH 3-5 minute complete audio tracks!)
    const audiusResponse = await fetch(
      `https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(trimmed)}&limit=15`
    );
    
    let audiusSongs = [];
    if (audiusResponse.ok) {
      const audiusData = await audiusResponse.json();
      audiusSongs = (audiusData.data || []).map(track => ({
        id: `audius-${track.id}`,
        title: track.title,
        artist: track.user?.name || "Global Artist",
        album: "Audius Global Hits",
        duration: track.duration || 210,
        cover: track.artwork?.['480x480'] || track.artwork?.['150x150'] || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80",
        audio: `https://discoveryprovider.audius.co/v1/tracks/${track.id}/stream`,
        genre: track.genre || "Pop / Dance",
        liked: false,
        lyrics: `[00:00.00] Now playing full song ${track.title} by ${track.user?.name || 'Artist'}\n[00:15.00] Enjoy full uninterrupted audio playback on Spotify Pro!`
      }));
    }

    // 2. Fetch from iTunes API
    const itunesResponse = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(trimmed)}&entity=song&limit=15`
    );
    let itunesSongs = [];
    if (itunesResponse.ok) {
      const itunesData = await itunesResponse.json();
      itunesSongs = (itunesData.results || []).map(item => ({
        id: `itunes-${item.trackId}`,
        title: item.trackName,
        artist: item.artistName,
        album: item.collectionName || item.trackName,
        duration: Math.floor(item.trackTimeMillis / 1000) || 180,
        cover: item.artworkUrl100 ? item.artworkUrl100.replace('100x100bb', '600x600bb') : item.artworkUrl60,
        audio: item.previewUrl || "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3",
        genre: item.primaryGenreName || "Pop",
        liked: false,
        lyrics: `[00:00.00] Now playing ${item.trackName} by ${item.artistName}\n[00:15.00] Spotify Pro Full Music Experience.`
      }));
    }

    // Merge Audius (full length) + iTunes
    return [...audiusSongs, ...itunesSongs];
  } catch (error) {
    console.error("Global music search API error:", error);
    return [];
  }
}
