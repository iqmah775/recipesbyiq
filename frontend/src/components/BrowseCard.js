import React, { useState } from 'react';

const DIFF_STYLES = {
  easy:   { background: 'rgba(42,157,143,0.2)',  color: '#2A9D8F' },
  medium: { background: 'rgba(244,166,35,0.2)',  color: '#F4A623' },
  hard:   { background: 'rgba(230,57,70,0.2)',   color: '#E63946' },
};

function HighlightText({ text, query }) {
  if (!query?.trim()) return <>{text}</>;
  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1
          ? <span key={i} style={{ color: '#F4A623', fontWeight: 600 }}>{part}</span>
          : part
      )}
    </>
  );
}

function BrowseCard({ recipe, searchQuery, isAI = false, onViewFull }) {
  const [hovered, setHovered] = useState(false);
  const diffStyle = DIFF_STYLES[recipe.difficulty?.toLowerCase()] || {
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.5)',
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#2A1F0E',
        border: hovered ? '1px solid #E76F51' : '1px solid #3D2E14',
        borderRadius: 16,
        padding: 20,
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Region + category tags / AI badge */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {isAI ? (
          <span style={{
            background: 'rgba(244,166,35,0.15)',
            color: '#F4A623',
            border: '1px solid rgba(244,166,35,0.3)',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 11,
            borderRadius: 20,
            padding: '3px 10px',
          }}>
            ✨ AI Generated
          </span>
        ) : (
          <>
            <span style={{
              background: 'rgba(244,166,35,0.15)',
              color: '#F4A623',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 11,
              borderRadius: 10,
              padding: '3px 10px',
              textTransform: 'capitalize',
            }}>
              {recipe.region?.replace(/_/g, ' ')}
            </span>
            <span style={{
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.5)',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 11,
              borderRadius: 10,
              padding: '3px 10px',
              textTransform: 'capitalize',
            }}>
              {recipe.category?.replace(/_/g, ' ')}
            </span>
          </>
        )}
      </div>

      {/* Name — with query highlighting */}
      <h4 style={{
        fontFamily: 'Poppins, sans-serif',
        fontWeight: 600,
        color: '#FFFFFF',
        fontSize: 17,
        marginTop: 12,
        lineHeight: 1.3,
      }}>
        <HighlightText text={recipe.name} query={searchQuery} />
      </h4>

      {/* Description — 2 lines max */}
      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontWeight: 400,
        color: 'rgba(255,255,255,0.5)',
        fontSize: 13,
        lineHeight: 1.6,
        marginTop: 8,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        flex: 1,
      }}>
        {recipe.description}
      </p>

      {/* Difficulty + time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
        <span style={{
          ...diffStyle,
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 11,
          borderRadius: 6,
          padding: '3px 8px',
          textTransform: 'capitalize',
        }}>
          {recipe.difficulty}
        </span>
        <span style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
          ⏱ {recipe.prep_time_minutes}m · {recipe.cook_time_minutes}m · Serves {recipe.servings}
        </span>
      </div>

      <button
        onClick={onViewFull}
        style={{
          width: '100%',
          background: '#E76F51',
          color: '#FFFFFF',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 14,
          borderRadius: 10,
          padding: 10,
          marginTop: 16,
          border: 'none',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
        onMouseOver={e => { e.currentTarget.style.background = '#F4A623'; }}
        onMouseOut={e => { e.currentTarget.style.background = '#E76F51'; }}
      >
        View Recipe →
      </button>
    </div>
  );
}

export default BrowseCard;
