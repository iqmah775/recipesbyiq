import React from 'react';

function Footer() {
  return (
    <footer style={{ background: '#120D05', padding: '48px 24px', textAlign: 'center' }}>
      <div style={{
        fontFamily: 'Poppins, sans-serif',
        fontWeight: 700,
        color: '#F4A623',
        fontSize: 20,
      }}>
        🍳 RecipesByIQ
      </div>
      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontWeight: 400,
        color: 'rgba(255,255,255,0.4)',
        fontSize: 14,
        marginTop: 8,
      }}>
        Discover authentic Nigerian recipes
      </p>
      <div style={{
        height: 1,
        background: '#3D2E14',
        margin: '24px auto',
        maxWidth: 200,
      }} />
      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontWeight: 400,
        color: 'rgba(255,255,255,0.25)',
        fontSize: 12,
      }}>
        Built with ❤️ for Nigerian food lovers
      </p>
    </footer>
  );
}

export default Footer;
