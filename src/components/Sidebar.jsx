import React from 'react';
import { Home, Search, Library, PlusSquare, Heart } from 'lucide-react';
import logoImg from '../assets/logo.png';
import { PLAYLISTS } from '../data/songs';

export default function Sidebar({ activeNav, setActiveNav, likedCount }) {
  return (
    <aside className="sidebar">
      {/* Brand Header featuring User's Uploaded Custom Logo */}
      <div className="brand-logo-container" onClick={() => setActiveNav('home')} style={{ cursor: 'pointer' }}>
        <img 
          src={logoImg} 
          alt="Custom Music Logo" 
          className="custom-logo-img" 
        />
        <span className="brand-title">Spotify Pro</span>
      </div>

      {/* Main Navigation */}
      <nav className="nav-group">
        <button 
          className={`nav-item ${activeNav === 'home' ? 'active' : ''}`}
          onClick={() => setActiveNav('home')}
        >
          <Home size={22} />
          <span>Home</span>
        </button>
        <button 
          className={`nav-item ${activeNav === 'search' ? 'active' : ''}`}
          onClick={() => setActiveNav('search')}
        >
          <Search size={22} />
          <span>Search</span>
        </button>
        <button 
          className={`nav-item ${activeNav === 'library' ? 'active' : ''}`}
          onClick={() => setActiveNav('library')}
        >
          <Library size={22} />
          <span>Your Library</span>
        </button>
      </nav>

      <div className="sidebar-divider" />

      {/* Quick Action Navigation */}
      <nav className="nav-group">
        <button 
          className={`nav-item ${activeNav === 'create' ? 'active' : ''}`}
          onClick={() => setActiveNav('create')}
        >
          <PlusSquare size={22} />
          <span>Create Playlist</span>
        </button>
        <button 
          className={`nav-item ${activeNav === 'liked' ? 'active' : ''}`}
          onClick={() => setActiveNav('liked')}
        >
          <Heart size={22} style={{ color: 'var(--accent-green)' }} />
          <span>Liked Songs</span>
          {likedCount > 0 && (
            <span style={{ 
              marginLeft: 'auto', 
              fontSize: '0.75rem', 
              background: 'var(--accent-green-alpha)', 
              color: 'var(--accent-green)', 
              padding: '2px 8px', 
              borderRadius: '99px' 
            }}>
              {likedCount}
            </span>
          )}
        </button>
      </nav>

      <div className="sidebar-divider" />

      {/* Playlists List */}
      <div className="playlists-header">
        <span className="playlists-title">Playlists</span>
        <button className="create-pl-btn" title="New Playlist">
          <PlusSquare size={16} />
        </button>
      </div>

      <div className="playlists-list">
        {PLAYLISTS.map((pl) => (
          <div key={pl.id} className="playlist-item">
            <img src={pl.cover} alt={pl.name} className="playlist-thumb" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 600 }}>{pl.name}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{pl.tracksCount} songs</span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
