# 🍽️ Meal Planner App

A modern, responsive meal planning application built with React, Vite, and Express.js. Features drag-and-drop meal planning, nutrition tracking, grocery list generation, and Progressive Web App (PWA) capabilities.

## ✨ Features

### 🗓️ Meal Planning
- **7-day weekly calendar** with drag-and-drop functionality
- **Three meals per day**: Breakfast, Lunch, Dinner
- **Visual meal cards** with images and nutrition info
- **Duplicate prevention** - can't add the same meal twice in one day
- **Input validation** - prevents empty or incomplete meals

### 🥗 Recipe Management
- **Recipe cards** with images, ingredients, and nutrition data
- **Dietary filters**: Vegan, Vegetarian, Gluten-Free, Keto
- **Search functionality** to find specific recipes
- **Nutrition information** for each recipe (calories, protein, fat, carbs)

### 📊 Nutrition Tracking
- **Daily nutrition summary** for each day
- **Weekly nutrition totals** (calories, protein, fat, carbs)
- **Real-time calculations** as you plan meals
- **Visual nutrition display** in meal cards and calendar

### 🛒 Grocery List
- **Automatic ingredient extraction** from planned meals
- **Smart combination** of duplicate ingredients
- **Download functionality** - export as text file
- **Real-time updates** as you modify your meal plan

### ⚙️ User Settings
- **Dietary preferences** management
- **Auto-filtering** based on saved preferences
- **User accounts** with localStorage persistence
- **Password strength validation**
- **Account management** (login, logout, delete)

### 📱 Progressive Web App
- **Installable** on mobile and desktop
- **Offline functionality** with service worker
- **App-like experience** with manifest
- **Background sync** capabilities

### 🔐 Authentication
- **User registration** and login
- **Password confirmation** and strength checking
- **Secure localStorage** storage
- **Session persistence**

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd meal-planner-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## 🌐 Deployment

### Option 1: Netlify (Recommended)
1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Import your repository
4. Set build command: `npm run build`
5. Set publish directory: `dist`

### Option 2: Vercel
1. Install Vercel CLI: `npm install -g vercel`
2. Run: `vercel --prod`
3. Follow the prompts

### Option 3: Quick Deploy Script
```bash
chmod +x deploy.sh
./deploy.sh
```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 🏗️ Project Structure

```
meal-planner-app/
├── public/                 # Static assets
│   ├── manifest.json      # PWA manifest
│   ├── sw.js             # Service worker
│   └── offline.html      # Offline page
├── src/
│   ├── App.jsx           # Main application component
│   ├── RecipeCard.jsx    # Recipe card component
│   ├── RecipeCard.css    # Recipe card styles
│   ├── App.css           # Main app styles
│   └── main.jsx          # App entry point
├── server.js             # Express.js backend
├── routes/               # API routes
├── models/               # Database schemas
├── netlify.toml          # Netlify configuration
└── package.json          # Dependencies and scripts
```

## 🎯 Usage Guide

### Creating Your First Meal Plan

1. **Register/Login**: Create an account or log in
2. **Browse Recipes**: Use filters and search to find meals
3. **Drag & Drop**: Drag recipes to calendar slots
4. **View Nutrition**: Check daily and weekly nutrition totals
5. **Generate List**: View your grocery list automatically
6. **Download**: Export your grocery list as a text file

### Managing Dietary Preferences

1. **Open Settings**: Click the ⚙️ button in the header
2. **Select Restrictions**: Check your dietary needs
3. **Save Preferences**: Your choices will auto-filter recipes
4. **Apply Filters**: Use the filter buttons for quick access

### Using the PWA

1. **Install**: Click the "📱 Install App" button when prompted
2. **Offline Use**: The app works without internet
3. **App-like Experience**: Full-screen, no browser UI

## 🔧 Configuration

### Environment Variables
Create a `.env` file for local development:
```env
VITE_API_URL=http://localhost:3000
```

### PWA Settings
Modify `public/manifest.json` to customize:
- App name and description
- Icons and colors
- Display mode

### Service Worker
Edit `public/sw.js` to customize:
- Caching strategies
- Offline behavior
- Background sync

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Drag and drop meal planning
- [ ] Recipe filtering and search
- [ ] Nutrition calculations
- [ ] Grocery list generation
- [ ] Download functionality
- [ ] Dietary preferences
- [ ] PWA installation
- [ ] Offline functionality
- [ ] Responsive design

### Browser Compatibility
- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

- **Issues**: Create an issue on GitHub
- **Documentation**: Check the code comments
- **Deployment**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🎉 Acknowledgments

- Built with [React](https://reactjs.org/)
- Bundled with [Vite](https://vitejs.dev/)
- Styled with modern CSS
- Deployed with [Netlify](https://netlify.com) or [Vercel](https://vercel.com)

---

**Happy Meal Planning! 🍽️**
