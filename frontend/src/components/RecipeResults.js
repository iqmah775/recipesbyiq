import React from 'react';
import RecipeCard from './RecipeCard';

const TIERS = [
  {
    key: 'can_make_now',
    label: '✅ Can Make Now',
    pill: { background: 'rgba(42,157,143,0.15)', color: '#2A9D8F', border: '1px solid rgba(42,157,143,0.3)' },
  },
  {
    key: 'almost_there',
    label: '⚡ Almost There',
    pill: { background: 'rgba(244,166,35,0.15)', color: '#F4A623', border: '1px solid rgba(244,166,35,0.3)' },
  },
  {
    key: 'needs_shopping',
    label: '🛒 Needs Shopping',
    pill: { background: 'rgba(230,57,70,0.15)', color: '#E63946', border: '1px solid rgba(230,57,70,0.3)' },
  },
];

function RecipeResults({ results, loading, onSave, onSelectRecipe, onSearchAgain, savedRecipeNames }) {
  if (!results && !loading) return null;

  const total = results
    ? (results.can_make_now?.length || 0) + (results.almost_there?.length || 0) + (results.needs_shopping?.length || 0)
    : 0;
  const canMakeNow = results?.can_make_now?.length || 0;

  return (
    <section style={{ background: '#1C1208', padding: '64px 48px' }}>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '48px 0' }}>
          <div style={{
            width: 48,
            height: 48,
            border: '3px solid #3D2E14',
            borderTop: '3px solid #F4A623',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            color: 'rgba(255,255,255,0.6)',
            fontSize: 15,
          }}>
            Finding your recipes…
          </p>
        </div>
      ) : (
        <>
          {/* Search Again button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
            <button
              onClick={onSearchAgain}
              style={{
                background: 'transparent',
                border: '1px solid #3D2E14',
                color: 'rgba(255,255,255,0.6)',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 14,
                borderRadius: 20,
                padding: '8px 20px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => {
                e.currentTarget.style.borderColor = '#E76F51';
                e.currentTarget.style.color = '#E76F51';
              }}
              onMouseOut={e => {
                e.currentTarget.style.borderColor = '#3D2E14';
                e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
              }}
            >
              ← Search Again
            </button>
          </div>

          {results?.message ? (
            <div style={{
              maxWidth: 520,
              margin: '0 auto',
              textAlign: 'center',
              background: '#2A1F0E',
              border: '1px solid #3D2E14',
              borderRadius: 20,
              padding: '40px 32px',
            }}>
              <p style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.7 }}>
                {results.message}
              </p>
              <p style={{ fontFamily: 'Inter, sans-serif', color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 10 }}>
                Use the "Add Recipe" link in the navbar to populate the library.
              </p>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 40 }}>
                <h2 style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  fontSize: 32,
                }}>
                  Your Recipes
                </h2>
                <p style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 400,
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 15,
                  marginTop: 8,
                }}>
                  Found {total} recipe{total !== 1 ? 's' : ''} · {canMakeNow} can make now
                </p>
              </div>

              {TIERS.map(({ key, label, pill }) => {
                const recipes = results?.[key];
                if (!recipes || recipes.length === 0) return null;
                return (
                  <div key={key} style={{ marginBottom: 52 }}>
                    <span style={{
                      ...pill,
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: 13,
                      borderRadius: 20,
                      padding: '6px 16px',
                      display: 'inline-block',
                      marginBottom: 24,
                    }}>
                      {label}
                    </span>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
                      gap: 20,
                    }}>
                      {recipes.map((recipe, i) => (
                        <RecipeCard
                          key={i}
                          recipe={recipe}
                          onSave={onSave}
                          onSelect={() => onSelectRecipe(recipe)}
                          savedRecipeNames={savedRecipeNames}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </>
      )}
    </section>
  );
}

export default RecipeResults;
