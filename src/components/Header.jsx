import React, { useState, useEffect, useRef } from 'react';
import { Search, Sun, Moon, ChevronLeft, ChevronRight, X, Music, Sparkles, Globe } from 'lucide-react';
import { searchGlobalSongs } from '../services/musicApi';

export default function Header({ 
  searchQuery, 
  setSearchQuery, 
  theme, 
  toggleTheme, 
  allSongs, 
  onSelectSong,
  setActiveNav,
  onAddGlobalSongs
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [prefixMatches, setPrefixMatches] = useState([]);
  const [apiMatches, setApiMatches] = useState([]);
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(false);
  
  const searchContainerRef = useRef(null);
  const activeReqIdRef = useRef(0);

  // Compute prefix matches & query global API smoothly
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setPrefixMatches([]);
      setApiMatches([]);
      setShowDropdown(false);
      setIsLoadingGlobal(false);
      return;
    }

    // 1. Instant local prefix match (songs starting with typed letters)
    const matches = allSongs.filter(song => 
      song.title.toLowerCase().startsWith(query.toLowerCase()) ||
      song.artist.toLowerCase().startsWith(query.toLowerCase())
    );
    setPrefixMatches(matches);
    setShowDropdown(true);

    // 2. Debounced API search for global catalog
    const reqId = ++activeReqIdRef.current;
    setIsLoadingGlobal(true);

    const timer = setTimeout(async () => {
      const results = await searchGlobalSongs(query);
      if (reqId === activeReqIdRef.current) {
        setApiMatches(results);
        setIsLoadingGlobal(false);
        if (results.length > 0 && onAddGlobalSongs) {
          onAddGlobalSongs(results);
        }
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery, allSongs]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleOutsideClick(e) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelectSong = (song) => {
    setSearchQuery(song.title);
    setShowDropdown(false);
    setActiveNav('search');
    if (onSelectSong) {
      onSelectSong(song);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    setPrefixMatches([]);
    setApiMatches([]);
    setShowDropdown(false);
  };

  const renderPrefixHighlight = (text, prefix) => {
    const p = prefix.trim().toLowerCase();
    if (text.toLowerCase().startsWith(p)) {
      const matched = text.slice(0, p.length);
      const rest = text.slice(p.length);
      return (
        <span>
          <strong style={{ color: 'var(--accent-green)' }}>{matched}</strong>
          {rest}
        </span>
      );
    }
    return text;
  };

  return (
    <header className="header-bar">
      {/* Navigation history buttons */}
      <div className="nav-history-btns">
        <button className="circle-nav-btn" title="Back">
          <ChevronLeft size={20} />
        </button>
        <button className="circle-nav-btn" title="Forward">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Glitch-free Search Bar */}
      <div className="search-container" ref={searchContainerRef}>
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input 
            type="text"
            className="search-input"
            placeholder="Type a letter ('B', 'S', 'A') or search any song in the world..."
            value={searchQuery}
            onFocus={() => {
              if (searchQuery.trim()) setShowDropdown(true);
              setActiveNav('search');
            }}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={handleClear} title="Clear search">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Clear Structured Autocomplete Dropdown */}
        {showDropdown && (
          <div className="suggestions-dropdown">
            
            {/* Section 1: Songs Starting With Typed Letter(s) */}
            {prefixMatches.length > 0 && (
              <div>
                <div className="dropdown-header">
                  <Sparkles size={12} style={{ color: 'var(--accent-green)', display: 'inline', marginRight: 6 }} />
                  Songs starting with "{searchQuery}" ({prefixMatches.length})
                </div>
                {prefixMatches.map((song) => (
                  <div 
                    key={song.id} 
                    className="suggestion-item"
                    onMouseDown={() => handleSelectSong(song)}
                  >
                    <img src={song.cover} alt={song.title} className="suggestion-thumb" />
                    <div className="suggestion-details">
                      <div className="suggestion-title">
                        {renderPrefixHighlight(song.title, searchQuery)}
                      </div>
                      <div className="suggestion-artist">
                        {renderPrefixHighlight(song.artist, searchQuery)} • {song.genre}
                      </div>
                    </div>
                    <Music size={16} style={{ color: 'var(--text-muted)' }} />
                  </div>
                ))}
              </div>
            )}

            {/* Section 2: Global Music Results */}
            <div>
              <div className="dropdown-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Global Music Catalog Results</span>
                {isLoadingGlobal && <span style={{ color: 'var(--accent-green)' }}>Loading...</span>}
              </div>
              {apiMatches.slice(0, 8).map((song) => (
                <div 
                  key={song.id} 
                  className="suggestion-item"
                  onMouseDown={() => handleSelectSong(song)}
                >
                  <img src={song.cover} alt={song.title} className="suggestion-thumb" />
                  <div className="suggestion-details">
                    <div className="suggestion-title">{song.title}</div>
                    <div className="suggestion-artist">{song.artist} • {song.album}</div>
                  </div>
                  <Globe size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
              ))}
            </div>

            {prefixMatches.length === 0 && apiMatches.length === 0 && !isLoadingGlobal && (
              <div style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                No matching songs found. Try typing another letter or song name!
              </div>
            )}

          </div>
        )}
      </div>

      {/* Header Actions: Dark/Light Mode & Profile */}
      <div className="header-actions">
        <button 
          className="theme-toggle-btn" 
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <>
              <Sun size={18} style={{ color: '#f59e0b' }} />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={18} style={{ color: '#6366f1' }} />
              <span>Dark Mode</span>
            </>
          )}
        </button>

        <div className="user-profile-badge">
          <img 
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" 
            alt="User Avatar" 
            className="avatar" 
          />
          <span>Viren</span>
        </div>
      </div>
    </header>
  );
}
