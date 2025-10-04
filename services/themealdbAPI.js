import axios from 'axios';

/**
 * TheMealDB API Service
 * Centralizes all API interactions with TheMealDB
 * No API key required - using the free test key '1'
 */
class TheMealDBService {
  constructor() {
    this.baseURL = 'https://www.themealdb.com/api/json/v1/1';
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }

  /**
   * Search meals by name
   * @param {string} name - Meal name to search for
   * @returns {Promise<Array>} Array of meal objects
   */
  async searchMealsByName(name) {
    try {
      const response = await this.api.get(`/search.php?s=${encodeURIComponent(name)}`);
      return response.data.meals || [];
    } catch (error) {
      console.error('Error searching meals by name:', error);
      throw new Error('Failed to search meals by name');
    }
  }

  /**
   * List meals by first letter
   * @param {string} letter - First letter of meal name
   * @returns {Promise<Array>} Array of meal objects
   */
  async getMealsByFirstLetter(letter) {
    try {
      const response = await this.api.get(`/search.php?f=${letter}`);
      return response.data.meals || [];
    } catch (error) {
      console.error('Error getting meals by first letter:', error);
      throw new Error('Failed to get meals by first letter');
    }
  }

  /**
   * Lookup meal details by ID
   * @param {string} id - Meal ID
   * @returns {Promise<Object|null>} Meal object or null if not found
   */
  async getMealById(id) {
    try {
      const response = await this.api.get(`/lookup.php?i=${id}`);
      return response.data.meals ? response.data.meals[0] : null;
    } catch (error) {
      console.error('Error getting meal by ID:', error);
      throw new Error('Failed to get meal details');
    }
  }

  /**
   * Get a random meal
   * @returns {Promise<Object>} Random meal object
   */
  async getRandomMeal() {
    try {
      const response = await this.api.get('/random.php');
      return response.data.meals[0];
    } catch (error) {
      console.error('Error getting random meal:', error);
      throw new Error('Failed to get random meal');
    }
  }

  /**
   * Get multiple random meals
   * @param {number} count - Number of random meals to fetch (default: 10)
   * @returns {Promise<Array>} Array of random meal objects
   */
  async getRandomMeals(count = 10) {
    try {
      const promises = Array(count).fill().map(() => this.getRandomMeal());
      const meals = await Promise.all(promises);
      return meals;
    } catch (error) {
      console.error('Error getting random meals:', error);
      throw new Error('Failed to get random meals');
    }
  }

  /**
   * List all meal categories
   * @returns {Promise<Array>} Array of category objects
   */
  async getCategories() {
    try {
      const response = await this.api.get('/categories.php');
      return response.data.categories || [];
    } catch (error) {
      console.error('Error getting categories:', error);
      throw new Error('Failed to get categories');
    }
  }

  /**
   * Get list of all categories (names only)
   * @returns {Promise<Array>} Array of category names
   */
  async getCategoryList() {
    try {
      const response = await this.api.get('/list.php?c=list');
      return response.data.meals || [];
    } catch (error) {
      console.error('Error getting category list:', error);
      throw new Error('Failed to get category list');
    }
  }

  /**
   * Get list of all areas (countries)
   * @returns {Promise<Array>} Array of area names
   */
  async getAreaList() {
    try {
      const response = await this.api.get('/list.php?a=list');
      return response.data.meals || [];
    } catch (error) {
      console.error('Error getting area list:', error);
      throw new Error('Failed to get area list');
    }
  }

  /**
   * Get list of all ingredients
   * @returns {Promise<Array>} Array of ingredient objects
   */
  async getIngredientList() {
    try {
      const response = await this.api.get('/list.php?i=list');
      return response.data.meals || [];
    } catch (error) {
      console.error('Error getting ingredient list:', error);
      throw new Error('Failed to get ingredient list');
    }
  }

  /**
   * Filter meals by main ingredient
   * @param {string} ingredient - Main ingredient name
   * @returns {Promise<Array>} Array of meal objects
   */
  async getMealsByIngredient(ingredient) {
    try {
      const response = await this.api.get(`/filter.php?i=${encodeURIComponent(ingredient)}`);
      return response.data.meals || [];
    } catch (error) {
      console.error('Error filtering meals by ingredient:', error);
      throw new Error('Failed to filter meals by ingredient');
    }
  }

  /**
   * Filter meals by category
   * @param {string} category - Category name
   * @returns {Promise<Array>} Array of meal objects
   */
  async getMealsByCategory(category) {
    try {
      const response = await this.api.get(`/filter.php?c=${encodeURIComponent(category)}`);
      return response.data.meals || [];
    } catch (error) {
      console.error('Error filtering meals by category:', error);
      throw new Error('Failed to filter meals by category');
    }
  }

