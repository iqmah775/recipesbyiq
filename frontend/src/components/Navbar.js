import React, { useState, useEffect } from 'react';

const NAV_LINKS = ['Home', 'Browse Recipes'];

function Navbar({ onGetStarted, onBrowse, onSavedClick, searchQuery, onSearchChange }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') onBrowse();
  };

  const closeMenu = (fn) => {
    setMenuOpen(false);
    fn();
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
      padding: isMobile ? '16px 20px' : '16px 48px',
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
          IngredIQ
        </span>
      </div>

      {/* Desktop: nav links + search input */}
      {!isMobile && (
        <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
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
      )}

      {/* Desktop: Saved + Get Started */}
      {!isMobile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
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
        </div>
      )}

      {/* Mobile: hamburger button */}
      {isMobile && (
        <button
          onClick={() => setMenuOpen(v => !v)}
          style={{
            background: 'none',
            border: 'none',
            color: '#F4A623',
            fontSize: 24,
            cursor: 'pointer',
            padding: '4px 8px',
            lineHeight: 1,
          }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      )}

      {/* Mobile dropdown */}
      {isMobile && menuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'rgba(28, 18, 8, 0.97)',
          borderBottom: '1px solid #3D2E14',
          borderTop: '1px solid #3D2E14',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          padding: '8px 0 16px',
        }}>
          <button
            onClick={() => closeMenu(onGetStarted)}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.8)',
              fontSize: 16,
              cursor: 'pointer',
              padding: '14px 24px',
              textAlign: 'left',
            }}
            onMouseOver={e => { e.currentTarget.style.color = '#F4A623'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            onMouseOut={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.background = 'none'; }}
          >
            Home
          </button>

          <button
            onClick={() => closeMenu(onBrowse)}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.8)',
              fontSize: 16,
              cursor: 'pointer',
              padding: '14px 24px',
              textAlign: 'left',
            }}
            onMouseOver={e => { e.currentTarget.style.color = '#F4A623'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            onMouseOut={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.background = 'none'; }}
          >
            Browse Recipes
          </button>

          <button
            onClick={() => closeMenu(onSavedClick)}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.8)',
              fontSize: 16,
              cursor: 'pointer',
              padding: '14px 24px',
              textAlign: 'left',
            }}
            onMouseOver={e => { e.currentTarget.style.color = '#F4A623'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
            onMouseOut={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.background = 'none'; }}
          >
            🔖 Saved
          </button>

          <div style={{ borderTop: '1px solid #3D2E14', margin: '4px 24px 8px' }} />

          <div style={{ padding: '4px 24px 0' }}>
            <button
              onClick={() => closeMenu(onGetStarted)}
              style={{
                width: '100%',
                background: '#E76F51',
                color: '#FFFFFF',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 15,
                borderRadius: 8,
                padding: '12px 20px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.background = '#F4A623'; }}
              onMouseOut={e => { e.currentTarget.style.background = '#E76F51'; }}
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
