import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema({
  // TheMealDB Integration Fields
  mealDbId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  
  // Basic Recipe Information
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  // Flexible ingredients - can be simple array for TheMealDB or detailed for custom recipes
  ingredients: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  
  // Detailed ingredients for custom recipes
  detailedIngredients: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: String,
      trim: true
    },
    unit: {
      type: String,
      trim: true
    }
  }],
  
  tags: [{
    type: String,
    trim: true
  }],
  
  // Diet information from TheMealDB or custom
  diet: [{
    type: String,
    enum: ['Vegan', 'Vegetarian', 'Gluten-Free', 'Keto', 'Low-Carb', 'High-Protein', 'Quick', 'Budget-Friendly'],
    trim: true
  }],
  
  instructions: {
    type: String,
    trim: true
  },
  
  // TheMealDB specific fields
  category: {
    type: String,
    trim: true
  },
  
  area: {
    type: String,
    trim: true
  },
  
  youtubeUrl: {
    type: String,
    trim: true
  },
  
  source: {
    type: String,
    trim: true
  },
  
  // Nutrition information
  nutrition: {
    calories: {
      type: Number,
      min: 0,
      default: 0
    },
    protein: {
      type: Number,
      min: 0,
      default: 0
    },
    fat: {
      type: Number,
      min: 0,
      default: 0
    },
    carbs: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  
  prepTime: {
    type: Number, // in minutes
    min: 0
  },
  
  cookTime: {
    type: Number, // in minutes
    min: 0
  },
  
  servings: {
    type: Number,
    min: 1,
    default: 4
  },
  
  image: {
    type: String,
    trim: true
  },
  
  // Source tracking
  dataSource: {
    type: String,
    enum: ['themealdb', 'custom', 'imported'],
    default: 'custom'
  },
  
  // User management
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  isPublic: {
    type: Boolean,
    default: true
  },
  
  // Cache management for API data
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for search functionality
recipeSchema.index({ title: 'text', tags: 'text', category: 'text', area: 'text' });
recipeSchema.index({ mealDbId: 1 });
recipeSchema.index({ dataSource: 1 });
recipeSchema.index({ category: 1 });
recipeSchema.index({ area: 1 });
recipeSchema.index({ 'diet': 1 });

// Static methods for TheMealDB integration
recipeSchema.statics.createFromTheMealDB = function(mealData) {
  // Helper to parse ingredients from TheMealDB format
  const parseIngredients = (meal) => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      
      if (ingredient && ingredient.trim()) {
        const ingredientStr = measure && measure.trim() 
          ? `${measure.trim()} ${ingredient.trim()}`
          : ingredient.trim();
        ingredients.push(ingredientStr);
      }
    }
    return ingredients;
  };

  // Extract diet information
  const diet = [];
  if (mealData.strCategory === 'Vegetarian') diet.push('Vegetarian');
  if (mealData.strCategory === 'Vegan') diet.push('Vegan');
  if (mealData.strTags) {
    const tags = mealData.strTags.split(',').map(tag => tag.trim());
    tags.forEach(tag => {
      if (['Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Low-Carb', 'High-Protein'].includes(tag)) {
        if (!diet.includes(tag)) diet.push(tag);
      }
    });
  }

  // Estimate nutrition based on category and ingredients
  const estimateNutrition = (ingredients, category) => {
    let baseCalories = 300;
    let baseProtein = 15;
    let baseFat = 10;
    let baseCarbs = 30;

    // Adjust based on category
    switch (category) {
      case 'Chicken':
        baseCalories += 150; baseProtein += 20; baseFat += 5;
        break;
      case 'Beef':
        baseCalories += 200; baseProtein += 25; baseFat += 10;
        break;
      case 'Seafood':
        baseCalories += 100; baseProtein += 25; baseFat += 3;
        break;
      case 'Vegetarian':
      case 'Vegan':
        baseCalories += 50; baseProtein += 5; baseCarbs += 20;
        break;
      case 'Dessert':
        baseCalories += 250; baseFat += 15; baseCarbs += 40;
        break;
      case 'Pasta':
        baseCalories += 200; baseCarbs += 50;
        break;
    }

    // Adjust based on ingredients
    const ingredientText = ingredients.join(' ').toLowerCase();
    if (ingredientText.includes('cheese')) {
      baseCalories += 80; baseFat += 6; baseProtein += 5;
    }
    if (ingredientText.includes('oil') || ingredientText.includes('butter')) {
      baseCalories += 100; baseFat += 11;
    }
    if (ingredientText.includes('rice') || ingredientText.includes('pasta')) {
      baseCalories += 150; baseCarbs += 30;
    }

    return {
      calories: Math.round(baseCalories),
      protein: Math.round(baseProtein),
      fat: Math.round(baseFat),
      carbs: Math.round(baseCarbs)
    };
  };

  const ingredients = parseIngredients(mealData);
  const nutrition = estimateNutrition(ingredients, mealData.strCategory);

  return new this({
    mealDbId: mealData.idMeal,
    title: mealData.strMeal,
    ingredients: ingredients,
    instructions: mealData.strInstructions,
    category: mealData.strCategory,
    area: mealData.strArea,
    tags: mealData.strTags ? mealData.strTags.split(',').map(tag => tag.trim()) : [],
    diet: diet,
    nutrition: nutrition,
    image: mealData.strMealThumb,
    youtubeUrl: mealData.strYoutube,
    source: mealData.strSource,
    dataSource: 'themealdb',
    isPublic: true,
    lastUpdated: new Date()
  });
};

// Find or create recipe from TheMealDB data
recipeSchema.statics.findOrCreateFromTheMealDB = async function(mealData) {
  try {
    // Check if recipe already exists
    let recipe = await this.findOne({ mealDbId: mealData.idMeal });
    
    if (recipe) {
      // Update existing recipe if data has changed
      const shouldUpdate = new Date() - recipe.lastUpdated > 24 * 60 * 60 * 1000; // Update if older than 24 hours
      if (shouldUpdate) {
        const updatedRecipe = this.createFromTheMealDB(mealData);
        Object.assign(recipe, updatedRecipe.toObject());
        recipe.lastUpdated = new Date();
        await recipe.save();
      }
      return recipe;
    }
    
    // Create new recipe
    recipe = this.createFromTheMealDB(mealData);
    await recipe.save();
    return recipe;
  } catch (error) {
    console.error('Error in findOrCreateFromTheMealDB:', error);
    throw error;
  }
};

// Get simplified ingredient list (for display)
recipeSchema.methods.getSimpleIngredients = function() {
  if (Array.isArray(this.ingredients)) {
    return this.ingredients;
  }
  if (this.detailedIngredients && this.detailedIngredients.length > 0) {
    return this.detailedIngredients.map(ing => {
      return ing.amount && ing.unit 
        ? `${ing.amount} ${ing.unit} ${ing.name}`
        : ing.name;
    });
  }
  return [];
};

// Get total preparation time
recipeSchema.virtual('totalTime').get(function() {
  return (this.prepTime || 0) + (this.cookTime || 0);
});

// Ensure virtual fields are serialized
recipeSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Recipe', recipeSchema);
