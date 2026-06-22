import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import BrowseCard from './BrowseCard';

const API = 'https://recipesbyiq.onrender.com/api/v1';
const REGIONS = ['all', 'yoruba', 'igbo', 'hausa', 'south_south', 'modern'];

function BrowseSection({ libraryRecipes, selectedRegion, searchQuery, onRegionChange, onSearchChange, onSelectRecipe, darkMode }) {
  const [isInputBusy, setIsInputBusy] = useState(false);
  const [searchPhase, setSearchPhase] = useState(null);
  const [dbResults, setDbResults] = useState([]);
  const [aiResults, setAiResults] = useState([]);
  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);

    if (!searchQuery.trim()) {
      setIsInputBusy(false);
      setSearchPhase(null);
      setDbResults([]);
      setAiResults([]);
      return;
    }

    setIsInputBusy(true);
    setDbResults([]);
    setAiResults([]);

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(`${API}/library/recipes/search`, {
          params: { q: searchQuery.trim() },
        });

        if (res.data.length > 0) {
          setDbResults(res.data);
        } else {
          // No DB results — fall back to AI
          setSearchPhase('ai');
          try {
            const aiRes = await axios.post(`${API}/recipes/suggest`, {
              ingredients: [],
              cuisine_preference: 'general',
              dish_name: searchQuery.trim(),
              dietary_restrictions: [],
            });

            const allRecipes = [
              ...(aiRes.data.can_make_now || []),
              ...(aiRes.data.almost_there || []),
              ...(aiRes.data.needs_shopping || []),
            ].map(r => ({
              ...r,
              ingredients: [...(r.used_ingredients || []), ...(r.missing_ingredients || [])],
            }));

            setAiResults(allRecipes);
          } catch (aiErr) {
            console.error('AI fallback failed:', aiErr);
            setAiResults([]);
          }
        }
      } catch (err) {
        console.error('DB search failed:', err);
        setDbResults([]);
        setAiResults([]);
      } finally {
        setIsInputBusy(false);
        setSearchPhase(null);
      }
    }, 500);

    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  const isSearchActive = searchQuery.trim().length > 0;
  const sourceIsAI = isSearchActive && !isInputBusy && dbResults.length === 0 && aiResults.length > 0;

  let displayRecipes;
  if (!isSearchActive) {
    displayRecipes = libraryRecipes.filter(r => selectedRegion === 'all' || r.region === selectedRegion);
  } else if (!isInputBusy) {
    if (dbResults.length > 0) {
      displayRecipes = dbResults.filter(r => selectedRegion === 'all' || r.region === selectedRegion);
    } else {
      displayRecipes = aiResults;
    }
  } else {
    displayRecipes = [];
  }

  const t = {
    bg: darkMode ? '#1F1509' : '#FFF8F0',
    heading: darkMode ? '#FFFFFF' : '#1C1208',
    subtext: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(28,18,8,0.6)',
    border: darkMode ? '#3D2E14' : '#E8D5B0',
    inputBg: darkMode ? '#2A1F0E' : 'rgba(255,245,230,0.9)',
    inputColor: darkMode ? '#FFFFFF' : '#1C1208',
    pillInactiveColor: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(28,18,8,0.6)',
    emptyText: darkMode ? 'rgba(255,255,255,0.3)' : 'rgba(28,18,8,0.4)',
    stateHeading: darkMode ? '#FFFFFF' : '#1C1208',
  };

  return (
    <section id="browse-section" style={{ background: t.bg, padding: '80px 48px', transition: 'background 0.3s' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 700,
          color: t.heading,
          fontSize: 36,
          transition: 'color 0.3s',
        }}>
          Browse Nigerian Recipes
        </h2>
        <p style={{
          fontFamily: 'Inter, sans-serif',
          color: t.subtext,
          fontSize: 16,
          marginTop: 12,
          transition: 'color 0.3s',
        }}>
          Explore our verified collection of traditional dishes
        </p>
      </div>

      {/* Search input with loading spinner */}
      <div style={{ maxWidth: 480, margin: '32px auto 0', position: 'relative' }}>
        <input
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search recipes..."
          style={{
            width: '100%',
            background: t.inputBg,
            border: `1px solid ${t.border}`,
            borderRadius: 12,
            padding: isInputBusy ? '14px 44px 14px 20px' : '14px 20px',
            color: t.inputColor,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 15,
            transition: 'border-color 0.2s, background 0.3s',
            boxSizing: 'border-box',
            outline: 'none',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = '#E76F51'; }}
          onBlur={e => { e.currentTarget.style.borderColor = t.border; }}
        />
        {isInputBusy && (
          <div style={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 16,
            height: 16,
            border: '2px solid rgba(244,166,35,0.2)',
            borderTop: '2px solid #F4A623',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
            flexShrink: 0,
          }} />
        )}
      </div>

      {/* Region filter pills */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 24,
      }}>
        {REGIONS.map(region => (
          <button
            key={region}
            onClick={() => onRegionChange(region)}
            style={{
              background: selectedRegion === region ? '#E76F51' : 'transparent',
              color: selectedRegion === region ? '#FFFFFF' : t.pillInactiveColor,
              border: selectedRegion === region ? 'none' : `1px solid ${t.border}`,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 14,
              borderRadius: 20,
              padding: '8px 20px',
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.2s',
            }}
          >
            {region === 'all' ? 'All' : region.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Recipe grid / loading / empty states */}
      <div style={{ maxWidth: 1200, margin: '40px auto 0' }}>
        {isSearchActive && isInputBusy ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{
              width: 40,
              height: 40,
              border: '3px solid rgba(244,166,35,0.2)',
              borderTop: '3px solid #F4A623',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto',
            }} />
            <p style={{
              fontFamily: 'Inter, sans-serif',
              color: '#F4A623',
              fontSize: 15,
              marginTop: 20,
              fontWeight: 500,
            }}>
              {searchPhase === 'ai'
                ? 'Not found locally, asking AI…'
                : 'Searching our database…'}
            </p>
          </div>
        ) : isSearchActive && !isInputBusy && displayRecipes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{ fontSize: 48 }}>🍽️</div>
            <h3 style={{
              fontFamily: 'Poppins, sans-serif',
              fontWeight: 600,
              color: t.stateHeading,
              fontSize: 20,
              marginTop: 16,
              transition: 'color 0.3s',
            }}>
              No recipes found
            </h3>
            <p style={{
              fontFamily: 'Inter, sans-serif',
              color: t.subtext,
              fontSize: 14,
              marginTop: 8,
              transition: 'color 0.3s',
            }}>
              Our library and AI couldn't find a match for "{searchQuery}"
            </p>
            <button
              onClick={() => onSearchChange('')}
              style={{
                background: '#E76F51',
                color: '#FFFFFF',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 14,
                borderRadius: 8,
                padding: '10px 24px',
                border: 'none',
                cursor: 'pointer',
                marginTop: 20,
                transition: 'background 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.background = '#F4A623'; }}
              onMouseOut={e => { e.currentTarget.style.background = '#E76F51'; }}
            >
              Clear search
            </button>
          </div>
        ) : !isSearchActive && displayRecipes.length === 0 ? (
          <p style={{
            textAlign: 'center',
            fontFamily: 'Inter, sans-serif',
            color: t.emptyText,
            fontSize: 15,
            padding: '48px 0',
            transition: 'color 0.3s',
          }}>
            {libraryRecipes.length === 0
              ? 'No recipes in library yet. Add some via the API!'
              : 'No recipes match the selected region.'}
          </p>
        ) : (
          <>
            {sourceIsAI && (
              <div style={{ marginBottom: 24, textAlign: 'center' }}>
                <span style={{
                  background: 'rgba(244,166,35,0.1)',
                  border: '1px solid rgba(244,166,35,0.25)',
                  color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(28,18,8,0.7)',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 13,
                  borderRadius: 8,
                  padding: '7px 16px',
                  display: 'inline-block',
                  transition: 'color 0.3s',
                }}>
                  ✨ No matches in our library, showing AI suggestions for "{searchQuery}"
                </span>
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 20,
            }}>
              {displayRecipes.map((recipe, i) => (
                <BrowseCard
                  key={recipe.id ?? i}
                  recipe={recipe}
                  searchQuery={searchQuery}
                  isAI={sourceIsAI}
                  onViewFull={() => onSelectRecipe(recipe)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default BrowseSection;
