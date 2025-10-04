import mongoose from 'mongoose';

// Individual meal entry schema for date-based scheduling
const mealEntrySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  dateString: {
    type: String,
    required: true,
    // Format: YYYY-MM-DD
  },
  mealType: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
    required: true
  },
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true
  },
  // Store recipe snapshot for historical accuracy
  recipeSnapshot: {
    title: String,
    image: String,
    ingredients: [String],
    nutrition: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 }
    },
    category: String,
    area: String
  },
  servings: {
    type: Number,
    default: 1,
    min: 1
  },
  notes: {
    type: String,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Main meal plan schema
const mealPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Date-based meal entries
  meals: [mealEntrySchema],
  
  // Week information for grouping and organization
  weekStartDate: {
    type: Date,
    required: true
  },
  
  weekEndDate: {
    type: Date,
    required: true
  },
  
  // Week identifier (YYYY-WW format)
  weekId: {
    type: String,
    required: true
  },
  
  // Legacy support - keep for backward compatibility but mark as deprecated
  weekData: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  notes: {
    type: String,
    trim: true
  },
  
  // Calculated totals (updated automatically)
  totalCalories: {
    type: Number,
    min: 0,
    default: 0
  },
  
  totalCost: {
    type: Number,
    min: 0,
    default: 0
  },
  
  // Shopping list generated flag
  shoppingListGenerated: {
    type: Boolean,
    default: false
  },
  
  // Last shopping list generation date
  lastShoppingListDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient date-based queries
mealPlanSchema.index({ userId: 1, weekStartDate: 1 });
mealPlanSchema.index({ userId: 1, weekEndDate: 1 });
mealPlanSchema.index({ userId: 1, weekId: 1 });
mealPlanSchema.index({ userId: 1, isActive: 1 });
mealPlanSchema.index({ 'meals.date': 1 });
mealPlanSchema.index({ 'meals.dateString': 1 });
mealPlanSchema.index({ 'meals.mealType': 1 });

// Compound indexes for complex queries
mealPlanSchema.index({ userId: 1, 'meals.dateString': 1, 'meals.mealType': 1 });

// Virtual for getting week number
mealPlanSchema.virtual('weekNumber').get(function() {
  const start = new Date(this.weekStartDate);
  const oneJan = new Date(start.getFullYear(), 0, 1);
  return Math.ceil((((start - oneJan) / 86400000) + oneJan.getDay() + 1) / 7);
});

// Virtual for formatted date range
mealPlanSchema.virtual('dateRange').get(function() {
  const start = this.weekStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const end = this.weekEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${start} - ${end}`;
});

// Static method to generate week ID
mealPlanSchema.statics.generateWeekId = function(date) {
  const year = date.getFullYear();
  const start = new Date(year, 0, 1);
  const days = Math.floor((date - start) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((date.getDay() + 1 + days) / 7);
  return `${year}-${weekNumber.toString().padStart(2, '0')}`;
};

// Static method to find or create meal plan for a week
mealPlanSchema.statics.findOrCreateWeekPlan = async function(userId, weekStartDate) {
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekStartDate.getDate() + 6);
  
  const weekId = this.generateWeekId(weekStartDate);
  
  let mealPlan = await this.findOne({
    userId: userId,
    weekId: weekId
  });
  
  if (!mealPlan) {
    mealPlan = new this({
      userId: userId,
      weekStartDate: weekStartDate,
      weekEndDate: weekEndDate,
      weekId: weekId,
      meals: []
    });
    await mealPlan.save();
  }
  
  return mealPlan;
};

// Method to add meal to specific date
mealPlanSchema.methods.addMeal = function(date, mealType, recipe, servings = 1, notes = '') {
  const dateString = date.toISOString().split('T')[0];
  
  // Remove existing meal for this date and meal type
  this.meals = this.meals.filter(meal => 
    !(meal.dateString === dateString && meal.mealType === mealType)
  );
  
  // Create recipe snapshot
  const recipeSnapshot = {
    title: recipe.title,
    image: recipe.image,
    ingredients: recipe.getSimpleIngredients ? recipe.getSimpleIngredients() : recipe.ingredients,
    nutrition: recipe.nutrition || { calories: 0, protein: 0, fat: 0, carbs: 0 },
    category: recipe.category,
    area: recipe.area
  };
  
  // Add new meal
  this.meals.push({
    date: date,
    dateString: dateString,
    mealType: mealType,
    recipe: recipe._id,
    recipeSnapshot: recipeSnapshot,
    servings: servings,
    notes: notes
  });
  
  this.updateTotals();
  return this;
};

// Method to remove meal from specific date
mealPlanSchema.methods.removeMeal = function(date, mealType) {
  const dateString = date.toISOString().split('T')[0];
  
  this.meals = this.meals.filter(meal => 
    !(meal.dateString === dateString && meal.mealType === mealType)
  );
  
  this.updateTotals();
  return this;
};

// Method to get meals for a specific date
mealPlanSchema.methods.getMealsForDate = function(date) {
  const dateString = date.toISOString().split('T')[0];
  return this.meals.filter(meal => meal.dateString === dateString);
};

// Method to get all ingredients for grocery list
mealPlanSchema.methods.getGroceryList = function(startDate = null, endDate = null) {
  let mealsToInclude = this.meals;
  
  // Filter by date range if provided
  if (startDate && endDate) {
    const startString = startDate.toISOString().split('T')[0];
    const endString = endDate.toISOString().split('T')[0];
    
    mealsToInclude = this.meals.filter(meal => 
      meal.dateString >= startString && meal.dateString <= endString
    );
  }
  
  const allIngredients = [];
  
  mealsToInclude.forEach(meal => {
    if (meal.recipeSnapshot && meal.recipeSnapshot.ingredients) {
      meal.recipeSnapshot.ingredients.forEach(ingredient => {
        // Multiply by servings if more than 1
        if (meal.servings > 1) {
          allIngredients.push(`${ingredient} (x${meal.servings})`);
        } else {
          allIngredients.push(ingredient);
        }
      });
    }
  });
  
  // Combine and count duplicates
  const ingredientCount = {};
  allIngredients.forEach(item => {
    const key = item.toLowerCase().trim();
    ingredientCount[key] = (ingredientCount[key] || 0) + 1;
  });
  
  // Return formatted list
  return Object.keys(ingredientCount).map(key => {
    const count = ingredientCount[key];
    const name = key.charAt(0).toUpperCase() + key.slice(1);
    return count > 1 ? `${name} (needed ${count} times)` : name;
  });
};

// Method to update calculated totals
mealPlanSchema.methods.updateTotals = function() {
  let totalCalories = 0;
  
  this.meals.forEach(meal => {
    if (meal.recipeSnapshot && meal.recipeSnapshot.nutrition) {
      const nutrition = meal.recipeSnapshot.nutrition;
      totalCalories += (nutrition.calories || 0) * meal.servings;
    }
  });
  
  this.totalCalories = totalCalories;
  return this;
};

// Method to get nutrition summary by date
mealPlanSchema.methods.getNutritionByDate = function(date = null) {
  let mealsToAnalyze = this.meals;
  
  if (date) {
    const dateString = date.toISOString().split('T')[0];
    mealsToAnalyze = this.meals.filter(meal => meal.dateString === dateString);
  }
  
  const nutrition = { calories: 0, protein: 0, fat: 0, carbs: 0 };
  
  mealsToAnalyze.forEach(meal => {
    if (meal.recipeSnapshot && meal.recipeSnapshot.nutrition) {
      const mealNutrition = meal.recipeSnapshot.nutrition;
      nutrition.calories += (mealNutrition.calories || 0) * meal.servings;
      nutrition.protein += (mealNutrition.protein || 0) * meal.servings;
      nutrition.fat += (mealNutrition.fat || 0) * meal.servings;
      nutrition.carbs += (mealNutrition.carbs || 0) * meal.servings;
    }
  });
  
  return nutrition;
};

// Method to get weekly nutrition summary
mealPlanSchema.methods.getWeeklyNutritionSummary = function() {
  const weekDates = [];
  const current = new Date(this.weekStartDate);
  
  // Get all 7 days of the week
  for (let i = 0; i < 7; i++) {
    weekDates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  const dailyNutrition = weekDates.map(date => ({
    date: date,
    dateString: date.toISOString().split('T')[0],
    nutrition: this.getNutritionByDate(date)
  }));
  
  const weeklyTotal = this.getNutritionByDate(); // All meals in the plan
  
  return {
    dailyNutrition,
    weeklyTotal
  };
};

// Pre-save hook to update totals
mealPlanSchema.pre('save', function(next) {
  this.updateTotals();
  next();
});

// Ensure virtual fields are serialized
mealPlanSchema.set('toJSON', { virtuals: true });

export default mongoose.model('MealPlan', mealPlanSchema);
