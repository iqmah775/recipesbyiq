import React from 'react';

function SocialLink({ href, children, darkMode }) {
  const color = darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(28,18,8,0.5)';
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        fontSize: 14,
        color,
        textDecoration: 'none',
        transition: 'color 0.2s',
      }}
      onMouseOver={e => { e.currentTarget.style.color = '#F4A623'; }}
      onMouseOut={e => { e.currentTarget.style.color = color; }}
    >
      {children}
    </a>
  );
}

function Footer({ darkMode }) {
  const t = {
    bg: darkMode ? '#120D05' : '#FFF0E0',
    subtext: darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(28,18,8,0.5)',
    border: darkMode ? '#3D2E14' : '#E8D5B0',
    founder: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(28,18,8,0.6)',
    copyright: darkMode ? 'rgba(255,255,255,0.2)' : 'rgba(28,18,8,0.3)',
  };

  return (
    <footer style={{ background: t.bg, padding: '48px 24px', textAlign: 'center', transition: 'background 0.3s' }}>
      <div style={{
        fontFamily: 'Poppins, sans-serif',
        fontWeight: 700,
        color: '#F4A623',
        fontSize: 20,
      }}>
        🍳 IngredIQ
      </div>

      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontWeight: 400,
        color: t.subtext,
        fontSize: 14,
        marginTop: 8,
        transition: 'color 0.3s',
      }}>
        Cook smarter with what you have
      </p>

      <div style={{
        height: 1,
        background: t.border,
        margin: '24px auto',
        maxWidth: 300,
        transition: 'background 0.3s',
      }} />

      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        color: t.founder,
        fontSize: 13,
        marginBottom: 16,
        transition: 'color 0.3s',
      }}>
        Founded by Iqmah
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <SocialLink href="mailto:iqmahoseni@gmail.com" darkMode={darkMode}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          iqmahoseni@gmail.com
        </SocialLink>

        <SocialLink href="https://instagram.com/iqmahosenii" darkMode={darkMode}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
          </svg>
          @iqmahosenii
        </SocialLink>

        <SocialLink href="https://tiktok.com/@iqmahoseni" darkMode={darkMode}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.22 8.22 0 0 0 4.81 1.54V6.78a4.85 4.85 0 0 1-1.04-.09z" />
          </svg>
          @iqmahoseni
        </SocialLink>
      </div>

      <div style={{
        height: 1,
        background: t.border,
        margin: '24px auto',
        maxWidth: 300,
        transition: 'background 0.3s',
      }} />

      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontWeight: 400,
        color: t.copyright,
        fontSize: 12,
        transition: 'color 0.3s',
      }}>
        Built with ❤️ for Nigerian food lovers
      </p>
    </footer>
  );
}

export default Footer;
