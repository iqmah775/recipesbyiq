import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import RecipeModal from './RecipeModal';

const API = 'https://recipesbyiq.onrender.com/api/v1';

const DIFF_STYLES = {
  easy:   { background: 'rgba(42,157,143,0.2)', color: '#2A9D8F' },
  medium: { background: 'rgba(244,166,35,0.2)', color: '#F4A623' },
  hard:   { background: 'rgba(230,57,70,0.2)',  color: '#E63946' },
};

function SavedRecipesModal({ onClose }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [viewingRecipe, setViewingRecipe] = useState(null);
  const viewingRef = useRef(null);

  // Keep ref in sync so the remove handler can read the latest value
  useEffect(() => { viewingRef.current = viewingRecipe; }, [viewingRecipe]);

  // Lock body scroll on mount, unlock on unmount
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Load saved recipes on open
  useEffect(() => {
    axios.get(`${API}/recipes/saved`)
      .then(res => setRecipes(res.data))
      .catch(err => console.error('Failed to load saved recipes:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (id) => {
    setRemovingId(id);
    try {
      await axios.delete(`${API}/recipes/saved/${id}`);
      // Wait for the CSS opacity transition (300ms) then remove from list
      setTimeout(() => {
        setRecipes(prev => prev.filter(r => r.id !== id));
        setRemovingId(null);
      }, 300);
    } catch (err) {
      console.error('Failed to remove recipe:', err);
      setRemovingId(null);
    }
  };

  // Close nested RecipeModal and re-lock body scroll.
  // setTimeout defers until after RecipeModal's cleanup (which sets overflow:'')
  const handleCloseRecipeView = () => {
    setViewingRecipe(null);
    setTimeout(() => { document.body.style.overflow = 'hidden'; }, 0);
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <>
      {/* Overlay */}
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
        {/* Modal box */}
        <div
          style={{
            background: '#2A1F0E',
            border: '1px solid #3D2E14',
            borderRadius: 24,
            maxWidth: 800,
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

          {/* Header */}
          <h2 style={{
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 700,
            color: '#FFFFFF',
            fontSize: 24,
            paddingRight: 48,
          }}>
            🔖 Saved Recipes
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            color: 'rgba(255,255,255,0.4)',
            fontSize: 14,
            marginTop: 4,
          }}>
            {loading ? 'Loading…' : `${recipes.length} recipe${recipes.length !== 1 ? 's' : ''} saved`}
          </p>

          {/* Loading */}
          {loading ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
              padding: '48px 0',
            }}>
              <div style={{
                width: 36,
                height: 36,
                border: '3px solid rgba(244,166,35,0.2)',
                borderTop: '3px solid #F4A623',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
              <p style={{
                fontFamily: 'Inter, sans-serif',
                color: 'rgba(255,255,255,0.5)',
                fontSize: 14,
              }}>
                Loading your saved recipes…
              </p>
            </div>

          ) : recipes.length === 0 ? (
            /* Empty state */
            <div style={{ textAlign: 'center', marginTop: 40, paddingBottom: 16 }}>
              <div style={{ fontSize: 48 }}>🔖</div>
              <h3 style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 600,
                color: '#FFFFFF',
                fontSize: 18,
                marginTop: 16,
              }}>
                No saved recipes yet
              </h3>
              <p style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 400,
                color: 'rgba(255,255,255,0.4)',
                fontSize: 14,
                marginTop: 8,
              }}>
                Find recipes you love and save them here
              </p>
            </div>

          ) : (
            /* Recipe grid */
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 16,
              marginTop: 24,
            }}>
              {recipes.map(saved => {
                const recipe = saved.recipe_data || {};
                const diffStyle = DIFF_STYLES[recipe.difficulty?.toLowerCase()] ?? null;
                const isRemoving = removingId === saved.id;

                return (
                  <div
                    key={saved.id}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid #3D2E14',
                      borderRadius: 16,
                      padding: 20,
                      display: 'flex',
                      flexDirection: 'column',
                      opacity: isRemoving ? 0 : 1,
                      transition: 'opacity 0.3s ease, border-color 0.2s',
                    }}
                    onMouseEnter={e => {
                      if (!isRemoving) e.currentTarget.style.borderColor = '#E76F51';
                    }}
                    onMouseLeave={e => {
                      if (!isRemoving) e.currentTarget.style.borderColor = '#3D2E14';
                    }}
                  >
                    {/* Name */}
                    <h4 style={{
                      fontFamily: 'Poppins, sans-serif',
                      fontWeight: 600,
                      color: '#FFFFFF',
                      fontSize: 16,
                      lineHeight: 1.3,
                    }}>
                      {saved.recipe_name}
                    </h4>

                    {/* Saved date */}
                    <p style={{
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 400,
                      color: 'rgba(255,255,255,0.35)',
                      fontSize: 12,
                      marginTop: 4,
                    }}>
                      Saved on {formatDate(saved.saved_at)}
                    </p>

                    {/* Difficulty + time */}
                    {(recipe.difficulty || recipe.prep_time_minutes) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                        {diffStyle && recipe.difficulty && (
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
                        )}
                        {recipe.prep_time_minutes && (
                          <span style={{
                            fontFamily: 'Inter, sans-serif',
                            color: 'rgba(255,255,255,0.35)',
                            fontSize: 12,
                          }}>
                            ⏱ {recipe.prep_time_minutes}m prep
                            {recipe.cook_time_minutes ? ` · ${recipe.cook_time_minutes}m cook` : ''}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Description — 2 lines max */}
                    {recipe.description && (
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
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                      <button
                        onClick={() => setViewingRecipe(recipe)}
                        style={{
                          flex: 1,
                          background: '#E76F51',
                          color: '#FFFFFF',
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: 13,
                          borderRadius: 8,
                          padding: '8px 0',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                        }}
                        onMouseOver={e => { e.currentTarget.style.background = '#F4A623'; }}
                        onMouseOut={e => { e.currentTarget.style.background = '#E76F51'; }}
                      >
                        View Recipe
                      </button>
                      <button
                        onClick={() => handleRemove(saved.id)}
                        disabled={isRemoving}
                        style={{
                          flex: 1,
                          background: 'transparent',
                          border: '1px solid rgba(230,57,70,0.3)',
                          color: '#E63946',
                          fontFamily: 'Inter, sans-serif',
                          fontWeight: 500,
                          fontSize: 13,
                          borderRadius: 8,
                          padding: '8px 0',
                          cursor: isRemoving ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                          opacity: isRemoving ? 0.5 : 1,
                        }}
                        onMouseOver={e => {
                          if (!isRemoving) {
                            e.currentTarget.style.background = 'rgba(230,57,70,0.1)';
                            e.currentTarget.style.borderColor = 'rgba(230,57,70,0.6)';
                          }
                        }}
                        onMouseOut={e => {
                          if (!isRemoving) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderColor = 'rgba(230,57,70,0.3)';
                          }
                        }}
                      >
                        {isRemoving ? 'Removing…' : 'Remove'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Nested RecipeModal — renders after overlay so it stacks on top (same z-index wins by DOM order) */}
      {viewingRecipe && (
        <RecipeModal recipe={viewingRecipe} onClose={handleCloseRecipeView} />
      )}
    </>
  );
}

export default SavedRecipesModal;
