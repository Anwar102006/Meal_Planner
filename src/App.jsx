import './App.css'
import RecipeCard from './RecipeCard'
import { useState, useMemo, useEffect, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import axios from 'axios'
import { GlobalStyles } from './ui/GlobalStyles'
import { ThemeProvider } from 'styled-components'
import theme from './ui/theme'
import { 
  getCurrentWeek, 
  getWeekDates, 
  formatDateString, 
  formatDateWithDay, 
  isToday, 
  getWeekStart, 
  parseDate,
  getNextWeek,
  getPreviousWeek
} from '../utils/dateUtils.js'
import AddRecipeModal from './components/AddRecipeModal.jsx'
import GroceryDownloadModal from './components/GroceryDownloadModal.jsx'
import HistoricalDataModal from './components/HistoricalDataModal.jsx'
import NavBar from './components/NavBar.jsx'

// TheMealDB API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Available filters from TheMealDB
const mealTypes = ['Breakfast', 'Lunch', 'Dinner']
const dietFilters = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Keto']
const availableCategories = [
  'Beef', 'Chicken', 'Dessert', 'Lamb', 'Miscellaneous',
  'Pasta', 'Pork', 'Seafood', 'Side', 'Starter', 'Vegan', 'Vegetarian', 'Breakfast', 'Goat'
];

// API helper functions
async function fetchRecipesFromAPI(searchParams = {}) {
  try {
    const { query, category, area, ingredient, limit = 20 } = searchParams;
    const params = new URLSearchParams();
    
    if (query) params.append('query', query);
    if (category) params.append('category', category);
    if (area) params.append('area', area);
    if (ingredient) params.append('ingredient', ingredient);
    params.append('limit', limit.toString());
    
    const response = await axios.get(`${API_BASE_URL}/recipes/search?${params.toString()}`);
    return response.data.recipes || [];
  } catch (error) {
    console.error('Error fetching recipes:', error);
    throw new Error('Failed to load recipes');
  }
}

async function fetchRandomRecipes(count = 10) {
  try {
    const response = await axios.get(`${API_BASE_URL}/recipes/random?count=${count}`);
    return response.data.recipes || [];
  } catch (error) {
    console.error('Error fetching random recipes:', error);
    throw new Error('Failed to load random recipes');
  }
}

async function fetchCategories() {
  try {
    const response = await axios.get(`${API_BASE_URL}/recipes/categories`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return availableCategories.map(cat => ({ strCategory: cat }));
  }
}

// Date-based meal plan structure helper
function createWeekMealPlanStructure(weekDates) {
  const mealPlan = {};
  weekDates.forEach((date, index) => {
    const dateKey = formatDateString(date);
    mealPlan[dateKey] = {
      date: date,
      dayIndex: index,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      displayDate: formatDateWithDay(date),
      isToday: isToday(date),
      meals: {
        Breakfast: null,
        Lunch: null,
        Dinner: null
      }
    };
  });
  return mealPlan;
}

// Extract grocery list from date-based meal plan
function extractGroceryList(mealPlan, dateRange = null) {
  // Debug logging (can be removed in production)
  const debugMode = window.location.search.includes('debug=true');
  
  if (debugMode) {
    console.log('🔍 Extracting grocery list from meal plan:', mealPlan);
    console.log('📅 Date range filter:', dateRange);
  }
  
  const allIngredients = [];
  let mealCount = 0;
  
  Object.values(mealPlan).forEach((dayData, dayIndex) => {
    // Skip if date range is specified and this date is outside the range
    if (dateRange && dateRange.start && dateRange.end) {
      const dayDate = new Date(dayData.date);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      
      // Set time to start/end of day for proper comparison
      dayDate.setHours(0, 0, 0, 0);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      
      if (debugMode) {
        console.log(`📅 Comparing dates:`);
        console.log(`  Day: ${dayDate.toDateString()} (${dayData.displayDate})`);
        console.log(`  Range: ${startDate.toDateString()} to ${endDate.toDateString()}`);
        console.log(`  Include: ${dayDate >= startDate && dayDate <= endDate}`);
      }
      
      if (dayDate < startDate || dayDate > endDate) {
        if (debugMode) console.log(`⏭️ Skipping day ${dayIndex} - outside date range`);
        return;
      }
    }
    
    Object.values(dayData.meals || {}).forEach((meal, mealIndex) => {
      if (meal) {
        mealCount++;
        if (debugMode) console.log(`🍽️ Processing meal ${mealIndex}:`, meal.title);
        
        // Check multiple possible ingredient fields
        const ingredients = meal.ingredients || meal.recipe?.ingredients || [];
        
        if (debugMode) {
          console.log('🥕 Ingredients found:', ingredients);
          console.log('🔍 Type:', typeof ingredients, 'Array?', Array.isArray(ingredients));
        }
        
        if (Array.isArray(ingredients) && ingredients.length > 0) {
          allIngredients.push(...ingredients);
          if (debugMode) console.log('✅ Added ingredients:', ingredients);
        }
        // Also check if ingredients are stored differently
        else if (typeof ingredients === 'string') {
          // Split string ingredients by common delimiters
          const splitIngredients = ingredients.split(/[,;\n]/).map(item => item.trim()).filter(item => item.length > 0);
          allIngredients.push(...splitIngredients);
          if (debugMode) console.log('✅ Added split ingredients:', splitIngredients);
        } else {
          if (debugMode) console.log('❌ No valid ingredients found for this meal');
        }
      }
    });
  });
  
  if (debugMode) {
    console.log('🛒 Total ingredients collected:', allIngredients.length);
    console.log('🍽️ Total meals processed:', mealCount);
    console.log('📋 All ingredients:', allIngredients);
  }
  
  // Clean and filter ingredients
  const cleanIngredients = allIngredients
    .filter(item => item && typeof item === 'string' && item.trim().length > 0)
    .map(item => item.trim());
  
  if (cleanIngredients.length === 0) {
    if (debugMode) console.log('⚠️ No ingredients found - returning fallback message');
    if (mealCount === 0) {
      return ['No meals planned yet. Add some recipes to generate a grocery list!'];
    } else {
      return ['No ingredients found in planned meals. The recipes might not have ingredient data.'];
    }
  }
  
  // Combine duplicates and count occurrences
  const ingredientCount = {};
  cleanIngredients.forEach(item => {
    const key = item.toLowerCase();
    ingredientCount[key] = (ingredientCount[key] || 0) + 1;
  });
  
  // Output clean list (capitalize first letter and format nicely)
  const finalList = Object.entries(ingredientCount)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, count]) => {
      const name = key.charAt(0).toUpperCase() + key.slice(1);
      return count > 1 ? `${name} (x${count})` : name;
    });
    
  if (debugMode) {
    console.log('🎯 Final grocery list:', finalList);
  }
  
  return finalList;
}

