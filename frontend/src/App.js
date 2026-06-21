import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import RecipeResults from './components/RecipeResults';
import BrowseSection from './components/BrowseSection';
import RecipeModal from './components/RecipeModal';
import SavedRecipesModal from './components/SavedRecipesModal';
import Footer from './components/Footer';

const API = 'https://recipesbyiq.onrender.com/api/v1';

function App() {
  const [ingredients, setIngredients] = useState([]);
  const [currentIngredient, setCurrentIngredient] = useState('');
  const [cuisinePreference, setCuisinePreference] = useState('nigerian');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [libraryRecipes, setLibraryRecipes] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [dietaryRestrictions, setDietaryRestrictions] = useState([]);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [savedRecipeNames, setSavedRecipeNames] = useState([]);

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    try {
      const res = await axios.get(`${API}/library/recipes`);
      setLibraryRecipes(res.data);
    } catch (err) {
      console.error('Failed to load library:', err);
    }
  };

  const addIngredient = () => {
    const items = currentIngredient
      .split(',')
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);
    if (items.length > 0) {
      setIngredients(prev => {
        const newItems = items.filter(item => !prev.includes(item));
        return newItems.length > 0 ? [...prev, ...newItems] : prev;
      });
    }
    setCurrentIngredient('');
  };

  const removeIngredient = (ing) => {
    setIngredients(prev => prev.filter(i => i !== ing));
  };

  const findRecipes = async () => {
    if (ingredients.length === 0) return;
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const res = await axios.post(`${API}/recipes/suggest`, {
        ingredients,
        cuisine_preference: cuisinePreference,
        max_prep_time_minutes: null,
        dietary_restrictions: dietaryRestrictions,
      });
      setResults(res.data);
      setIngredients([]);
      setCurrentIngredient('');
      setTimeout(() => {
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch recipes. Check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const saveRecipe = async (recipe) => {
    if (savedRecipeNames.includes(recipe.name)) return true; // already saved this session
    try {
      await axios.post(`${API}/recipes/save`, {
        recipe_name: recipe.name,
        recipe_data: recipe,
      });
      setSavedRecipeNames(prev => [...prev, recipe.name]);
      return true;
    } catch (err) {
      console.error('Save failed:', err);
      return false;
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      document.querySelector('input[placeholder*="ingredient"]')?.focus();
    }, 400);
  };

  const searchAgain = () => {
    setResults(null);
    setIngredients([]);
    setCurrentIngredient('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      document.querySelector('input[placeholder*="ingredient"]')?.focus();
    }, 400);
  };

  const scrollToBrowse = () => {
    document.getElementById('browse-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#1C1208' }}>
      <Navbar
        onGetStarted={scrollToTop}
        onBrowse={scrollToBrowse}
        onSavedClick={() => setShowSavedModal(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <Hero
        ingredients={ingredients}
        currentIngredient={currentIngredient}
        cuisinePreference={cuisinePreference}
        dietaryRestrictions={dietaryRestrictions}
        loading={loading}
        error={error}
        onIngredientChange={setCurrentIngredient}
        onAddIngredient={addIngredient}
        onRemoveIngredient={removeIngredient}
        onCuisineChange={setCuisinePreference}
        onDietaryChange={setDietaryRestrictions}
        onFindRecipes={findRecipes}
      />

      {(results || loading) && (
        <div id="results-section">
          <RecipeResults
            results={results}
            loading={loading}
            onSave={saveRecipe}
            onSelectRecipe={setSelectedRecipe}
            onSearchAgain={searchAgain}
            savedRecipeNames={savedRecipeNames}
          />
        </div>
      )}

      {!results && !loading && <HowItWorks />}

      <BrowseSection
        libraryRecipes={libraryRecipes}
        selectedRegion={selectedRegion}
        searchQuery={searchQuery}
        onRegionChange={setSelectedRegion}
        onSearchChange={setSearchQuery}
        onSelectRecipe={setSelectedRecipe}
      />

      <Footer />

      {selectedRecipe && (
        <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}

      {showSavedModal && (
        <SavedRecipesModal onClose={() => setShowSavedModal(false)} />
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
        }
        @media (max-width: 768px) {
          section { padding: 48px 20px !important; }
        }
      `}</style>
    </div>
  );
}

export default App;
