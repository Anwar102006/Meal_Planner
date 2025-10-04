import './App.css'
import RecipeCard from './RecipeCard'
import { useState, useMemo, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import axios from 'axios'
import { getCurrentWeek, getWeekDates, formatDateString, formatDateWithDay, isToday, getWeekStart, parseDate } from '../utils/dateUtils.js'
import AddRecipeModal from './components/AddRecipeModal.jsx'
import GroceryDownloadModal from './components/GroceryDownloadModal.jsx'
import AddRecipeModal from './components/AddRecipeModal'
import GroceryDownloadModal from './components/GroceryDownloadModal'

// TheMealDB API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Available filters from TheMealDB
const mealTypes = ['Breakfast', 'Lunch', 'Dinner']
const dietFilters = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Keto']
const availableCategories = [
  'Beef', 'Chicken', 'Dessert', 'Lamb', 'Miscellaneous',
  'Pasta', 'Pork', 'Seafood', 'Side', 'Starter', 'Vegan', 'Vegetarian', 'Breakfast', 'Goat'
];
const availableAreas = [
  'American', 'British', 'Canadian', 'Chinese', 'Croatian', 'Dutch', 'Egyptian',
  'Filipino', 'French', 'Greek', 'Indian', 'Irish', 'Italian', 'Jamaican',
  'Japanese', 'Kenyan', 'Malaysian', 'Mexican', 'Moroccan', 'Polish',
  'Portuguese', 'Russian', 'Spanish', 'Thai', 'Tunisian', 'Turkish',
  'Ukrainian', 'Uruguayan', 'Vietnamese'
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
  const allIngredients = [];
  
  Object.values(mealPlan).forEach(dayData => {
    // Skip if date range is specified and this date is outside the range
    if (dateRange && dateRange.start && dateRange.end) {
      const dayDate = new Date(dayData.date);
      if (dayDate < new Date(dateRange.start) || dayDate > new Date(dateRange.end)) {
        return;
      }
    }
    
    Object.values(dayData.meals || {}).forEach(meal => {
      if (meal && meal.ingredients) {
        allIngredients.push(...meal.ingredients);
      }
    });
  });
  
  // Combine duplicates
  const ingredientCount = {};
  allIngredients.forEach(item => {
    const key = item.trim().toLowerCase();
    ingredientCount[key] = (ingredientCount[key] || 0) + 1;
  });
  
  // Output clean list (capitalize first letter)
  return Object.keys(ingredientCount).map(key => {
    const count = ingredientCount[key];
    const name = key.charAt(0).toUpperCase() + key.slice(1);
    return count > 1 ? `${name} x${count}` : name;
  });
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
  const dateInfo = dateRange 
    ? `Date Range: ${dateRange.start} to ${dateRange.end}`
    : `Date: ${new Date().toLocaleDateString()}`;
    
  const content = `Meal Planner - Grocery List
Generated for: ${user}
${dateInfo}

${groceryList.map(item => `• ${item}`).join('\n')}

Total items: ${groceryList.length}

Generated by Meal Planner App`;

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  
  const filename = dateRange 
    ? `grocery-list-${dateRange.start}-to-${dateRange.end}.txt`
    : `grocery-list-${new Date().toISOString().split('T')[0]}.txt`;
    
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const USER_STORAGE_KEY = 'mealPlannerApp.users'
const MEAL_PLAN_STORAGE_KEY = 'mealPlannerApp.mealPlan'
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
      users[username] = { 
        password,
        createdAt: new Date().toISOString(),
        mealPlan: Array(7).fill(null).map(() => ({ Breakfast: null, Lunch: null, Dinner: null }))
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
  const [availableAreas, setAvailableAreas] = useState([])
  
  // Search and filtering
  const [activeFilter, setActiveFilter] = useState('All')
  const [activeCategory, setActiveCategory] = useState('')
  const [activeArea, setActiveArea] = useState('')
  const [search, setSearch] = useState('')
  
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

  useEffect(() => {
    if (user) {
      // Save meal plan to localStorage for this user
      const users = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || '{}')
      users[user] = users[user] || {}
      users[user].mealPlan = mealPlan
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users))
      localStorage.setItem('mealPlannerApp.lastUser', user)
    }
  }, [mealPlan, user])

  useEffect(() => {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
  }, [preferences])

  // Load initial recipes from Spoonacular on app startup
  useEffect(() => {
    if (user && recipes.length <= 5) { // Only load if we have few recipes
      fetchMoreRecipes();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const getCellId = (dayIdx, mealType) => `cell-${dayIdx}-${mealType}`

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result
    console.log('Drag ended:', { source, destination, draggableId })
    
    if (!destination) {
      console.log('No destination, drag cancelled')
      return
    }
    
    if (destination.droppableId.startsWith('cell-')) {
      const [ , dayIdx, mealType ] = destination.droppableId.split('-')
      console.log('Dropping into:', { dayIdx, mealType })
      
      const recipe = recipes.find(r => r.id === draggableId)
      if (!recipe) {
        setError('Invalid recipe. Please try again.')
        return
      }
      
      // Prevent duplicate meals in a day
      const dayMeals = mealPlan[Number(dayIdx)]
      const isDuplicate = Object.values(dayMeals).some(meal => meal && meal.id === recipe.id)
      if (isDuplicate) {
        setError('This meal is already planned for this day.')
        return
      }
      
      // Prevent empty meal slots (recipe must have title and ingredients)
      if (!recipe.title || !Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
        setError('Cannot add an incomplete meal.')
        return
      }
      
      setMealPlan(prev => {
        const updated = prev.map((day, idx) =>
          idx === Number(dayIdx) ? { ...day, [mealType]: recipe } : day
        )
        return updated
      })
      
      setError('')
      setSuccess(`${recipe.title} added to ${daysOfWeek[Number(dayIdx)]} ${mealType}!`)
      // Show success message
      setTimeout(() => {
        setSuccess('')
      }, 3000)
    }
  }

  // Click to add functionality
  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe)
    setShowAddRecipe(true)
  }

  const handleAddRecipe = (recipe, dayIdx, mealType) => {
    // Check for duplicates
    const dayMeals = mealPlan[dayIdx]
    const isDuplicate = Object.values(dayMeals).some(meal => meal && meal.id === recipe.id)
    if (isDuplicate) {
      setError('This meal is already planned for this day.')
      return
    }
    
    // Add the recipe
    setMealPlan(prev => {
      const updated = prev.map((day, idx) =>
        idx === dayIdx ? { ...day, [mealType]: recipe } : day
      )
      return updated
    })
    
    setError('')
    setSuccess(`${recipe.title} added to ${daysOfWeek[Number(dayIdx)]} ${mealType}!`)
    // Show success message
    setTimeout(() => {
      setSuccess('')
    }, 3000)
  }

  const clearMealPlan = () => {
    setMealPlan(Array(7).fill(null).map(() => ({ Breakfast: null, Lunch: null, Dinner: null })))
    setShowDeleteConfirm(false)
  }

  const deleteAccount = () => {
    const users = JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || '{}')
    delete users[user]
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users))
    localStorage.removeItem('mealPlannerApp.lastUser')
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

  // Filter recipes by diet and search
  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const matchesDiet = activeFilter === 'All' || (recipe.diet && recipe.diet.includes(activeFilter))
      const matchesSearch = recipe.title.toLowerCase().includes(search.toLowerCase())
      return matchesDiet && matchesSearch
    })
  }, [recipes, activeFilter, search])

  const groceryList = useMemo(() => extractGroceryList(mealPlan), [mealPlan])
  const nutrition = useMemo(() => calculateNutrition(mealPlan), [mealPlan])

  // Fetch more recipes from Spoonacular
  const fetchMoreRecipes = async () => {
    setLoadingRecipes(true);
    setError('');
    try {
      const res = await axios.get(
        `https://api.spoonacular.com/recipes/random`,
        {
          params: {
            number: 10,
            apiKey: SPOONACULAR_API_KEY,
            addRecipeNutrition: true,
            tags: 'main course' // Get main course recipes
          }
        }
      );
      
      const newRecipes = res.data.recipes.map(r => ({
        id: r.id.toString(),
        image: r.image || 'https://via.placeholder.com/300x200?text=Recipe+Image',
        title: r.title,
        ingredients: r.extendedIngredients ? r.extendedIngredients.map(i => i.original) : [],
        diet: r.diets ? r.diets.map(d => d[0].toUpperCase() + d.slice(1)) : [],
        nutrition: r.nutrition ? {
          calories: Math.round(r.nutrition.nutrients.find(n => n.name === 'Calories')?.amount || 0),
          protein: Math.round(r.nutrition.nutrients.find(n => n.name === 'Protein')?.amount || 0),
          fat: Math.round(r.nutrition.nutrients.find(n => n.name === 'Fat')?.amount || 0),
          carbs: Math.round(r.nutrition.nutrients.find(n => n.name === 'Carbohydrates')?.amount || 0)
        } : { calories: 0, protein: 0, fat: 0, carbs: 0 }
      }));
      
      setRecipes(prev => [...prev, ...newRecipes]);
      setSuccess(`Added ${newRecipes.length} new recipes!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('API Error:', err);
      if (err.response?.status === 402) {
        setError('API quota exceeded. Please try again later or upgrade your plan.');
      } else if (err.response?.status === 401) {
        setError('Invalid API key. Please check your Spoonacular API key.');
      } else {
        setError('Failed to load recipes. Please check your internet connection and try again.');
      }
    }
    setLoadingRecipes(false);
  };

  if (!user) {
    return (
      <>
        <InstallButton />
        <AuthForm onLogin={setUser} />
      </>
    )
  }

  return (
    <div className="meal-planner-app">
      <InstallButton />
      <header className="app-header">
        <h1>Meal Planner</h1>
        <div style={{ float: 'right', marginTop: '-2.5rem', marginRight: '1rem' }}>
          <span style={{ color: '#234567', fontWeight: 'bold', marginRight: 8 }}>Hi, {user}!</span>
          <button className="filter-btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.95rem', marginRight: 8 }} onClick={() => setShowSettings(true)}>
            ⚙️ Settings
          </button>
          <button className="filter-btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.95rem', marginRight: 8 }} onClick={() => { setUser(null) }}>
            Logout
          </button>
          <button className="filter-btn" style={{ padding: '0.3rem 0.8rem', fontSize: '0.95rem' }} onClick={() => setShowDeleteConfirm(true)}>
            Delete
          </button>
        </div>
      </header>
      <main className="main-content">
        <DragDropContext onDragEnd={onDragEnd}>
          <section className="calendar-section">
            <h2>Weekly Calendar</h2>
            {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
            {success && <div style={{ color: 'green', marginBottom: 8 }}>{success}</div>}
            
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

            <div className="calendar-grid">
              {daysOfWeek.map((day, dayIdx) => (
                <div className="calendar-day" key={dayIdx}>
                  <h3>{day}</h3>
                  
                  {/* Daily Nutrition */}
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: '#666', 
                    marginBottom: '0.5rem',
                    background: '#f9f9f9',
                    padding: '0.25rem',
                    borderRadius: '0.25rem'
                  }}>
                    {nutrition.dailyNutrition[dayIdx].calories} cal | {nutrition.dailyNutrition[dayIdx].protein}g protein
                  </div>
                  
                  <ul className="meals-list">
                    {mealTypes.map((mealType) => (
                      <Droppable droppableId={getCellId(dayIdx, mealType)} key={mealType}>
                        {(provided, snapshot) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`meal-cell${snapshot.isDraggingOver ? ' drag-over' : ''}`}
                            style={{
                              minHeight: 60,
                              cursor: 'pointer',
                              marginBottom: 6,
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            {mealPlan[dayIdx][mealType] ? (
                              <div className="mini-recipe">
                                <img src={mealPlan[dayIdx][mealType].image} alt={mealPlan[dayIdx][mealType].title} style={{ width: 32, height: 32, borderRadius: 4, marginRight: 8 }} />
                                <span>{mealPlan[dayIdx][mealType].title}</span>
                                {mealPlan[dayIdx][mealType].nutrition && (
                                  <span style={{ fontSize: '0.7rem', color: '#666', marginLeft: 'auto' }}>
                                    {mealPlan[dayIdx][mealType].nutrition.calories} cal
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span style={{ color: '#bbb' }}>{mealType}</span>
                            )}
                            {provided.placeholder}
                          </li>
                        )}
                      </Droppable>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
          <section className="recipe-section">
            <h2>Recipe Search & Filter</h2>
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
            <input
              type="text"
              placeholder="Search recipes..."
              className="recipe-search"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
              <button
                className="filter-btn"
                style={{ background: '#1976d2', color: 'white', flex: 1 }}
                onClick={fetchMoreRecipes}
                disabled={loadingRecipes}
              >
                {loadingRecipes ? '🔄 Loading...' : '📥 Load More Recipes'}
              </button>
              <span style={{ fontSize: '0.9rem', color: '#666' }}>
                {filteredRecipes.length} recipes available
              </span>
            </div>
            <Droppable droppableId="recipes" isDropDisabled={true}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}
                >
                  {filteredRecipes.map((recipe, idx) => (
                    <Draggable draggableId={recipe.id} index={idx} key={recipe.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            opacity: snapshot.isDragging ? 0.7 : 1,
                          }}
                        >
                          <RecipeCard
                            image={recipe.image}
                            title={recipe.title}
                            ingredients={recipe.ingredients}
                            nutrition={recipe.nutrition}
                            onAdd={() => handleRecipeClick(recipe)}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </section>
          <aside className="grocery-list-section">
            <h2>Grocery List</h2>
            <button 
              className="filter-btn" 
              style={{ 
                width: '100%', 
                marginBottom: '1rem',
                background: '#66bb6a',
                color: 'white'
              }}
              onClick={() => downloadGroceryList(groceryList, user)}
              disabled={groceryList.length === 0}
            >
              📥 Download Grocery List
            </button>
            <ul className="grocery-list">
              {groceryList.length === 0 ? (
                <li style={{ color: '#bbb' }}>No ingredients yet</li>
              ) : (
                groceryList.map((item, idx) => <li key={idx}>{item}</li>)
              )}
            </ul>
          </aside>
        </DragDropContext>
      </main>
      
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        preferences={preferences}
        onSavePreferences={savePreferences}
      />
      
      {/* Add Recipe Modal */}
      <AddRecipeModal
        isOpen={showAddRecipe}
        onClose={() => setShowAddRecipe(false)}
        recipe={selectedRecipe}
        onAddRecipe={handleAddRecipe}
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
  )
}

export default App