// Calculate nutrition from date-based meal plan
function calculateNutrition(mealPlan) {
  const weekDates = Object.keys(mealPlan).sort();
  const dailyNutrition = [];
  
  weekDates.forEach(dateKey => {
    const dayData = mealPlan[dateKey];
    let dayTotal = { calories: 0, protein: 0, fat: 0, carbs: 0 };
    
    Object.values(dayData.meals || {}).forEach(meal => {
      if (meal && meal.nutrition) {
        dayTotal.calories += meal.nutrition.calories || 0;
        dayTotal.protein += meal.nutrition.protein || 0;
        dayTotal.fat += meal.nutrition.fat || 0;
        dayTotal.carbs += meal.nutrition.carbs || 0;
      }
    });
    
    dailyNutrition.push({
      date: dateKey,
      ...dayTotal
    });
  });

  const weeklyTotal = dailyNutrition.reduce((total, day) => ({
    calories: total.calories + day.calories,
    protein: total.protein + day.protein,
    fat: total.fat + day.fat,
    carbs: total.carbs + day.carbs
  }), { calories: 0, protein: 0, fat: 0, carbs: 0 });

  return { dailyNutrition, weeklyTotal };
}

function downloadGroceryList(groceryList, user, dateRange = null) {
  // Debug logging
  const debugMode = window.location.search.includes('debug=true');
  
  if (debugMode) {
    console.log('📥 Downloading grocery list:');
    console.log('📋 Grocery list:', groceryList);
    console.log('👤 User:', user);
    console.log('📅 Date range:', dateRange);
  }
  
  const dateInfo = dateRange 
    ? `Date Range: ${dateRange.start} to ${dateRange.end}`
    : `Date: ${new Date().toLocaleDateString()}`;
    
  // Create content with proper line breaks
  const ingredientLines = groceryList.map((item, index) => `${index + 1}. ${item}`).join('\n');
  
  const content = `Meal Planner - Grocery List
Generated for: ${user}
${dateInfo}
Generated on: ${new Date().toLocaleString()}

${ingredientLines}

Total items: ${groceryList.length}

---
Generated by Meal Planner App
Thank you for using our app!`;

  if (debugMode) {
    console.log('📄 File content preview:');
    console.log(content);
  }

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  
  const filename = dateRange 
    ? `grocery-list-${dateRange.start}-to-${dateRange.end}.txt`
    : `grocery-list-${new Date().toISOString().split('T')[0]}.txt`;
    
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  if (debugMode) {
    console.log('✅ Download initiated for file:', filename);
  }
  
  // Show success message to user
  console.log(`🎉 Grocery list downloaded successfully as ${filename}`);
}

