import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import recipesRouter from './routes/recipes.js';
import mealPlansRouter from './routes/mealPlans.js';
import groceryListsRouter from './routes/groceryLists.js';
import usersRouter from './routes/users.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection (optional for TheMealDB API functionality)
if (process.env.MONGODB_URI || process.env.SKIP_MONGODB !== 'true') {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meal-planner')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.warn('MongoDB connection failed:', err.message);
    console.log('Continuing without MongoDB - TheMealDB API will still work');
  });
} else {
  console.log('MongoDB skipped - using TheMealDB API only');
}

// Routes
app.use('/api/recipes', recipesRouter);
app.use('/api/meal-plans', mealPlansRouter);
app.use('/api/grocery-lists', groceryListsRouter);
app.use('/api/users', usersRouter);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Meal Planner API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app; 