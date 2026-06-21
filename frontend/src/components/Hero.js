import React, { useState, useEffect } from 'react';

const DIETARY_CHIPS = [
  { value: 'diabetic',          icon: '🩺', label: 'Diabetic' },
  { value: 'lactose_intolerant', icon: '🥛', label: 'Lactose Free' },
  { value: 'hypertension',      icon: '❤️',  label: 'Hypertension' },
  { value: 'pescatarian',       icon: '🐟', label: 'Pescatarian' },
  { value: 'vegan',             icon: '🌱', label: 'Vegan' },
  { value: 'vegetarian',        icon: '🥗', label: 'Vegetarian' },
  { value: 'gluten_free',       icon: '🌾', label: 'Gluten Free' },
  { value: 'nut_allergy',       icon: '🥜', label: 'Nut Allergy' },
];

const CUISINES = [
  { value: 'nigerian', label: '🇳🇬 Nigerian' },
  { value: 'yoruba', label: 'Yoruba' },
  { value: 'igbo', label: 'Igbo' },
  { value: 'hausa', label: 'Hausa' },
  { value: 'south_south', label: 'South South' },
  { value: 'italian', label: '🌍 Italian' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'english', label: 'English' },
  { value: 'french', label: 'French' },
];

function Hero({
  ingredients,
  currentIngredient,
  cuisinePreference,
  dietaryRestrictions,
  loading,
  error,
  onIngredientChange,
  onAddIngredient,
  onRemoveIngredient,
  onCuisineChange,
  onDietaryChange,
  onFindRecipes,
}) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleRestriction = (value) => {
    onDietaryChange(prev =>
      prev.includes(value) ? prev.filter(r => r !== value) : [...prev, value]
    );
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onAddIngredient();
  };

  return (
    <section style={{
      minHeight: '100vh',
      background: "linear-gradient(rgba(28,18,8,0.7), rgba(28,18,8,0.85)), url('https://images.unsplash.com/photo-1665332195309-9d75071138f0?w=1600&auto=format&fit=crop') center/cover no-repeat",      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: isMobile ? '100px 20px 60px' : '120px 24px 80px',    }}>
      {/* Hero text block: badge + heading + subheading */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Badge */}
        <div style={{
          color: '#F4A623',
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: 13,
          letterSpacing: 2,
          textTransform: 'uppercase',
          background: 'rgba(244,166,35,0.15)',
          border: '1px solid rgba(244,166,35,0.3)',
          borderRadius: 20,
          padding: '6px 16px',
          marginBottom: 24,
        }}>
          🇳🇬 Nigerian Recipe Intelligence
        </div>

        {/* Heading */}
        <h1 style={{ lineHeight: 1.1, margin: 0 }}>
          <span style={{
            display: 'block',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 700,
            color: '#FFFFFF',
            fontSize: 'clamp(36px, 5vw, 58px)',
          }}>
            Cook anything with
          </span>
          <span style={{
            display: 'block',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 800,
            color: '#F4A623',
            fontSize: 'clamp(36px, 5vw, 58px)',
          }}>
            what you have
          </span>
        </h1>

        {/* Subheading */}
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          color: 'rgba(255,255,255,0.65)',
          fontSize: 18,
          maxWidth: 560,
          lineHeight: 1.7,
          marginTop: 20,
          marginBottom: 0,
        }}>
          Tell IngredIQ your ingredients and discover authentic Nigerian recipes you can make right now, or let AI suggest international dishes
        </p>
      </div>

      {/* Input Card */}
      <div style={{
        background: 'rgba(42, 31, 14, 0.9)',
        border: '1px solid #3D2E14',
        borderRadius: 20,
        padding: 24,
        maxWidth: 580,
        width: '100%',
        margin: '40px auto 0',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}>
        {/* Text input row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            value={currentIngredient}
            onChange={e => onIngredientChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type ingredients separated by commas, e.g. rice, tomatoes, onions..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              fontSize: 17,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              padding: '8px 0',
            }}
          />
          <button
            onClick={onAddIngredient}
            style={{
              background: '#E76F51',
              color: '#FFFFFF',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: 13,
              borderRadius: 8,
              padding: '8px 16px',
              border: 'none',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'background 0.2s',
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#F4A623'; }}
            onMouseOut={e => { e.currentTarget.style.background = '#E76F51'; }}
          >
            Add
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#3D2E14', margin: '14px 0' }} />

        {/* Ingredient tags */}
        {ingredients.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            {ingredients.map(ing => (
              <span key={ing} style={{
                background: 'rgba(244,166,35,0.15)',
                color: '#F4A623',
                border: '1px solid rgba(244,166,35,0.3)',
                borderRadius: 20,
                padding: '5px 12px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                fontSize: 13,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}>
                {ing}
                <button
                  onClick={() => onRemoveIngredient(ing)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#F4A623',
                    cursor: 'pointer',
                    fontSize: 15,
                    padding: 0,
                    lineHeight: 1,
                    fontWeight: 700,
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Cuisine select */}
        <select
          value={cuisinePreference}
          onChange={e => onCuisineChange(e.target.value)}
          style={{
            background: 'transparent',
            color: 'rgba(255,255,255,0.6)',
            border: 'none',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: 15,
            cursor: 'pointer',
            width: '100%',
          }}
        >
          {CUISINES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        {/* Dietary restriction chips */}
        <div style={{ marginTop: 14 }}>
          <span style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            color: 'rgba(255,255,255,0.5)',
            fontSize: 13,
            display: 'block',
            marginBottom: 8,
          }}>
            Dietary needs:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {DIETARY_CHIPS.map(chip => {
              const selected = dietaryRestrictions.includes(chip.value);
              return (
                <button
                  key={chip.value}
                  onClick={() => toggleRestriction(chip.value)}
                  style={{
                    background: selected ? 'rgba(244,166,35,0.15)' : 'transparent',
                    border: selected ? '1px solid rgba(244,166,35,0.4)' : '1px solid #3D2E14',
                    color: selected ? '#F4A623' : 'rgba(255,255,255,0.5)',
                    borderRadius: 20,
                    padding: '5px 12px',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 500,
                    fontSize: 12,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {chip.icon} {chip.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#3D2E14', margin: '16px 0 12px' }} />

        {/* Find button — full width */}
        <button
          onClick={onFindRecipes}
          disabled={ingredients.length === 0 || loading}
          style={{
            width: '100%',
            background: ingredients.length === 0 || loading ? 'rgba(231,111,81,0.45)' : '#E76F51',
            color: '#FFFFFF',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 600,
            fontSize: 15,
            borderRadius: 12,
            padding: '12px 28px',
            border: 'none',
            cursor: ingredients.length === 0 || loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseOver={e => {
            if (ingredients.length > 0 && !loading) e.currentTarget.style.background = '#F4A623';
          }}
          onMouseOut={e => {
            if (ingredients.length > 0 && !loading) e.currentTarget.style.background = '#E76F51';
          }}
        >
          {loading ? 'Finding…' : 'Find Recipes →'}
        </button>

        {error && (
          <p style={{
            color: '#E63946',
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            marginTop: 14,
            textAlign: 'left',
            background: 'rgba(230,57,70,0.1)',
            borderRadius: 8,
            padding: '8px 12px',
          }}>
            {error}
          </p>
        )}
      </div>

      {/* Social proof line */}
      <p style={{
        color: 'rgba(255,255,255,0.4)',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 400,
        fontSize: 13,
        marginTop: 18,
      }}>
        ✓ Traditional Nigerian recipes &nbsp;·&nbsp; ✓ AI-powered suggestions &nbsp;·&nbsp; ✓ Free to use
      </p>
    </section>
  );
}

export default Hero;
