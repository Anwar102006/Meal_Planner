#!/bin/bash

# Meal Planner App Deployment Script
echo "🚀 Deploying Meal Planner App..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "📱 Your app should now be live at the URL provided above"
echo "🔗 You can also access it through your Vercel dashboard" 