  /**
   * Filter meals by area (country)
   * @param {string} area - Area/country name
   * @returns {Promise<Array>} Array of meal objects
   */
  async getMealsByArea(area) {
    try {
      const response = await this.api.get(`/filter.php?a=${encodeURIComponent(area)}`);
      return response.data.meals || [];
    } catch (error) {
      console.error('Error filtering meals by area:', error);
      throw new Error('Failed to filter meals by area');
    }
  }

  /**
   * Parse ingredients from TheMealDB meal object
   * @param {Object} meal - Meal object from TheMealDB
   * @returns {Array} Array of ingredient strings with measurements
   */
  parseIngredients(meal) {
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
  }

  /**
   * Convert TheMealDB meal to our internal recipe format
   * @param {Object} meal - Meal object from TheMealDB
   * @returns {Object} Recipe object in our format
   */
  convertToRecipe(meal) {
    const ingredients = this.parseIngredients(meal);
    
    // Extract diet information from tags and category
    const diet = [];
    if (meal.strCategory === 'Vegetarian') diet.push('Vegetarian');
    if (meal.strCategory === 'Vegan') diet.push('Vegan');
    if (meal.strTags) {
      const tags = meal.strTags.split(',').map(tag => tag.trim());
      tags.forEach(tag => {
        if (['Vegetarian', 'Vegan', 'Gluten-Free', 'Keto'].includes(tag)) {
          if (!diet.includes(tag)) diet.push(tag);
        }
      });
    }

    // Estimate nutrition (TheMealDB doesn't provide nutrition data in free tier)
    // Using rough estimates based on ingredients and meal type
    const estimatedNutrition = this.estimateNutrition(ingredients, meal.strCategory);

    return {
      id: meal.idMeal,
      mealDbId: meal.idMeal,
      title: meal.strMeal,
      image: meal.strMealThumb,
      ingredients: ingredients,
      instructions: meal.strInstructions,
      category: meal.strCategory,
      area: meal.strArea,
      tags: meal.strTags ? meal.strTags.split(',').map(tag => tag.trim()) : [],
      diet: diet,
      nutrition: estimatedNutrition,
      youtubeUrl: meal.strYoutube,
      source: meal.strSource
    };
  }

  /**
   * Estimate nutrition based on ingredients and category
   * @param {Array} ingredients - Array of ingredients
   * @param {string} category - Meal category
   * @returns {Object} Estimated nutrition information
   */
  estimateNutrition(ingredients, category) {
    // Basic nutrition estimation based on category and ingredients
    let baseCalories = 300;
    let baseProtein = 15;
    let baseFat = 10;
    let baseCarbs = 30;

    // Adjust based on category
    switch (category) {
      case 'Chicken':
        baseCalories += 150;
        baseProtein += 20;
        baseFat += 5;
        break;
      case 'Beef':
        baseCalories += 200;
        baseProtein += 25;
        baseFat += 10;
        break;
      case 'Seafood':
        baseCalories += 100;
        baseProtein += 25;
        baseFat += 3;
        break;
      case 'Vegetarian':
      case 'Vegan':
        baseCalories += 50;
        baseProtein += 5;
        baseCarbs += 20;
        break;
      case 'Dessert':
        baseCalories += 250;
        baseFat += 15;
        baseCarbs += 40;
        break;
      case 'Pasta':
        baseCalories += 200;
        baseCarbs += 50;
        break;
    }

    // Adjust based on ingredients
    const ingredientText = ingredients.join(' ').toLowerCase();
    if (ingredientText.includes('cheese')) {
      baseCalories += 80;
      baseFat += 6;
      baseProtein += 5;
    }
    if (ingredientText.includes('oil') || ingredientText.includes('butter')) {
      baseCalories += 100;
      baseFat += 11;
    }
    if (ingredientText.includes('rice') || ingredientText.includes('pasta')) {
      baseCalories += 150;
      baseCarbs += 30;
    }

    return {
      calories: Math.round(baseCalories),
      protein: Math.round(baseProtein),
      fat: Math.round(baseFat),
      carbs: Math.round(baseCarbs)
    };
  }

  /**
   * Search meals with multiple filters
   * @param {Object} options - Search options
   * @param {string} options.query - Search query
   * @param {string} options.category - Category filter
   * @param {string} options.area - Area filter
   * @param {string} options.ingredient - Ingredient filter
   * @returns {Promise<Array>} Array of filtered meal objects
   */
  async searchMeals(options = {}) {
    try {
      const { query, category, area, ingredient } = options;
      
      let meals = [];

      if (query) {
        meals = await this.searchMealsByName(query);
      } else if (category) {
        meals = await this.getMealsByCategory(category);
      } else if (area) {
        meals = await this.getMealsByArea(area);
      } else if (ingredient) {
        meals = await this.getMealsByIngredient(ingredient);
      } else {
        // If no specific filter, get random meals
        meals = await this.getRandomMeals(10);
      }

      return meals;
    } catch (error) {
      console.error('Error in advanced search:', error);
      throw new Error('Failed to search meals');
    }
  }
}

// Create and export a singleton instance
const themealdbAPI = new TheMealDBService();
export default themealdbAPI;