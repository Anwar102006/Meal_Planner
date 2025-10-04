import express from 'express';
import Recipe from '../models/Recipe.js';
import themealdbAPI from '../services/themealdbAPI.js';

const router = express.Router();

// GET /api/recipes/search - Search recipes from TheMealDB API
router.get('/search', async (req, res) => {
  try {
    const { query, category, area, ingredient, limit = 20 } = req.query;
    
    let meals = [];
    
    if (query) {
      meals = await themealdbAPI.searchMealsByName(query);
    } else if (category) {
      meals = await themealdbAPI.getMealsByCategory(category);
    } else if (area) {
      meals = await themealdbAPI.getMealsByArea(area);
    } else if (ingredient) {
      meals = await themealdbAPI.getMealsByIngredient(ingredient);
    } else {
      // Get random meals if no specific search criteria
      meals = await themealdbAPI.getRandomMeals(parseInt(limit));
    }
    
    // Convert TheMealDB format to our format
    const recipes = meals.slice(0, parseInt(limit)).map(meal => themealdbAPI.convertToRecipe(meal));
    
    res.json({
      recipes,
      source: 'themealdb',
      total: recipes.length
    });
  } catch (error) {
    console.error('Recipe search error:', error);
    res.status(500).json({ message: 'Failed to search recipes', error: error.message });
  }
});

// GET /api/recipes/random - Get random recipes from TheMealDB
router.get('/random', async (req, res) => {
  try {
    const { count = 10 } = req.query;
    const meals = await themealdbAPI.getRandomMeals(parseInt(count));
    const recipes = meals.map(meal => themealdbAPI.convertToRecipe(meal));
    
    res.json({
      recipes,
      source: 'themealdb'
    });
  } catch (error) {
    console.error('Random recipes error:', error);
    res.status(500).json({ message: 'Failed to get random recipes', error: error.message });
  }
});

// GET /api/recipes/categories - Get all available categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await themealdbAPI.getCategoryList();
    res.json(categories);
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ message: 'Failed to get categories', error: error.message });
  }
});

// GET /api/recipes/areas - Get all available areas/countries
router.get('/areas', async (req, res) => {
  try {
    const areas = await themealdbAPI.getAreaList();
    res.json(areas);
  } catch (error) {
    console.error('Areas error:', error);
    res.status(500).json({ message: 'Failed to get areas', error: error.message });
  }
});

// GET /api/recipes/ingredients - Get all available ingredients
router.get('/ingredients', async (req, res) => {
  try {
    const ingredients = await themealdbAPI.getIngredientList();
    res.json(ingredients.slice(0, 100)); // Limit to first 100 for performance
  } catch (error) {
    console.error('Ingredients error:', error);
    res.status(500).json({ message: 'Failed to get ingredients', error: error.message });
  }
});

// GET /api/recipes - Get all recipes (local database with optional TheMealDB integration)
router.get('/', async (req, res) => {
  try {
    const { search, tags, category, area, limit = 20, page = 1, source = 'local' } = req.query;
    
    if (source === 'themealdb') {
      // Redirect to search endpoint for TheMealDB data
      return res.redirect(`/api/recipes/search?query=${search || ''}&category=${category || ''}&area=${area || ''}&limit=${limit}`);
    }
    
    // Local database search
    let query = { isPublic: true };
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (tags) {
      const tagArray = tags.split(',');
      query.diet = { $in: tagArray };
    }
    
    if (category) {
      query.category = category;
    }
    
    if (area) {
      query.area = area;
    }
    
    const recipes = await Recipe.find(query)
      .populate('createdBy', 'username profile.firstName profile.lastName')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await Recipe.countDocuments(query);
    
    res.json({
      recipes,
      source: 'local',
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/recipes/:id - Get a specific recipe
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('createdBy', 'username profile.firstName profile.lastName');
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/recipes - Create a new recipe
router.post('/', async (req, res) => {
  try {
    const recipe = new Recipe({
      ...req.body,
      createdBy: req.user?.id // Will be set when auth middleware is added
    });
    
    const savedRecipe = await recipe.save();
    res.status(201).json(savedRecipe);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/recipes/:id - Update a recipe
router.put('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    // Check if user owns the recipe (when auth is implemented)
    // if (recipe.createdBy.toString() !== req.user.id) {
    //   return res.status(403).json({ message: 'Not authorized' });
    // }
    
    Object.assign(recipe, req.body);
    const updatedRecipe = await recipe.save();
    res.json(updatedRecipe);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/recipes/:id - Delete a recipe
router.delete('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    // Check if user owns the recipe (when auth is implemented)
    // if (recipe.createdBy.toString() !== req.user.id) {
    //   return res.status(403).json({ message: 'Not authorized' });
    // }
    
    await recipe.remove();
    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/recipes/tags/all - Get all available tags
router.get('/tags/all', async (req, res) => {
  try {
    const tags = await Recipe.distinct('tags');
    res.json(tags);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 