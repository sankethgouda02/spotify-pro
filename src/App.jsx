import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MainContent from './components/MainContent';
import PlayerBar from './components/PlayerBar';
import { INITIAL_SONGS } from './data/songs';

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('spotify_theme') || 'dark';
  });

  const [activeNav, setActiveNav] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState(INITIAL_SONGS);
  
  // Audio state
  const [currentSong, setCurrentSong] = useState(INITIAL_SONGS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Playback Modes
  const [loopMode, setLoopMode] = useState('off');
  const [shuffleMode, setShuffleMode] = useState(false);

  // Sync theme with DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('spotify_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleAddGlobalSongs = (newSongs) => {
    setSongs(prevSongs => {
      const existingIds = new Set(prevSongs.map(s => s.id));
      const filteredNew = newSongs.filter(s => !existingIds.has(s.id));
      return [...prevSongs, ...filteredNew];
    });
  };

  const handlePlaySong = (song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  const handlePlayPauseToggle = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNextTrack = () => {
    if (!songs.length) return;

    if (shuffleMode) {
      const availableSongs = songs.filter(s => s.id !== currentSong?.id);
      const randomIndex = Math.floor(Math.random() * availableSongs.length);
      const randomSong = availableSongs[randomIndex] || songs[0];
      setCurrentSong(randomSong);
      setIsPlaying(true);
      return;
    }

    const currentIndex = songs.findIndex(s => s.id === currentSong?.id);
    if (currentIndex < songs.length - 1) {
      setCurrentSong(songs[currentIndex + 1]);
      setIsPlaying(true);
    } else if (loopMode === 'all') {
      setCurrentSong(songs[0]);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  };

  const handlePrevTrack = () => {
    if (!songs.length) return;
    const currentIndex = songs.findIndex(s => s.id === currentSong?.id);
    if (currentIndex > 0) {
      setCurrentSong(songs[currentIndex - 1]);
      setIsPlaying(true);
    } else {
      setCurrentSong(songs[songs.length - 1]);
      setIsPlaying(true);
    }
  };

  const handleToggleLike = (songId) => {
    setSongs(prevSongs => 
      prevSongs.map(song => 
        song.id === songId ? { ...song, liked: !song.liked } : song
      )
    );
    if (currentSong?.id === songId) {
      setCurrentSong(prev => prev ? { ...prev, liked: !prev.liked } : prev);
    }
  };

  const likedCount = songs.filter(s => s.liked).length;

  return (
    <div className="app-container">
      <Sidebar 
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        likedCount={likedCount}
      />

      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          theme={theme}
          toggleTheme={toggleTheme}
          allSongs={songs}
          onSelectSong={handlePlaySong}
          setActiveNav={setActiveNav}
          onAddGlobalSongs={handleAddGlobalSongs}
        />

        <MainContent 
          activeNav={activeNav}
          songs={songs}
          currentSong={currentSong}
          isPlaying={isPlaying}
          onPlaySong={handlePlaySong}
          onToggleLike={handleToggleLike}
          searchQuery={searchQuery}
        />
      </div>

      <PlayerBar 
        currentSong={currentSong}
        isPlaying={isPlaying}
        onPlayPauseToggle={handlePlayPauseToggle}
        onNextTrack={handleNextTrack}
        onPrevTrack={handlePrevTrack}
        onToggleLike={handleToggleLike}
        songs={songs}
        loopMode={loopMode}
        setLoopMode={setLoopMode}
        shuffleMode={shuffleMode}
        setShuffleMode={setShuffleMode}
      />
    </div>
  );
}
