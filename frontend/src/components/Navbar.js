import React from 'react';

const NAV_LINKS = ['Home', 'Browse Recipes'];

function Navbar({ onGetStarted, onBrowse, onSavedClick, searchQuery, onSearchChange }) {
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') onBrowse();
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      background: 'rgba(28, 18, 8, 0.95)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderBottom: '1px solid #3D2E14',
      padding: '16px 48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 22 }}>🍳</span>
        <span style={{
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 700,
          color: '#F4A623',
          fontSize: 22,
          letterSpacing: '-0.3px',
        }}>
          RecipesByIQ
        </span>
      </div>

      {/* Center: nav links + search input */}
      <div className="nav-links" style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
        {NAV_LINKS.map(link => (
          <button
            key={link}
            onClick={link === 'Home' ? onGetStarted : onBrowse}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.8)',
              fontSize: 15,
              cursor: 'pointer',
              padding: 0,
              whiteSpace: 'nowrap',
            }}
            onMouseOver={e => { e.currentTarget.style.color = '#F4A623'; }}
            onMouseOut={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
          >
            {link}
          </button>
        ))}

        {/* Divider */}
        <div style={{ width: 1, height: 18, background: '#3D2E14', flexShrink: 0 }} />

        {/* Search input */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <span style={{
            position: 'absolute',
            left: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 13,
            pointerEvents: 'none',
            userSelect: 'none',
            lineHeight: 1,
          }}>
            🔍
          </span>
          <input
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search recipes..."
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid #3D2E14',
              borderRadius: 20,
              padding: '8px 16px 8px 34px',
              color: '#FFFFFF',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontSize: 14,
              width: 240,
              transition: 'border-color 0.2s',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = '#F4A623'; e.currentTarget.style.outline = 'none'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#3D2E14'; }}
          />
        </div>
      </div>

      {/* Saved Recipes link */}
      <button
        onClick={onSavedClick}
        style={{
          background: 'none',
          border: 'none',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          color: 'rgba(255,255,255,0.7)',
          fontSize: 15,
          cursor: 'pointer',
          padding: 0,
          whiteSpace: 'nowrap',
        }}
        onMouseOver={e => { e.currentTarget.style.color = '#F4A623'; }}
        onMouseOut={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
      >
        🔖 Saved
      </button>

      {/* Get Started button */}
      <button
        onClick={onGetStarted}
        style={{
          background: '#E76F51',
          color: '#FFFFFF',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 14,
          borderRadius: 8,
          padding: '8px 20px',
          border: 'none',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
        onMouseOver={e => { e.currentTarget.style.background = '#F4A623'; }}
        onMouseOut={e => { e.currentTarget.style.background = '#E76F51'; }}
      >
        Get Started
      </button>
    </nav>
  );
}

export default Navbar;
