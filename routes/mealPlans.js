import express from 'express';
import MealPlan from '../models/MealPlan.js';
import Recipe from '../models/Recipe.js';
import { getCurrentWeek, getWeekStart, getWeekEnd, formatDateString } from '../utils/dateUtils.js';

const router = express.Router();

// POST /api/meal-plans/add-meal - Add a meal to a specific date
router.post('/add-meal', async (req, res) => {
  try {
    const { userId, date, mealType, recipeId, servings = 1, notes = '' } = req.body;
    
    if (!userId || !date || !mealType || !recipeId) {
      return res.status(400).json({ message: 'userId, date, mealType, and recipeId are required' });
    }
    
    // Validate recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    const mealDate = new Date(date);
    const weekStart = getWeekStart(mealDate);
    
    // Find or create meal plan for this week
    let mealPlan = await MealPlan.findOrCreateWeekPlan(userId, weekStart);
    
    // Add the meal
    mealPlan.addMeal(mealDate, mealType, recipe, servings, notes);
    await mealPlan.save();
    
    res.status(201).json({
      success: true,
      mealPlan: mealPlan,
      message: `${recipe.title} added to ${mealType} on ${formatDateString(mealDate)}`
    });
  } catch (error) {
    console.error('Add meal error:', error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/meal-plans/remove-meal - Remove a meal from a specific date
router.delete('/remove-meal', async (req, res) => {
  try {
    const { userId, date, mealType } = req.query;
    
    if (!userId || !date || !mealType) {
      return res.status(400).json({ message: 'userId, date, and mealType are required' });
    }
    
    const mealDate = new Date(date);
    const weekStart = getWeekStart(mealDate);
    
    // Find meal plan for this week
    const mealPlan = await MealPlan.findOne({
      userId: userId,
      weekStartDate: weekStart
    });
    
    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found for this week' });
    }
    
    // Remove the meal
    mealPlan.removeMeal(mealDate, mealType);
    await mealPlan.save();
    
    res.json({
      success: true,
      mealPlan: mealPlan,
      message: `${mealType} removed from ${formatDateString(mealDate)}`
    });
  } catch (error) {
    console.error('Remove meal error:', error);
    res.status(400).json({ message: error.message });
  }
});

// GET /api/meal-plans/week - Get meal plan for a specific week
router.get('/week', async (req, res) => {
  try {
    const { userId, date } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }
    
    const targetDate = date ? new Date(date) : new Date();
    const weekStart = getWeekStart(targetDate);
    
    let mealPlan = await MealPlan.findOne({
      userId: userId,
      weekStartDate: weekStart
    }).populate('meals.recipe');
    
    if (!mealPlan) {
      // Create empty meal plan for this week
      mealPlan = await MealPlan.findOrCreateWeekPlan(userId, weekStart);
    }
    
    // Get nutrition summary
    const nutritionSummary = mealPlan.getWeeklyNutritionSummary();
    
    res.json({
      mealPlan,
      nutritionSummary,
      weekInfo: {
        start: weekStart,
        end: getWeekEnd(targetDate),
        weekId: mealPlan.weekId
      }
    });
  } catch (error) {
    console.error('Get week meal plan error:', error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/meal-plans/grocery-list - Get grocery list for date range
router.get('/grocery-list', async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }
    
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000); // Default to 7 days
    
    // Find all meal plans that overlap with the date range
    const mealPlans = await MealPlan.find({
      userId: userId,
      $or: [
        {
          weekStartDate: { $lte: end },
          weekEndDate: { $gte: start }
        }
      ]
    });
    
    // Combine grocery lists from all relevant meal plans
    let allIngredients = [];
    mealPlans.forEach(plan => {
      const groceryList = plan.getGroceryList(start, end);
      allIngredients = allIngredients.concat(groceryList);
    });
    
    // Remove duplicates and combine
    const ingredientCount = {};
    allIngredients.forEach(item => {
      const key = item.toLowerCase().trim();
      ingredientCount[key] = (ingredientCount[key] || 0) + 1;
    });
    
    const groceryList = Object.keys(ingredientCount).map(key => {
      const count = ingredientCount[key];
      const name = key.charAt(0).toUpperCase() + key.slice(1);
      return count > 1 ? `${name} (needed ${count} times)` : name;
    });
    
    res.json({
      groceryList,
      dateRange: {
        start: formatDateString(start),
        end: formatDateString(end)
      },
      totalItems: groceryList.length
    });
  } catch (error) {
    console.error('Grocery list error:', error);
    res.status(500).json({ message: error.message });
  }
});

// POST /api/meal-plans/save-plan - Legacy endpoint for backward compatibility
router.post('/save-plan', async (req, res) => {
  try {
    const { userId, weekData, weekStartDate, weekEndDate, notes } = req.body;
    if (!userId || !weekStartDate || !weekEndDate) {
      return res.status(400).json({ message: 'userId, weekStartDate, and weekEndDate are required' });
    }
    // Find if a meal plan for this user and week already exists
    let mealPlan = await MealPlan.findOne({
      userId,
      weekStartDate: new Date(weekStartDate),
      weekEndDate: new Date(weekEndDate)
    });
    if (mealPlan) {
      // Update existing
      mealPlan.weekData = weekData;
      mealPlan.notes = notes;
      await mealPlan.save();
    } else {
      // Create new
      const weekStart = new Date(weekStartDate);
      const weekId = MealPlan.generateWeekId(weekStart);
      mealPlan = new MealPlan({
        userId,
        weekData,
        weekStartDate: weekStart,
        weekEndDate: new Date(weekEndDate),
        weekId,
        notes
      });
      await mealPlan.save();
    }
    res.status(201).json(mealPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/meal-plans - Get user's meal plans
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
    
    const mealPlans = await MealPlan.find(query)
      .populate('userId', 'username profile.firstName profile.lastName')
      .populate('weekData.Breakfast', 'title image ingredients')
      .populate('weekData.Lunch', 'title image ingredients')
      .populate('weekData.Dinner', 'title image ingredients')
      .populate('weekData.Snacks', 'title image ingredients')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ weekStartDate: -1 });
    
    const total = await MealPlan.countDocuments(query);
    
    res.json({
      mealPlans,
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

// GET /api/meal-plans/:id - Get a specific meal plan
router.get('/:id', async (req, res) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id)
      .populate('userId', 'username profile.firstName profile.lastName')
      .populate('weekData.Breakfast', 'title image ingredients tags')
      .populate('weekData.Lunch', 'title image ingredients tags')
      .populate('weekData.Dinner', 'title image ingredients tags')
      .populate('weekData.Snacks', 'title image ingredients tags');
    
    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }
    
    res.json(mealPlan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/meal-plans - Create a new meal plan
router.post('/', async (req, res) => {
  try {
    const { weekData, weekStartDate, weekEndDate, notes } = req.body;
    
    // Validate required fields
    if (!weekStartDate || !weekEndDate) {
      return res.status(400).json({ message: 'Week start and end dates are required' });
    }
    
    const mealPlan = new MealPlan({
      userId: req.user?.id, // Will be set when auth middleware is added
      weekData: weekData || {},
      weekStartDate: new Date(weekStartDate),
      weekEndDate: new Date(weekEndDate),
      notes
    });
    
    const savedMealPlan = await mealPlan.save();
    
    // Populate the saved meal plan before sending response
    const populatedMealPlan = await MealPlan.findById(savedMealPlan._id)
      .populate('weekData.Breakfast', 'title image ingredients')
      .populate('weekData.Lunch', 'title image ingredients')
      .populate('weekData.Dinner', 'title image ingredients')
      .populate('weekData.Snacks', 'title image ingredients');
    
    res.status(201).json(populatedMealPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/meal-plans/:id - Update a meal plan
router.put('/:id', async (req, res) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id);
    
    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }
    
    // Check if user owns the meal plan (when auth is implemented)
    // if (mealPlan.userId.toString() !== req.user.id) {
    //   return res.status(403).json({ message: 'Not authorized' });
    // }
    
    Object.assign(mealPlan, req.body);
    const updatedMealPlan = await mealPlan.save();
    
    // Populate the updated meal plan before sending response
    const populatedMealPlan = await MealPlan.findById(updatedMealPlan._id)
      .populate('weekData.Breakfast', 'title image ingredients')
      .populate('weekData.Lunch', 'title image ingredients')
      .populate('weekData.Dinner', 'title image ingredients')
      .populate('weekData.Snacks', 'title image ingredients');
    
    res.json(populatedMealPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/meal-plans/:id - Delete a meal plan
router.delete('/:id', async (req, res) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id);
    
    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }
    
    // Check if user owns the meal plan (when auth is implemented)
    // if (mealPlan.userId.toString() !== req.user.id) {
    //   return res.status(403).json({ message: 'Not authorized' });
    // }
    
    await mealPlan.remove();
    res.json({ message: 'Meal plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/meal-plans/:id/meal - Add/update a specific meal
router.put('/:id/meal', async (req, res) => {
  try {
    const { day, mealType, recipeId } = req.body;
    
    if (!day || !mealType || !recipeId) {
      return res.status(400).json({ message: 'Day, meal type, and recipe ID are required' });
    }
    
    const mealPlan = await MealPlan.findById(req.params.id);
    
    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }
    
    // Validate recipe exists
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    // Update the specific meal
    if (!mealPlan.weekData.has(day)) {
      mealPlan.weekData.set(day, {});
    }
    
    const dayData = mealPlan.weekData.get(day);
    dayData[mealType] = recipeId;
    mealPlan.weekData.set(day, dayData);
    
    const updatedMealPlan = await mealPlan.save();
    
    // Populate the updated meal plan before sending response
    const populatedMealPlan = await MealPlan.findById(updatedMealPlan._id)
      .populate('weekData.Breakfast', 'title image ingredients')
      .populate('weekData.Lunch', 'title image ingredients')
      .populate('weekData.Dinner', 'title image ingredients')
      .populate('weekData.Snacks', 'title image ingredients');
    
    res.json(populatedMealPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/meal-plans/:id/meal - Remove a specific meal
router.delete('/:id/meal', async (req, res) => {
  try {
    const { day, mealType } = req.query;
    
    if (!day || !mealType) {
      return res.status(400).json({ message: 'Day and meal type are required' });
    }
    
    const mealPlan = await MealPlan.findById(req.params.id);
    
    if (!mealPlan) {
      return res.status(404).json({ message: 'Meal plan not found' });
    }
    
    // Remove the specific meal
    if (mealPlan.weekData.has(day)) {
      const dayData = mealPlan.weekData.get(day);
      delete dayData[mealType];
      mealPlan.weekData.set(day, dayData);
    }
    
    const updatedMealPlan = await mealPlan.save();
    
    // Populate the updated meal plan before sending response
    const populatedMealPlan = await MealPlan.findById(updatedMealPlan._id)
      .populate('weekData.Breakfast', 'title image ingredients')
      .populate('weekData.Lunch', 'title image ingredients')
      .populate('weekData.Dinner', 'title image ingredients')
      .populate('weekData.Snacks', 'title image ingredients');
    
    res.json(populatedMealPlan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router; 