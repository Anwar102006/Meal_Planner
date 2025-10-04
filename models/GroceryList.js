import mongoose from 'mongoose';

const groceryListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mealPlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MealPlan'
  },
  items: [{
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
    },
    category: {
      type: String,
      enum: ['Produce', 'Dairy', 'Meat', 'Pantry', 'Frozen', 'Beverages', 'Other'],
      default: 'Other'
    },
    isChecked: {
      type: Boolean,
      default: false
    },
    estimatedCost: {
      type: Number,
      min: 0
    }
  }],
  totalEstimatedCost: {
    type: Number,
    min: 0,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true
  },
  shoppingDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
groceryListSchema.index({ userId: 1, isActive: 1 });
groceryListSchema.index({ mealPlanId: 1 });

// Method to calculate total cost
groceryListSchema.methods.calculateTotalCost = function() {
  this.totalEstimatedCost = this.items.reduce((total, item) => {
    return total + (item.estimatedCost || 0);
  }, 0);
  return this.totalEstimatedCost;
};

// Pre-save middleware to calculate total cost
groceryListSchema.pre('save', function(next) {
  this.calculateTotalCost();
  next();
});

export default mongoose.model('GroceryList', groceryListSchema); 