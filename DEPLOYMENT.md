# Deployment Guide for Meal Planner App

This guide will help you deploy your Meal Planner app to Netlify or Vercel for free hosting with a public URL.

## Prerequisites

1. A GitHub account
2. Your meal planner app code pushed to a GitHub repository
3. Node.js installed locally (for testing)

## Option 1: Deploy to Netlify (Recommended)

### Step 1: Prepare Your Repository

1. Make sure your code is pushed to a GitHub repository
2. Ensure your `package.json` has the correct build script:
   ```json
   {
     "scripts": {
       "build": "vite build",
       "dev": "vite"
     }
   }
   ```

### Step 2: Deploy via Netlify UI

1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub account
4. Select your meal planner repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Click "Deploy site"

### Step 3: Configure Environment (Optional)

1. In your Netlify dashboard, go to Site settings → Environment variables
2. Add any environment variables if needed
3. Redeploy if you added variables

### Step 4: Custom Domain (Optional)

1. In Site settings → Domain management
2. Add your custom domain or use the provided Netlify subdomain

## Option 2: Deploy to Vercel

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Deploy

1. Navigate to your project directory
2. Run: `vercel`
3. Follow the prompts:
   - Link to existing project? No
   - Project name: meal-planner-app
   - Directory: ./
   - Override settings? No

### Step 3: Configure via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Select your project
3. Go to Settings → General
4. Verify build settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

## Option 3: Deploy via GitHub Actions (Advanced)

### Step 1: Create GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Netlify

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run build
      
    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v1.2
      with:
        publish-dir: './dist'
        production-branch: main
        github-token: ${{ secrets.GITHUB_TOKEN }}
        deploy-message: "Deploy from GitHub Actions"
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### Step 2: Configure Secrets

1. Get your Netlify auth token from Netlify dashboard
2. Get your site ID from Netlify dashboard
3. Add these as GitHub repository secrets

## Testing Your Deployment

After deployment, test these features:

1. ✅ User registration and login
2. ✅ Drag and drop meal planning
3. ✅ Recipe filtering and search
4. ✅ Nutrition summary calculations
5. ✅ Grocery list generation and download
6. ✅ Dietary preferences settings
7. ✅ PWA installation (if supported by browser)
8. ✅ Offline functionality

## Troubleshooting

### Common Issues:

1. **Build fails**: Check your `package.json` and ensure all dependencies are listed
2. **404 errors**: Ensure your `netlify.toml` or Vercel configuration includes SPA redirects
3. **PWA not working**: Verify your `manifest.json` and service worker are in the `public` folder
4. **LocalStorage issues**: These work fine in production

### Performance Optimization:

1. **Enable compression**: Netlify and Vercel do this automatically
2. **Cache headers**: Add to `netlify.toml`:
   ```toml
   [[headers]]
     for = "/assets/*"
     [headers.values]
       Cache-Control = "public, max-age=31536000, immutable"
   ```

## Environment Variables

If you need environment variables:

### Netlify:
- Go to Site settings → Environment variables
- Add key-value pairs
- Access in code with `import.meta.env.VITE_VARIABLE_NAME`

### Vercel:
- Go to Project settings → Environment variables
- Add key-value pairs
- Access in code with `import.meta.env.VITE_VARIABLE_NAME`

## Monitoring and Analytics

1. **Netlify Analytics**: Available in paid plans
2. **Vercel Analytics**: Built-in with deployment
3. **Google Analytics**: Add tracking code to `index.html`

## Security Considerations

1. ✅ No sensitive data in client-side code
2. ✅ User data stored in localStorage (client-side only)
3. ✅ No API keys exposed
4. ✅ HTTPS enabled by default

## Support

- **Netlify Support**: [docs.netlify.com](https://docs.netlify.com)
- **Vercel Support**: [vercel.com/docs](https://vercel.com/docs)
- **Vite Documentation**: [vitejs.dev](https://vitejs.dev)

Your app should now be live and accessible via a public URL! 🎉 