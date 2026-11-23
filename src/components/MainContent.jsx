import React from 'react';
import { Play, Pause, Heart, Clock, Music, Flame, Sparkles } from 'lucide-react';

export default function MainContent({ 
  activeNav, 
  songs, 
  currentSong, 
  isPlaying, 
  onPlaySong, 
  onToggleLike, 
  searchQuery
}) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const filteredSongs = searchQuery.trim() 
    ? songs.filter(s => 
        s.title.toLowerCase().startsWith(searchQuery.toLowerCase().trim()) ||
        s.artist.toLowerCase().startsWith(searchQuery.toLowerCase().trim()) ||
        s.genre.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
    : songs;

  const likedSongsList = songs.filter(s => s.liked);

  return (
    <main className="main-workspace">
      <div className="content-scrollable">
        
        {/* NAV: HOME */}
        {activeNav === 'home' && !searchQuery.trim() && (
          <>
            {/* Featured Hero Banner */}
            <div className="hero-banner">
              <img src={songs[0]?.cover} alt={songs[0]?.title} className="hero-cover" />
              <div className="hero-info">
                <span className="hero-badge">Featured Track of the Day</span>
                <h1 className="hero-title">{songs[0]?.title}</h1>
                <p className="hero-sub">{songs[0]?.artist} • {songs[0]?.album} • {songs[0]?.genre}</p>
                <button 
                  className="hero-play-btn"
                  onClick={() => onPlaySong(songs[0])}
                >
                  {isPlaying && currentSong?.id === songs[0]?.id ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
                  <span>{isPlaying && currentSong?.id === songs[0]?.id ? 'PAUSE' : 'PLAY NOW'}</span>
                </button>
              </div>
            </div>

            {/* Trending Hits Section */}
            <section style={{ marginBottom: '36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Flame style={{ color: 'var(--accent-green)' }} size={24} />
                <h2 className="section-title" style={{ margin: 0 }}>Trending Hits</h2>
              </div>
              <div className="songs-grid">
                {songs.map((song) => {
                  const isCurrent = currentSong?.id === song.id;
                  const activePlaying = isCurrent && isPlaying;

                  return (
                    <div 
                      key={song.id} 
                      className={`song-card ${activePlaying ? 'playing' : ''}`}
                      onClick={() => onPlaySong(song)}
                    >
                      <div className="card-img-wrapper">
                        <img src={song.cover} alt={song.title} className="card-img" />
                        <button className="card-play-btn" title="Play">
                          {activePlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
                        </button>
                      </div>
                      <div className="song-card-title">{song.title}</div>
                      <div className="song-card-artist">{song.artist}</div>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {/* NAV: SEARCH / FILTERED RESULTS */}
        {(activeNav === 'search' || searchQuery.trim()) && (
          <section style={{ paddingTop: '20px' }}>
            <h2 className="section-title">
              {searchQuery.trim() ? `Search Results for "${searchQuery}"` : 'Browse All Songs'}
            </h2>

            {filteredSongs.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Music size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <h3>No songs found starting with "{searchQuery}"</h3>
                <p>Try searching for letters like 'B', 'S', 'A', 'C', or 'L'.</p>
              </div>
            ) : (
              <table className="tracks-list-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>#</th>
                    <th>Title</th>
                    <th>Album</th>
                    <th>Genre</th>
                    <th style={{ width: '80px' }}><Clock size={16} /></th>
                    <th style={{ width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSongs.map((song, idx) => {
                    const isCurrent = currentSong?.id === song.id;
                    const activePlaying = isCurrent && isPlaying;

                    return (
                      <tr 
                        key={song.id} 
                        className={`track-row ${activePlaying ? 'playing' : ''}`}
                        onClick={() => onPlaySong(song)}
                      >
                        <td>
                          {activePlaying ? (
                            <Sparkles size={16} style={{ color: 'var(--accent-green)' }} />
                          ) : (
                            idx + 1
                          )}
                        </td>
                        <td>
                          <div className="track-info-cell">
                            <img src={song.cover} alt={song.title} className="track-row-img" />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: 700 }}>{song.title}</span>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{song.artist}</span>
                            </div>
                          </div>
                        </td>
                        <td>{song.album}</td>
                        <td>{song.genre}</td>
                        <td>{formatTime(song.duration)}</td>
                        <td onClick={(e) => { e.stopPropagation(); onToggleLike(song.id); }}>
                          <Heart 
                            size={18} 
                            style={{ 
                              color: song.liked ? 'var(--accent-green)' : 'var(--text-muted)',
                              fill: song.liked ? 'var(--accent-green)' : 'none'
                            }} 
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </section>
        )}

        {/* NAV: LIKED SONGS */}
        {activeNav === 'liked' && !searchQuery.trim() && (
          <section style={{ paddingTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, #450af5, #c4efd9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Heart size={48} fill="#ffffff" color="#ffffff" />
              </div>
              <div>
                <span className="hero-badge">Playlist</span>
                <h1 className="hero-title">Liked Songs</h1>
                <p className="hero-sub">{likedSongsList.length} songs favorited</p>
              </div>
            </div>

            {likedSongsList.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p>No liked songs yet! Click the heart icon on any song to save it here.</p>
              </div>
            ) : (
              <table className="tracks-list-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }}>#</th>
                    <th>Title</th>
                    <th>Album</th>
                    <th>Genre</th>
                    <th style={{ width: '80px' }}><Clock size={16} /></th>
                  </tr>
                </thead>
                <tbody>
                  {likedSongsList.map((song, idx) => (
                    <tr 
                      key={song.id} 
                      className={`track-row ${currentSong?.id === song.id && isPlaying ? 'playing' : ''}`}
                      onClick={() => onPlaySong(song)}
                    >
                      <td>{idx + 1}</td>
                      <td>
                        <div className="track-info-cell">
                          <img src={song.cover} alt={song.title} className="track-row-img" />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 700 }}>{song.title}</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{song.artist}</span>
                          </div>
                        </div>
                      </td>
                      <td>{song.album}</td>
                      <td>{song.genre}</td>
                      <td>{formatTime(song.duration)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}

      </div>
    </main>
  );
}