const USER_STORAGE_KEY = 'mealPlannerApp.users'
const PREFERENCES_KEY = 'mealPlannerApp.preferences'

function checkPasswordStrength(password) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  }
  const score = Object.values(checks).filter(Boolean).length
  return { checks, score, strong: score >= 4 }
}

function AuthForm({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const passwordStrength = checkPasswordStrength(password)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (!username || !password) {
      setError('Please enter both username and password.')
      return
    }
    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (!isLogin && !passwordStrength.strong) {
      setError('Password must be at least 8 characters with uppercase, lowercase, number, and special character.')
      return
    }
    
    const users = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || '{}')
    
    if (isLogin) {
      // Login logic
      if (!users[username]) {
        setError('Username not found. Please register first.')
        return
      }
      if (users[username].password !== password) {
        setError('Incorrect password. Please try again.')
        return
      }
      setSuccess('Login successful!')
      setTimeout(() => {
        onLogin(username)
      }, 1000)
    } else {
      // Registration logic
      if (users[username]) {
        setError('Username already exists. Please choose a different username or login.')
        return
      }
      const currentWeek = getCurrentWeek();
      const weekDates = getWeekDates(currentWeek.start);
      users[username] = { 
        password,
        createdAt: new Date().toISOString(),
        mealPlan: createWeekMealPlanStructure(weekDates)
      }
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users))
      setSuccess('Registration successful! Logging you in...')
      setTimeout(() => {
        onLogin(username)
      }, 1000)
    }
  }

  const clearForm = () => {
    setUsername('')
    setPassword('')
    setConfirmPassword('')
    setError('')
    setSuccess('')
  }

  return (
    <div className="auth-container">
      <h2>{isLogin ? 'Login' : 'Register'}</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {!isLogin && (
          <>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
            <div className="password-strength">
              <div className="strength-bar">
                <div 
                  className={`strength-fill ${passwordStrength.score >= 1 ? 'weak' : ''} ${passwordStrength.score >= 3 ? 'medium' : ''} ${passwordStrength.score >= 4 ? 'strong' : ''}`}
                  style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                ></div>
              </div>
              <div className="strength-text">
                {passwordStrength.score < 2 ? 'Weak' : passwordStrength.score < 4 ? 'Medium' : 'Strong'}
              </div>
            </div>
          </>
        )}
        <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}
      </form>
      <button className="auth-toggle" onClick={() => { 
        setIsLogin(!isLogin); 
        clearForm();
      }}>
        {isLogin ? 'No account? Register' : 'Already have an account? Login'}
      </button>
    </div>
  )
}

