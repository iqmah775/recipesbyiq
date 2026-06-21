import React, { useState } from 'react';

const DIFF_STYLES = {
  easy:   { background: 'rgba(42,157,143,0.2)',  color: '#2A9D8F' },
  medium: { background: 'rgba(244,166,35,0.2)',  color: '#F4A623' },
  hard:   { background: 'rgba(230,57,70,0.2)',   color: '#E63946' },
};

function RecipeCard({ recipe, onSave, onSelect, savedRecipeNames }) {
  const [showInstructions, setShowInstructions] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hovered, setHovered] = useState(false);

  const isSaved = saved || (savedRecipeNames?.includes(recipe.name) ?? false);

  const diffStyle = DIFF_STYLES[recipe.difficulty?.toLowerCase()] || {
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.5)',
  };

  const handleSave = async () => {
    setSaving(true);
    const ok = await onSave(recipe);
    if (ok) setSaved(true);
    setSaving(false);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#2A1F0E',
        border: hovered ? '1px solid #E76F51' : '1px solid #3D2E14',
        borderRadius: 20,
        padding: 24,
        boxShadow: hovered ? '0 0 0 1px rgba(231,111,81,0.3)' : 'none',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Name + match % */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <h4
          onClick={onSelect}
          style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
            color: '#FFFFFF',
            fontSize: 19,
            flex: 1,
            lineHeight: 1.3,
            cursor: 'pointer',
          }}
          onMouseOver={e => { e.currentTarget.style.color = '#F4A623'; }}
          onMouseOut={e => { e.currentTarget.style.color = '#FFFFFF'; }}
        >
          {recipe.name}
        </h4>
        <span style={{
          background: 'rgba(244,166,35,0.15)',
          color: '#F4A623',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 12,
          borderRadius: 20,
          padding: '4px 10px',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          {recipe.match_percentage}%
        </span>
      </div>

      {/* Meta row */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginTop: 8 }}>
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
        <span style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
          ⏱ {recipe.prep_time_minutes}min prep
          {recipe.cook_time_minutes ? ` · ${recipe.cook_time_minutes}min cook` : ''}
        </span>
      </div>

      {/* Description */}
      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontWeight: 400,
        color: 'rgba(255,255,255,0.65)',
        fontSize: 14,
        lineHeight: 1.7,
        marginTop: 12,
      }}>
        {recipe.description}
      </p>

      {/* Dietary warning banner */}
      {recipe.dietary_warnings?.length > 0 && (
        <div style={{
          background: 'rgba(230,57,70,0.1)',
          border: '1px solid rgba(230,57,70,0.2)',
          borderRadius: 10,
          padding: '10px 14px',
          marginTop: 12,
        }}>
          <div style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            color: '#E63946',
            fontSize: 13,
          }}>
            ⚠️ {recipe.dietary_labels?.join(' · ')}
          </div>
          {recipe.dietary_flagged?.length > 0 && (
            <div style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              color: 'rgba(255,255,255,0.5)',
              fontSize: 12,
              marginTop: 4,
            }}>
              Contains: {recipe.dietary_flagged.join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Used ingredients */}
      {recipe.used_ingredients?.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <span style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
            Used:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
            {recipe.used_ingredients.map((ing, i) => (
              <span key={i} style={{
                background: 'rgba(42,157,143,0.1)',
                color: '#2A9D8F',
                border: '1px solid rgba(42,157,143,0.2)',
                borderRadius: 10,
                padding: '3px 8px',
                fontSize: 11,
                fontFamily: 'Inter, sans-serif',
              }}>
                {ing}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing ingredients */}
      {recipe.missing_ingredients?.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <span style={{ fontFamily: 'Inter, sans-serif', color: '#E63946', fontSize: 12 }}>
            Missing:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
            {recipe.missing_ingredients.map((ing, i) => (
              <span key={i} style={{
                background: 'rgba(230,57,70,0.1)',
                color: '#E63946',
                border: '1px solid rgba(230,57,70,0.2)',
                borderRadius: 10,
                padding: '3px 8px',
                fontSize: 11,
                fontFamily: 'Inter, sans-serif',
              }}>
                {ing}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* View Instructions toggle */}
      <button
        onClick={() => setShowInstructions(v => !v)}
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid #3D2E14',
          color: 'rgba(255,255,255,0.7)',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 14,
          borderRadius: 10,
          padding: 10,
          marginTop: 18,
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
        onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
      >
        {showInstructions ? '▲ Hide Instructions' : '▼ View Instructions'}
      </button>

      {showInstructions && (
        <div style={{ marginTop: 16 }}>
          {recipe.instructions?.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                color: '#F4A623',
                fontSize: 14,
                minWidth: 20,
                flexShrink: 0,
              }}>
                {i + 1}.
              </span>
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                color: 'rgba(255,255,255,0.75)',
                fontSize: 14,
                lineHeight: 1.8,
              }}>
                {step}
              </span>
            </div>
          ))}
          {recipe.tips && (
            <div style={{
              background: 'rgba(244,166,35,0.08)',
              borderLeft: '3px solid #F4A623',
              borderRadius: '0 8px 8px 0',
              padding: 12,
              marginTop: 12,
            }}>
              <span style={{
                fontFamily: 'Inter, sans-serif',
                color: 'rgba(255,255,255,0.6)',
                fontSize: 13,
                lineHeight: 1.6,
              }}>
                💡 {recipe.tips}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={isSaved || saving}
        style={{
          width: '100%',
          background: 'transparent',
          border: '1px solid #3D2E14',
          color: isSaved ? '#2A9D8F' : 'rgba(255,255,255,0.6)',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 14,
          borderRadius: 10,
          padding: 10,
          marginTop: 8,
          cursor: isSaved ? 'default' : 'pointer',
          transition: 'all 0.2s',
          borderColor: isSaved ? '#2A9D8F' : '#3D2E14',
        }}
        onMouseOver={e => {
          if (!isSaved && !saving) {
            e.currentTarget.style.borderColor = '#E76F51';
            e.currentTarget.style.color = '#E76F51';
          }
        }}
        onMouseOut={e => {
          if (!isSaved && !saving) {
            e.currentTarget.style.borderColor = '#3D2E14';
            e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
          }
        }}
      >
        {saving ? 'Saving…' : isSaved ? '✓ Saved' : 'Save Recipe'}
      </button>
    </div>
  );
}

export default RecipeCard;
