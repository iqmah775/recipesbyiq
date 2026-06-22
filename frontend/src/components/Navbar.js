import React, { useState, useEffect } from 'react';

const NAV_LINKS = ['Home', 'Browse Recipes'];

function Navbar({ onGetStarted, onBrowse, onSavedClick, searchQuery, onSearchChange, darkMode, onToggleDarkMode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const closeMenu = (fn) => {
    setMenuOpen(false);
    fn();
  };

  const t = {
    navBg: darkMode ? 'rgba(28, 18, 8, 0.95)' : 'rgba(255, 248, 240, 0.95)',
    border: darkMode ? '#3D2E14' : '#E8D5B0',
    text: darkMode ? 'rgba(255,255,255,0.8)' : 'rgba(28,18,8,0.8)',
    subtleText: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(28,18,8,0.6)',
    searchBg: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(28,18,8,0.06)',
    searchColor: darkMode ? '#FFFFFF' : '#1C1208',
    dropdownBg: darkMode ? 'rgba(28, 18, 8, 0.97)' : 'rgba(255, 248, 240, 0.97)',
  };

// const toggleBtn = (
//     <button
//       onClick={onToggleDarkMode}
//       style={{
//         background: 'none',
//         border: 'none',
//         fontSize: 18,
//         cursor: 'pointer',
//         color: '#F4A623',
//         padding: '4px 6px',
//         lineHeight: 1,
//       }}
//       title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
//     >
//       {darkMode ? '🌙' : '☀️'}
//     </button>
//   );

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      background: t.navBg,
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      borderBottom: `1px solid ${t.border}`,
      padding: isMobile ? '16px 20px' : '16px 48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      transition: 'background 0.3s, border-color 0.3s',
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

      {/* Desktop: nav links + search */}
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
                color: t.text,
                fontSize: 15,
                cursor: 'pointer',
                padding: 0,
                whiteSpace: 'nowrap',
                transition: 'color 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.color = '#F4A623'; }}
              onMouseOut={e => { e.currentTarget.style.color = t.text; }}
            >
              {link}
            </button>
          ))}

          <div style={{ width: 1, height: 18, background: t.border, flexShrink: 0 }} />

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
              onKeyDown={e => { if (e.key === 'Enter') onBrowse(); }}
              placeholder="Search recipes..."
              style={{
                background: t.searchBg,
                border: `1px solid ${t.border}`,
                borderRadius: 20,
                padding: '8px 16px 8px 34px',
                color: t.searchColor,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 14,
                width: 240,
                transition: 'border-color 0.2s',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#F4A623'; e.currentTarget.style.outline = 'none'; }}
              onBlur={e => { e.currentTarget.style.borderColor = t.border; }}
            />
          </div>
        </div>
      )}

      {/* Desktop: theme toggle + Saved + Get Started */}
      {!isMobile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          

          <button
            onClick={onSavedClick}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              color: t.subtleText,
              fontSize: 15,
              cursor: 'pointer',
              padding: 0,
              whiteSpace: 'nowrap',
              transition: 'color 0.2s',
            }}
            onMouseOver={e => { e.currentTarget.style.color = '#F4A623'; }}
            onMouseOut={e => { e.currentTarget.style.color = t.subtleText; }}
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

      {/* Mobile: hamburger */}
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
          background: t.dropdownBg,
          borderBottom: `1px solid ${t.border}`,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          padding: '16px 20px',
          gap: 4,
        }}>
          {/* Search input */}
          <div style={{ position: 'relative', marginBottom: 4 }}>
            <span style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 14,
              pointerEvents: 'none',
              lineHeight: 1,
            }}>
              🔍
            </span>
            <input
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') closeMenu(onBrowse); }}
              placeholder="Search recipes..."
              style={{
                width: '100%',
                background: t.searchBg,
                border: `1px solid ${t.border}`,
                borderRadius: 20,
                padding: '10px 16px 10px 36px',
                color: t.searchColor,
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                fontSize: 15,
                boxSizing: 'border-box',
                outline: 'none',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#F4A623'; }}
              onBlur={e => { e.currentTarget.style.borderColor = t.border; }}
            />
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: t.border, margin: '8px 0' }} />

          {/* Home */}
          <button
            onClick={() => closeMenu(onGetStarted)}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              color: t.text,
              fontSize: 16,
              cursor: 'pointer',
              padding: '12px 4px',
              textAlign: 'left',
              borderRadius: 8,
            }}
          >
            Home
          </button>

          {/* Browse Recipes */}
          <button
            onClick={() => closeMenu(onBrowse)}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              color: t.text,
              fontSize: 16,
              cursor: 'pointer',
              padding: '12px 4px',
              textAlign: 'left',
              borderRadius: 8,
            }}
            onMouseOver={e => { e.currentTarget.style.color = '#F4A623'; e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(28,18,8,0.04)'; }}
            onMouseOut={e => { e.currentTarget.style.color = t.text; e.currentTarget.style.background = 'none'; }}
          >
            Browse Recipes
          </button>

          {/* Saved */}
          <button
            onClick={() => closeMenu(onSavedClick)}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              color: t.text,
              fontSize: 16,
              cursor: 'pointer',
              padding: '12px 4px',
              textAlign: 'left',
              borderRadius: 8,
            }}
            onMouseOver={e => { e.currentTarget.style.color = '#F4A623'; e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(28,18,8,0.04)'; }}
            onMouseOut={e => { e.currentTarget.style.color = t.text; e.currentTarget.style.background = 'none'; }}
          >
            🔖 Saved
          </button>


          <div style={{ height: 1, background: t.border, margin: '4px 0 8px' }} />

          {/* Get Started */}
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
      )}
    </nav>
  );
}

export default Navbar;
