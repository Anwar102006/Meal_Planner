import express from 'express';
import GroceryList from '../models/GroceryList.js';
import MealPlan from '../models/MealPlan.js';
import Recipe from '../models/Recipe.js';

const router = express.Router();

// GET /api/grocery-lists - Get user's grocery lists
router.get('/', async (req, res) => {
  try {
    const { userId, isActive, limit = 10, page = 1 } = req.query;
    
    let query = {};
    
    if (userId) {
      query.userId = userId;
    }
    
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    const groceryLists = await GroceryList.find(query)
      .populate('userId', 'username profile.firstName profile.lastName')
      .populate('mealPlanId', 'weekStartDate weekEndDate')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });
    
    const total = await GroceryList.countDocuments(query);
    
    res.json({
      groceryLists,
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

// GET /api/grocery-lists/:id - Get a specific grocery list
router.get('/:id', async (req, res) => {
  try {
    const groceryList = await GroceryList.findById(req.params.id)
      .populate('userId', 'username profile.firstName profile.lastName')
      .populate('mealPlanId', 'weekStartDate weekEndDate');
    
    if (!groceryList) {
      return res.status(404).json({ message: 'Grocery list not found' });
    }
    
    res.json(groceryList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/grocery-lists - Create a new grocery list
router.post('/', async (req, res) => {
  try {
    const { mealPlanId, items, notes, shoppingDate } = req.body;
    
    const groceryList = new GroceryList({
      userId: req.user?.id, // Will be set when auth middleware is added
      mealPlanId,
      items: items || [],
      notes,
      shoppingDate: shoppingDate ? new Date(shoppingDate) : null
    });
    
    const savedGroceryList = await groceryList.save();
    
    // Populate the saved grocery list before sending response
    const populatedGroceryList = await GroceryList.findById(savedGroceryList._id)
      .populate('mealPlanId', 'weekStartDate weekEndDate');
    
    res.status(201).json(populatedGroceryList);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/grocery-lists/generate - Generate grocery list from meal plan
router.post('/generate', async (req, res) => {
  try {
    const { mealPlanId, userId } = req.body;
    
    if (!mealPlanId) {
      return res.status(400).json({ message: 'Meal plan ID is required' });
    }
    
    // Get the meal plan with populated recipes
    const mealPlan = await MealPlan.findById(mealPlanId)
      .populate('weekData.Breakfast', 'ingredients')
      .populate('weekData.Lunch', 'ingredients')
      .populate('weekData.Dinner', 'ingredients')
      .populate('weekData.Snacks', 'ingredients');
    
    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }
    
    // Extract all ingredients from the meal plan
    const allIngredients = [];
    
    for (const [day, meals] of mealPlan.weekData) {
      for (const [mealType, recipe] of Object.entries(meals)) {
        if (recipe && recipe.ingredients) {
          allIngredients.push(...recipe.ingredients);
        }
      }
    }
    
    // Combine and organize ingredients
    const ingredientMap = new Map();
    
    allIngredients.forEach(ingredient => {
      const key = ingredient.name.toLowerCase().trim();
      if (ingredientMap.has(key)) {
        const existing = ingredientMap.get(key);
        // Combine amounts if possible
        if (existing.amount && ingredient.amount) {
          existing.amount = `${existing.amount} + ${ingredient.amount}`;
        }
      } else {
        ingredientMap.set(key, {
          name: ingredient.name,
          amount: ingredient.amount,
          unit: ingredient.unit,
          category: 'Other'
        });
      }
    });
    
    const items = Array.from(ingredientMap.values());
    
    // Create the grocery list
    const groceryList = new GroceryList({
      userId: userId || req.user?.id,
      mealPlanId,
      items,
      notes: `Generated from meal plan for ${mealPlan.weekStartDate.toDateString()} - ${mealPlan.weekEndDate.toDateString()}`
    });
    
    const savedGroceryList = await groceryList.save();
    
    // Populate the saved grocery list before sending response
    const populatedGroceryList = await GroceryList.findById(savedGroceryList._id)
      .populate('mealPlanId', 'weekStartDate weekEndDate');
    
    res.status(201).json(populatedGroceryList);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// POST /api/grocery-lists/generate-grocery-list - Generate grocery list from meal plan (does not save to DB)
router.post('/generate-grocery-list', async (req, res) => {
  try {
    const { weekData } = req.body;
    if (!weekData) {
      return res.status(400).json({ message: 'weekData is required' });
    }
    // Extract all ingredients from the meal plan
    const allIngredients = [];
    Object.values(weekData).forEach(meals => {
      ['Breakfast', 'Lunch', 'Dinner', 'Snacks'].forEach(mealType => {
        const recipe = meals[mealType];
        if (recipe && recipe.ingredients) {
          allIngredients.push(...recipe.ingredients);
        }
      });
    });
    // Combine and organize ingredients
    const ingredientMap = new Map();
    allIngredients.forEach(ingredient => {
      const key = ingredient.name.toLowerCase().trim();
      if (ingredientMap.has(key)) {
        const existing = ingredientMap.get(key);
        // Combine amounts if possible
        if (existing.amount && ingredient.amount) {
          existing.amount = `${existing.amount} + ${ingredient.amount}`;
        }
      } else {
        ingredientMap.set(key, {
          name: ingredient.name,
          amount: ingredient.amount,
          unit: ingredient.unit,
          category: ingredient.category || 'Other'
        });
      }
    });
    const uniqueIngredients = Array.from(ingredientMap.values());
    res.json({ groceryList: uniqueIngredients });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/grocery-lists/:id - Update a grocery list
router.put('/:id', async (req, res) => {
  try {
    const groceryList = await GroceryList.findById(req.params.id);
    
    if (!groceryList) {
      return res.status(404).json({ message: 'Grocery list not found' });
    }
    
    // Check if user owns the grocery list (when auth is implemented)
    // if (groceryList.userId.toString() !== req.user.id) {
    //   return res.status(403).json({ message: 'Not authorized' });
    // }
    
    Object.assign(groceryList, req.body);
    const updatedGroceryList = await groceryList.save();
    
    // Populate the updated grocery list before sending response
    const populatedGroceryList = await GroceryList.findById(updatedGroceryList._id)
      .populate('mealPlanId', 'weekStartDate weekEndDate');
    
    res.json(populatedGroceryList);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/grocery-lists/:id - Delete a grocery list
router.delete('/:id', async (req, res) => {
  try {
    const groceryList = await GroceryList.findById(req.params.id);
    
    if (!groceryList) {
      return res.status(404).json({ message: 'Grocery list not found' });
    }
    
    // Check if user owns the grocery list (when auth is implemented)
    // if (groceryList.userId.toString() !== req.user.id) {
    //   return res.status(403).json({ message: 'Not authorized' });
    // }
    
    await groceryList.remove();
    res.json({ message: 'Grocery list deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/grocery-lists/:id/items/:itemId - Update a specific item
router.put('/:id/items/:itemId', async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const updates = req.body;
    
    const groceryList = await GroceryList.findById(id);
    
    if (!groceryList) {
      return res.status(404).json({ message: 'Grocery list not found' });
    }
    
    const item = groceryList.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    Object.assign(item, updates);
    const updatedGroceryList = await groceryList.save();
    
    // Populate the updated grocery list before sending response
    const populatedGroceryList = await GroceryList.findById(updatedGroceryList._id)
      .populate('mealPlanId', 'weekStartDate weekEndDate');
    
    res.json(populatedGroceryList);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/grocery-lists/:id/check-all - Check/uncheck all items
router.put('/:id/check-all', async (req, res) => {
  try {
    const { checked } = req.body;
    
    const groceryList = await GroceryList.findById(req.params.id);
    
    if (!groceryList) {
      return res.status(404).json({ message: 'Grocery list not found' });
    }
    
    groceryList.items.forEach(item => {
      item.isChecked = checked;
    });
    
    const updatedGroceryList = await groceryList.save();
    
    // Populate the updated grocery list before sending response
    const populatedGroceryList = await GroceryList.findById(updatedGroceryList._id)
      .populate('mealPlanId', 'weekStartDate weekEndDate');
    
    res.json(populatedGroceryList);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router; 