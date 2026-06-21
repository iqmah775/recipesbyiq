import React from 'react';

function SocialLink({ href, children }) {
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
        color: 'rgba(255,255,255,0.5)',
        textDecoration: 'none',
        transition: 'color 0.2s',
      }}
      onMouseOver={e => { e.currentTarget.style.color = '#F4A623'; }}
      onMouseOut={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
    >
      {children}
    </a>
  );
}

function Footer() {
  return (
    <footer style={{ background: '#120D05', padding: '48px 24px', textAlign: 'center' }}>
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
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
        marginTop: 8,
      }}>
        Cook smarter with what you have
      </p>

      <div style={{
        height: 1,
        background: '#3D2E14',
        margin: '24px auto',
        maxWidth: 300,
      }} />

      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        color: 'rgba(255,255,255,0.5)',
        fontSize: 13,
        marginBottom: 16,
      }}>
        Founded by Iqmah
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        <SocialLink href="mailto:iqmahoseni@gmail.com">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
          iqmahoseni@gmail.com
        </SocialLink>

        <SocialLink href="https://instagram.com/iqmahosenii">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
          </svg>
          @iqmahosenii
        </SocialLink>

        <SocialLink href="https://tiktok.com/@iqmahoseni">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.22 8.22 0 0 0 4.81 1.54V6.78a4.85 4.85 0 0 1-1.04-.09z" />
          </svg>
          @iqmahoseni
        </SocialLink>
      </div>

      <div style={{
        height: 1,
        background: '#3D2E14',
        margin: '24px auto',
        maxWidth: 300,
      }} />

      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontWeight: 400,
        color: 'rgba(255,255,255,0.2)',
        fontSize: 12,
      }}>
        Built with ❤️ for Nigerian food lovers
      </p>
    </footer>
  );
}

export default Footer;
