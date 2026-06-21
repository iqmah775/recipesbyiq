import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API = 'https://recipesbyiq.onrender.com/api/v1';

const DIFF_STYLES = {
  easy:   { background: 'rgba(42,157,143,0.2)',  color: '#2A9D8F' },
  medium: { background: 'rgba(244,166,35,0.2)',  color: '#F4A623' },
  hard:   { background: 'rgba(230,57,70,0.2)',   color: '#E63946' },
};

const SectionLabel = ({ children }) => (
  <div style={{
    fontFamily: 'Inter, sans-serif',
    fontWeight: 500,
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 28,
    marginBottom: 12,
  }}>
    {children}
  </div>
);

function RecipeModal({ recipe, onClose }) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const diffStyle = DIFF_STYLES[recipe.difficulty?.toLowerCase()] || {
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(255,255,255,0.5)',
  };

  useEffect(() => {
    setSaved(false);
    setSaveError('');
  }, [recipe]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      await axios.post(`${API}/recipes/save`, {
        recipe_name: recipe.name,
        recipe_data: {
          name: recipe.name,
          description: recipe.description,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          difficulty: recipe.difficulty,
          prep_time_minutes: recipe.prep_time_minutes,
          cook_time_minutes: recipe.cook_time_minutes,
          servings: recipe.servings,
          tips: recipe.tips,
          region: recipe.region,
          category: recipe.category,
        },
      });
      setSaved(true);
    } catch {
      setSaveError('Failed to save — try again');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#2A1F0E',
          border: '1px solid #3D2E14',
          borderRadius: 24,
          maxWidth: 680,
          width: '92%',
          maxHeight: '85vh',
          overflowY: 'auto',
          padding: 36,
          position: 'relative',
          animation: 'slideUp 0.25s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: 'rgba(255,255,255,0.08)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '50%',
            width: 36,
            height: 36,
            cursor: 'pointer',
            fontSize: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s',
          }}
          onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
          onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
        >
          ×
        </button>

        {/* Recipe name */}
        <h2 style={{
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 700,
          color: '#FFFFFF',
          fontSize: 26,
          paddingRight: 48,
          lineHeight: 1.3,
        }}>
          {recipe.name}
        </h2>

        {/* Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
          {recipe.region && (
            <span style={{
              background: 'rgba(244,166,35,0.15)',
              color: '#F4A623',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 12,
              borderRadius: 20,
              padding: '4px 12px',
              textTransform: 'capitalize',
            }}>
              {recipe.region.replace(/_/g, ' ')}
            </span>
          )}
          {recipe.category && (
            <span style={{
              background: 'rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.5)',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 12,
              borderRadius: 10,
              padding: '4px 10px',
              textTransform: 'capitalize',
            }}>
              {recipe.category.replace(/_/g, ' ')}
            </span>
          )}
          <span style={{
            ...diffStyle,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 12,
            borderRadius: 6,
            padding: '4px 10px',
            textTransform: 'capitalize',
          }}>
            {recipe.difficulty}
          </span>
        </div>

        {/* Times */}
        <p style={{
          fontFamily: 'Inter, sans-serif',
          color: 'rgba(255,255,255,0.4)',
          fontSize: 13,
          marginTop: 12,
        }}>
          ⏱ Prep: {recipe.prep_time_minutes}m · Cook: {recipe.cook_time_minutes}m · Serves {recipe.servings}
        </p>

        {/* Description */}
        <p style={{
          fontFamily: 'Inter, sans-serif',
          color: 'rgba(255,255,255,0.65)',
          fontSize: 15,
          lineHeight: 1.7,
          marginTop: 16,
        }}>
          {recipe.description}
        </p>

        {/* Ingredients */}
        {recipe.ingredients?.length > 0 && (
          <>
            <SectionLabel>Ingredients</SectionLabel>
            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
              {recipe.ingredients.map((ing, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                  <span style={{ color: '#F4A623', fontSize: 14, marginTop: 4, flexShrink: 0 }}>•</span>
                  <span style={{
                    fontFamily: 'Inter, sans-serif',
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: 15,
                    lineHeight: 1.9,
                  }}>
                    {ing}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Instructions */}
        {recipe.instructions?.length > 0 && (
          <>
            <SectionLabel>Instructions</SectionLabel>
            <ol style={{ listStyle: 'none', paddingLeft: 0 }}>
              {recipe.instructions.map((step, i) => (
                <li key={i} style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
                  <span style={{
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 700,
                    color: '#F4A623',
                    fontSize: 15,
                    minWidth: 24,
                    flexShrink: 0,
                    paddingTop: 2,
                  }}>
                    {i + 1}.
                  </span>
                  <span style={{
                    fontFamily: 'Inter, sans-serif',
                    color: 'rgba(255,255,255,0.75)',
                    fontSize: 15,
                    lineHeight: 1.9,
                  }}>
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </>
        )}

        {/* Tips */}
        {recipe.tips && (
          <div style={{
            background: 'rgba(244,166,35,0.08)',
            border: '1px solid rgba(244,166,35,0.2)',
            borderRadius: 12,
            padding: 16,
            marginTop: 24,
          }}>
            <div style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              color: '#F4A623',
              fontSize: 14,
              marginBottom: 6,
            }}>
              💡 Chef's Tip
            </div>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              color: 'rgba(255,255,255,0.6)',
              fontSize: 14,
              lineHeight: 1.7,
            }}>
              {recipe.tips}
            </p>
          </div>
        )}

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saved || saving}
          style={{
            width: '100%',
            marginTop: 24,
            padding: 14,
            border: saved ? '1px solid rgba(42,157,143,0.3)' : 'none',
            borderRadius: 12,
            background: saved ? 'rgba(42,157,143,0.2)' : '#E76F51',
            color: saved ? '#2A9D8F' : '#FFFFFF',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: 15,
            cursor: saved ? 'default' : 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseOver={e => { if (!saved && !saving) e.currentTarget.style.background = '#F4A623'; }}
          onMouseOut={e => { if (!saved && !saving) e.currentTarget.style.background = '#E76F51'; }}
        >
          {saving ? 'Saving…' : saved ? '✓ Saved to Collection' : '🔖 Save Recipe'}
        </button>

        {saveError && (
          <p style={{
            fontFamily: 'Inter, sans-serif',
            color: '#E63946',
            fontSize: 13,
            marginTop: 8,
            textAlign: 'center',
          }}>
            {saveError}
          </p>
        )}
      </div>
    </div>
  );
}

export default RecipeModal;
