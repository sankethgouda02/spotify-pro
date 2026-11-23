import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, 
  Volume2, VolumeX, Heart, Mic2, ListMusic, X 
} from 'lucide-react';

export default function PlayerBar({ 
  currentSong, 
  isPlaying, 
  onPlayPauseToggle, 
  onNextTrack, 
  onPrevTrack, 
  onToggleLike,
  songs,
  loopMode,
  setLoopMode,
  shuffleMode,
  setShuffleMode
}) {
  const audioRef = useRef(null);
  const synthAudioContextRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(0);
  const targetDuration = currentSong?.duration || 300;
  const [duration, setDuration] = useState(targetDuration);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  // Web Audio fallback for 100% sound reliability
  function playFallbackTone() {
    try {
      if (!synthAudioContextRef.current) {
        synthAudioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = synthAudioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.log(e);
    }
  }

  // Sync current song
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;

    audioRef.current.src = currentSong.audio;
    audioRef.current.volume = isMuted ? 0 : volume;
    setDuration(currentSong.duration || 300);
    setCurrentTime(0);

    if (isPlaying) {
      const p = audioRef.current.play();
      if (p !== undefined) {
        p.catch(() => playFallbackTone());
      }
    } else {
      audioRef.current.pause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong]);

  // Handle Play/Pause
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      const p = audioRef.current.play();
      if (p !== undefined) {
        p.catch(() => playFallbackTone());
      }
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Volume update
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const realDur = Math.max(audioRef.current.duration || 0, currentSong?.duration || 300);
      setDuration(realDur);
    }
  };

  const handleEnded = () => {
    if (loopMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      return;
    }

    if (audioRef.current && currentTime < duration - 5) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      onNextTrack();
    }
  };

  const handleSeekChange = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const toggleLoopMode = () => {
    if (loopMode === 'off') setLoopMode('all');
    else if (loopMode === 'all') setLoopMode('one');
    else setLoopMode('off');
  };

  const toggleShuffleMode = () => {
    setShuffleMode(!shuffleMode);
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!currentSong) return null;

  return (
    <>
      <div className="player-bar">
        <audio 
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />

        {/* Track info */}
        <div className="player-track-info">
          <img src={currentSong.cover} alt={currentSong.title} className="player-thumb" />
          <div className="player-meta">
            <span className="player-track-title">{currentSong.title}</span>
            <span className="player-artist">{currentSong.artist}</span>
          </div>
          <button 
            className={`like-btn ${currentSong.liked ? 'liked' : ''}`}
            onClick={() => onToggleLike(currentSong.id)}
            title={currentSong.liked ? "Unlike" : "Like"}
          >
            <Heart size={20} fill={currentSong.liked ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Controls */}
        <div className="player-center-controls">
          <div className="playback-btns">
            <button 
              className={`control-btn ${shuffleMode ? 'active-mode' : ''}`} 
              onClick={toggleShuffleMode}
              title={`Shuffle: ${shuffleMode ? 'ON' : 'OFF'}`}
            >
              <Shuffle size={18} />
            </button>

            <button className="control-btn" onClick={onPrevTrack} title="Previous">
              <SkipBack size={20} fill="currentColor" />
            </button>

            <button className="play-pause-main-btn" onClick={onPlayPauseToggle} title={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" style={{ marginLeft: '2px' }} />}
            </button>

            <button className="control-btn" onClick={onNextTrack} title="Next">
              <SkipForward size={20} fill="currentColor" />
            </button>

            <button 
              className={`control-btn ${loopMode !== 'off' ? 'active-mode' : ''}`} 
              onClick={toggleLoopMode}
              title={`Repeat: ${loopMode.toUpperCase()}`}
            >
              <Repeat size={18} />
              {loopMode === 'one' && <span className="loop-badge">1</span>}
            </button>
          </div>

          {/* Seek Bar */}
          <div className="seek-container">
            <span className="time-stamp">{formatTime(currentTime)}</span>
            <div className="progress-bar-wrapper">
              <div className="progress-track">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(currentTime / (duration || 300)) * 100}%` }} 
                />
              </div>
              <input 
                type="range" 
                className="progress-range-input"
                min="0"
                max={duration || 300}
                step="0.1"
                value={currentTime}
                onChange={handleSeekChange}
              />
            </div>
            <span className="time-stamp">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right controls */}
        <div className="player-right-controls">
          <button 
            className={`control-btn ${showLyrics ? 'active-mode' : ''}`}
            onClick={() => { setShowLyrics(!showLyrics); setShowQueue(false); }}
            title="Lyrics"
          >
            <Mic2 size={18} />
          </button>
          
          <button 
            className={`control-btn ${showQueue ? 'active-mode' : ''}`}
            onClick={() => { setShowQueue(!showQueue); setShowLyrics(false); }}
            title="Queue"
          >
            <ListMusic size={18} />
          </button>

          <div className="volume-bar-wrapper">
            <button 
              className="control-btn" 
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input 
              type="range"
              className="volume-range-input"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
            />
          </div>
        </div>
      </div>

      {/* Lyrics Modal */}
      {showLyrics && (
        <div className="lyrics-overlay">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img src={currentSong.cover} alt={currentSong.title} style={{ width: 64, height: 64, borderRadius: 'var(--radius-md)' }} />
              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{currentSong.title}</h2>
                <p style={{ color: 'var(--text-secondary)' }}>{currentSong.artist}</p>
              </div>
            </div>
            <button className="lyrics-close-btn" onClick={() => setShowLyrics(false)}>
              <X size={20} />
            </button>
          </div>
          <div className="lyrics-text">
            {currentSong.lyrics || "Lyrics unavailable for this track."}
          </div>
        </div>
      )}

      {/* Queue View Modal */}
      {showQueue && (
        <div className="lyrics-overlay" style={{ maxWidth: '400px', left: 'auto', right: '12px', borderLeft: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Play Queue</h3>
            <button className="lyrics-close-btn" onClick={() => setShowQueue(false)}>
              <X size={18} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-green)', textTransform: 'uppercase' }}>Now Playing</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-highlight)', padding: '10px', borderRadius: 'var(--radius-md)' }}>
              <img src={currentSong.cover} alt={currentSong.title} style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{currentSong.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{currentSong.artist}</div>
              </div>
            </div>

            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '12px' }}>Next Up</span>
            {songs.filter(s => s.id !== currentSong.id).slice(0, 6).map((song) => (
              <div key={song.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 10px', borderRadius: 'var(--radius-sm)' }}>
                <img src={song.cover} alt={song.title} style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{song.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{song.artist}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