function InstallButton() {
  const [showInstallButton, setShowInstallButton] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setShowInstallButton(true)
      
      const installButton = document.getElementById('install-button')
      if (installButton) {
        installButton.addEventListener('click', () => {
          e.prompt()
          e.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
              console.log('User accepted the install prompt')
            } else {
              console.log('User dismissed the install prompt')
            }
            setShowInstallButton(false)
          })
        })
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  if (!showInstallButton) return null

  return (
    <button 
      id="install-button"
      className="install-button"
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        background: '#a7c7e7',
        color: '#234567',
        border: 'none',
        borderRadius: '0.5rem',
        padding: '0.5rem 1rem',
        fontSize: '0.9rem',
        cursor: 'pointer',
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(100, 150, 200, 0.2)'
      }}
    >
      📱 Install App
    </button>
  )
}

function SettingsModal({ isOpen, onClose, preferences, onSavePreferences }) {
  const [localPreferences, setLocalPreferences] = useState(preferences)

  const handleSave = () => {
    onSavePreferences(localPreferences)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="delete-modal">
      <div className="delete-content" style={{ maxWidth: '500px' }}>
        <h3>Dietary Preferences</h3>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Dietary Restrictions:
          </label>
          {dietFilters.map(diet => (
            <label key={diet} style={{ display: 'block', marginBottom: '0.5rem' }}>
              <input
                type="checkbox"
                checked={localPreferences.dietaryRestrictions.includes(diet)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setLocalPreferences(prev => ({
                      ...prev,
                      dietaryRestrictions: [...prev.dietaryRestrictions, diet]
                    }))
                  } else {
                    setLocalPreferences(prev => ({
                      ...prev,
                      dietaryRestrictions: prev.dietaryRestrictions.filter(d => d !== diet)
                    }))
                  }
                }}
                style={{ marginRight: '0.5rem' }}
              />
              {diet}
            </label>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button className="filter-btn" onClick={handleSave}>
            Save Preferences
          </button>
          <button className="filter-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// AddRecipeModal is now imported from components/AddRecipeModal.jsx

function App() {
  const [user, setUser] = useState(null)
  
  // Current week data
  const [currentWeek, setCurrentWeek] = useState(() => getCurrentWeek())
  
  // Date-based meal plan structure
  const [mealPlan, setMealPlan] = useState(() => {
    const weekDates = getWeekDates(new Date());
    return createWeekMealPlanStructure(weekDates);
  })
  
  // Dynamic recipes from TheMealDB
  const [recipes, setRecipes] = useState([])
  const [availableCategories, setAvailableCategories] = useState([])
  
  // Search and filtering
  const [activeFilter, setActiveFilter] = useState('All')
  const [activeCategory, setActiveCategory] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  
  // UI states
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loadingRecipes, setLoadingRecipes] = useState(false)
  
  // Modals and UI components
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showAddRecipe, setShowAddRecipe] = useState(false)
  const [showGroceryDownload, setShowGroceryDownload] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  
  // Date range for grocery list
  const [groceryDateRange, setGroceryDateRange] = useState({
    start: formatDateString(currentWeek.start),
    end: formatDateString(currentWeek.end)
  })
  
  // User preferences
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem(PREFERENCES_KEY)
    return saved ? JSON.parse(saved) : {
      dietaryRestrictions: [],
      servingSize: 2,
      mealPlanningDays: 7
    }
  })

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Save meal plan to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      const weekKey = `mealPlan_${user}_${formatDateString(currentWeek.start)}`;
      localStorage.setItem(weekKey, JSON.stringify(mealPlan));
      
      // Also save to user data for backward compatibility
      const users = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || '{}')
      if (users[user]) {
        users[user].mealPlan = mealPlan;
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
      }
      localStorage.setItem('mealPlannerApp.lastUser', user)
    }
  }, [mealPlan, user, currentWeek.start])

  useEffect(() => {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
  }, [preferences])

  // Load initial recipes and categories
  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

  // Load recipes when search/filter changes
  useEffect(() => {
    if (user && (debouncedSearch || activeCategory || activeFilter !== 'All')) {
      searchRecipes();
    }
  }, [user, debouncedSearch, activeCategory, activeFilter]);

  const loadInitialData = async () => {
    setLoadingRecipes(true);
    try {
      // Load random recipes initially with better variety
      const randomRecipes = await fetchRandomRecipes(30);
      setRecipes(randomRecipes);
      
      // Load available categories from API
      try {
        const categories = await fetchCategories();
        if (categories && categories.length > 0) {
          setAvailableCategories(categories);
        }
      } catch (catError) {
        console.warn('Using fallback categories:', catError);
        // Keep the predefined categories as fallback
      }
      
    } catch (error) {
      setError('Failed to load initial data. Please check your internet connection.');
      console.error('Error loading initial data:', error);
    } finally {
      setLoadingRecipes(false);
    }
  };

  const searchRecipes = useCallback(async () => {
    if (!user) return;
    
    setLoadingRecipes(true);
    setError('');
    
    try {
      const searchParams = {
        query: debouncedSearch || undefined,
        category: activeCategory || undefined,
        limit: 40  // Increased limit for more variety
      };
      
      // If diet filter is active, prioritize it over category
      if (activeFilter !== 'All' && dietFilters.includes(activeFilter)) {
        searchParams.category = activeFilter;
      }
      
      let searchResults = await fetchRecipesFromAPI(searchParams);
      
      // If no results with current search, try different approaches
      if (searchResults.length === 0) {
        if (activeCategory) {
          // Try searching just by category without other filters
          searchResults = await fetchRecipesFromAPI({ 
            category: activeCategory, 
            limit: 30 
          });
        } else if (debouncedSearch) {
          // Try partial search without category
          searchResults = await fetchRecipesFromAPI({ 
            query: debouncedSearch, 
            limit: 30 
          });
        }
        
        // If still no results, get random recipes from same category
        if (searchResults.length === 0 && activeCategory) {
          try {
            const response = await axios.get(`${API_BASE_URL}/recipes/random?count=20&category=${activeCategory}`);
            searchResults = response.data.recipes || [];
          } catch (randomError) {
            console.warn('Could not get random recipes for category:', randomError);
          }
        }
      }
      
      setRecipes(searchResults);
      
      if (searchResults.length === 0) {
        setError('No recipes found matching your criteria. Try different search terms or categories.');
      }
    } catch (error) {
      setError('Failed to search recipes. Please check your connection and try again.');
      console.error('Error searching recipes:', error);
    } finally {
      setLoadingRecipes(false);
    }
  }, [user, debouncedSearch, activeCategory, activeFilter]);

  // Add specific handler for category changes to ensure proper loading
  const handleCategoryChange = async (category) => {
    setActiveCategory(category);
    setLoadingRecipes(true);
    setError('');
    
    try {
      // Immediate search by category without waiting for effect
      const results = await fetchRecipesFromAPI({ 
        category: category || undefined, 
        limit: 40 
      });
      
      setRecipes(results);
      
      if (results.length === 0) {
        setError(`No recipes found in the ${category || 'selected'} category. Try a different category.`);
      }
    } catch (error) {
      console.error('Error fetching category recipes:', error);
      setError('Failed to load recipes for this category. Please try again.');
    } finally {
      setLoadingRecipes(false);
    }
  };

  const handleAddRecipe = async (recipeData) => {
    const { recipe, date, mealType, servings, notes } = recipeData;
    const dateKey = formatDateString(date);
    
    try {
      // Update meal plan
      setMealPlan(prev => ({
        ...prev,
        [dateKey]: {
          ...prev[dateKey],
          meals: {
            ...prev[dateKey].meals,
            [mealType]: {
              ...recipe,
              servings,
              notes
            }
          }
        }
      }));
      
      setSuccess(`${recipe.title} added to ${mealType} on ${formatDateWithDay(date)}!`);
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      setError('Failed to add recipe to meal plan');
      console.error('Error adding recipe:', error);
    }
  };

  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe)
    setShowAddRecipe(true)
  }

  const navigateWeek = (direction) => {
    const newWeek = direction === 'next' 
      ? getNextWeek(currentWeek.start) 
      : getPreviousWeek(currentWeek.start);
      
    setCurrentWeek(newWeek);
    
    // Update meal plan structure for new week
    const weekDates = getWeekDates(newWeek.start);
    const newMealPlan = createWeekMealPlanStructure(weekDates);
    
    // Load existing meal plan data if available
    if (user) {
      const weekKey = `mealPlan_${user}_${formatDateString(newWeek.start)}`;
      const storedData = localStorage.getItem(weekKey);
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setMealPlan(parsedData);
          return;
        } catch (error) {
          console.error('Error parsing stored meal plan:', error);
        }
      }
    }
    
    setMealPlan(newMealPlan);
    
    // Update grocery date range
    setGroceryDateRange({
      start: formatDateString(newWeek.start),
      end: formatDateString(newWeek.end)
    });
  };

  const handleGroceryDownload = (dateRange) => {
    // Debug logging
    const debugMode = window.location.search.includes('debug=true');
    
    if (debugMode) {
      console.log('📥 handleGroceryDownload called with dateRange:', dateRange);
      console.log('📋 Current UI grocery list:', groceryList);
      console.log('📅 Current meal plan keys:', Object.keys(mealPlan));
    }
    
    // Extract fresh grocery list with date range filter
    const extractedGroceryList = extractGroceryList(mealPlan, dateRange);
    
    if (debugMode) {
      console.log('🔍 Extracted grocery list for download:', extractedGroceryList);
      console.log('📊 Comparison - UI list length:', groceryList.length, 'Download list length:', extractedGroceryList.length);
    }
    
    // If download list is empty but UI list has items, there might be a date range issue
    if (extractedGroceryList.length === 1 && extractedGroceryList[0].includes('No meals') && groceryList.length > 1) {
      if (debugMode) {
        console.log('⚠️ Date range issue detected - using UI grocery list instead');
      }
      // Use the UI grocery list that's working
      downloadGroceryList(groceryList, user, dateRange);
    } else {
      downloadGroceryList(extractedGroceryList, user, dateRange);
    }
  };

  const clearMealPlan = () => {
    const weekDates = getWeekDates(currentWeek.start);
    const emptyPlan = createWeekMealPlanStructure(weekDates);
    setMealPlan(emptyPlan);
    setShowDeleteConfirm(false);
  }

  const deleteAccount = () => {
    const users = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || '{}')
    delete users[user]
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users))
    localStorage.removeItem('mealPlannerApp.lastUser')
    
    // Clean up meal plan data
    const weekKey = `mealPlan_${user}_${formatDateString(currentWeek.start)}`;
    localStorage.removeItem(weekKey);
    
    setUser(null)
    setShowDeleteConfirm(false)
  }

  const savePreferences = (newPreferences) => {
    setPreferences(newPreferences)
    // Auto-filter recipes based on new preferences
    if (newPreferences.dietaryRestrictions.length > 0) {
      setActiveFilter(newPreferences.dietaryRestrictions[0])
    }
  }

  // Filter recipes by diet
  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const matchesDiet = activeFilter === 'All' || (recipe.diet && recipe.diet.includes(activeFilter))
      return matchesDiet
    })
  }, [recipes, activeFilter])

  const groceryList = useMemo(() => extractGroceryList(mealPlan), [mealPlan])
  const nutrition = useMemo(() => calculateNutrition(mealPlan), [mealPlan])

  if (!user) {
    return (
      <>
        <GlobalStyles />
        <InstallButton />
        <AuthForm onLogin={setUser} />
      </>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <div className="meal-planner-app">
      <InstallButton />
      <NavBar user={user} />
      
      <main className="main-content">
        <DragDropContext>
          <section className="calendar-section">
            {/* Week Navigation */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1rem',
              background: '#f0f8ff',
              padding: '1rem',
              borderRadius: '0.5rem',
              border: '2px solid #4a90e2'
            }}>
              <button
                className="filter-btn"
                onClick={() => navigateWeek('prev')}
                style={{ background: '#4a90e2', color: 'white', border: '2px solid #4a90e2' }}
              >
                ← Previous Week
              </button>
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ margin: '0 0 0.25rem 0', color: '#4a90e2' }}>
                  📅 Week of {formatDateWithDay(currentWeek.start)}
                </h2>
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                  {formatDateWithDay(currentWeek.start)} - {formatDateWithDay(currentWeek.end)}
                </p>
              </div>
              <button
                className="filter-btn"
                onClick={() => navigateWeek('next')}
                style={{ background: '#4a90e2', color: 'white', border: '2px solid #4a90e2' }}
              >
                Next Week →
              </button>
            </div>
            
            {error && <div style={{ color: 'red', marginBottom: 8, background: '#fff3f3', padding: '0.5rem', borderRadius: '0.25rem' }}>{error}</div>}
            {success && <div style={{ color: 'green', marginBottom: 8, background: '#f3fff3', padding: '0.5rem', borderRadius: '0.25rem' }}>{success}</div>}
            
            {/* Nutrition Summary */}
            <div className="nutrition-summary" style={{ 
              background: '#f0f8ff', 
              padding: '1rem', 
              borderRadius: '0.5rem', 
              marginBottom: '1rem',
              border: '1px solid #d0e7ff'
            }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#234567' }}>Weekly Nutrition Summary</h3>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ background: 'white', padding: '0.5rem', borderRadius: '0.25rem', minWidth: '80px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>Calories</div>
                  <div style={{ fontWeight: 'bold', color: '#234567' }}>{nutrition.weeklyTotal.calories}</div>
                </div>
                <div style={{ background: 'white', padding: '0.5rem', borderRadius: '0.25rem', minWidth: '80px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>Protein</div>
                  <div style={{ fontWeight: 'bold', color: '#234567' }}>{nutrition.weeklyTotal.protein}g</div>
                </div>
                <div style={{ background: 'white', padding: '0.5rem', borderRadius: '0.25rem', minWidth: '80px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>Fat</div>
                  <div style={{ fontWeight: 'bold', color: '#234567' }}>{nutrition.weeklyTotal.fat}g</div>
                </div>
                <div style={{ background: 'white', padding: '0.5rem', borderRadius: '0.25rem', minWidth: '80px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#666' }}>Carbs</div>
                  <div style={{ fontWeight: 'bold', color: '#234567' }}>{nutrition.weeklyTotal.carbs}g</div>
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="calendar-grid">
              {Object.entries(mealPlan).map(([dateKey, dayData]) => (
                <div 
                  className={`calendar-day ${dayData.isToday ? 'today' : ''}`} 
                  key={dateKey}
                  style={{
                    border: dayData.isToday ? '3px solid #4a90e2' : '1px solid #ddd',
                    background: dayData.isToday ? '#f0f8ff' : 'white'
                  }}
                >
                  <h3 style={{ 
                    color: dayData.isToday ? '#4a90e2' : 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    {dayData.isToday && '🌟'} {dayData.dayName}
                    <span style={{ fontSize: '0.7rem', fontWeight: 'normal', color: '#666' }}>
                      {new Date(dayData.date).getDate()}
                    </span>
                  </h3>
                  
                  {/* Daily Nutrition */}
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: '#666', 
                    marginBottom: '0.5rem',
                    background: '#f9f9f9',
                    padding: '0.25rem',
                    borderRadius: '0.25rem'
                  }}>
                    {nutrition.dailyNutrition.find(d => d.date === dateKey)?.calories || 0} cal | {nutrition.dailyNutrition.find(d => d.date === dateKey)?.protein || 0}g protein
                  </div>
                  
                  <ul className="meals-list">
                    {mealTypes.map((mealType) => (
                      <li
                        key={mealType}
                        className="meal-cell"
                        style={{
                          minHeight: 60,
                          cursor: 'pointer',
                          marginBottom: 6,
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0.5rem',
                          border: '1px dashed #ddd',
                          borderRadius: '0.25rem',
                          background: dayData.meals[mealType] ? '#f8f9fa' : 'transparent'
                        }}
                        onClick={() => {
                          // Allow users to click to remove meals
                          if (dayData.meals[mealType]) {
                            const updatedMealPlan = { ...mealPlan };
                            updatedMealPlan[dateKey].meals[mealType] = null;
                            setMealPlan(updatedMealPlan);
                            setSuccess(`${mealType} removed from ${dayData.dayName}`)
                            setTimeout(() => setSuccess(''), 2000);
                          }
                        }}
                      >
                        {dayData.meals[mealType] ? (
                          <div className="mini-recipe" style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                            <img 
                              src={dayData.meals[mealType].image} 
                              alt={dayData.meals[mealType].title} 
                              style={{ width: 32, height: 32, borderRadius: 4, marginRight: 8 }} 
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                                {dayData.meals[mealType].title}
                              </div>
                              {dayData.meals[mealType].nutrition && (
                                <div style={{ fontSize: '0.7rem', color: '#666' }}>
                                  {dayData.meals[mealType].nutrition.calories} cal
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: '#bbb', fontSize: '0.9rem' }}>
                            + Add {mealType}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
          
          <section className="recipe-section">
            <h2>🍽️ Recipe Search & Filter</h2>
            
            {/* Search and Filter Controls */}
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="🔍 Search recipes from TheMealDB..."
                className="recipe-search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ marginBottom: '1rem' }}
              />
              
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <button
                  className={`filter-btn${activeFilter === 'All' ? ' active' : ''}`}
                  onClick={() => setActiveFilter('All')}
                >
                  All
                </button>
                {dietFilters.map(filter => (
                  <button
                    key={filter}
                    className={`filter-btn${activeFilter === filter ? ' active' : ''}`}
                    onClick={() => setActiveFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <button
                  className={`filter-btn${activeCategory === '' ? ' active' : ''}`}
                  onClick={() => handleCategoryChange('')}
                >
                  All Categories
                </button>
                {availableCategories.slice(0, 8).map(category => (
                  <button
                    key={category.strCategory || category}
                    className={`filter-btn${activeCategory === (category.strCategory || category) ? ' active' : ''}`}
                    onClick={() => handleCategoryChange(category.strCategory || category)}
                  >
                    {category.strCategory || category}
                  </button>
                ))}
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button
                  className="filter-btn"
                  style={{ background: '#1976d2', color: 'white' }}
                  onClick={searchRecipes}
                  disabled={loadingRecipes}
                >
                  {loadingRecipes ? '🔄 Searching...' : '🔍 Search Recipes'}
                </button>
                <span style={{ fontSize: '0.9rem', color: '#666' }}>
                  {filteredRecipes.length} recipes found
                </span>
              </div>
            </div>

            {/* Recipe Results */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              {loadingRecipes ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                  <p>Loading delicious recipes...</p>
                </div>
              ) : filteredRecipes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🍽️</div>
                  <p>No recipes found. Try different search terms or filters!</p>
                </div>
              ) : (
                filteredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    image={recipe.image}
                    title={recipe.title}
                    ingredients={recipe.ingredients}
                    nutrition={recipe.nutrition}
                    onAdd={() => handleRecipeClick(recipe)}
                  />
                ))
              )}
            </div>
          </section>
          
          <aside className="grocery-list-section">
            <h2>🛒 Grocery List</h2>
            <button 
              className="filter-btn" 
              style={{ 
                width: '100%', 
                marginBottom: '1rem',
                background: '#66bb6a',
                color: 'white',
                border: '2px solid #66bb6a'
              }}
              onClick={() => setShowGroceryDownload(true)}
              disabled={groceryList.length === 0}
            >
              📥 Download Grocery List
            </button>
            <ul className="grocery-list">
              {groceryList.length === 0 ? (
                <li style={{ color: '#bbb' }}>No ingredients yet - add some meals!</li>
              ) : (
                groceryList.map((item, idx) => <li key={idx}>{item}</li>)
              )}
            </ul>
          </aside>
        </DragDropContext>
      </main>
      
      {/* All Modals */}
      <SettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        preferences={preferences}
        onSavePreferences={savePreferences}
      />
      
      <AddRecipeModal
        isOpen={showAddRecipe}
        onClose={() => setShowAddRecipe(false)}
        recipe={selectedRecipe}
        onAddRecipe={handleAddRecipe}
      />
      
      <GroceryDownloadModal
        isOpen={showGroceryDownload}
        onClose={() => setShowGroceryDownload(false)}
        onDownload={handleGroceryDownload}
        currentMealPlan={mealPlan}
      />
      
      <HistoricalDataModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        user={user}
      />
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="delete-modal">
          <div className="delete-content">
            <h3>Delete Options</h3>
            <p>What would you like to delete?</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button className="filter-btn" onClick={clearMealPlan}>
                Clear Meal Plan
              </button>
              <button className="filter-btn" onClick={deleteAccount}>
                Delete Account
              </button>
              <button className="filter-btn" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </ThemeProvider>
  )
}

export default App