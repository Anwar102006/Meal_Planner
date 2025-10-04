import { createGlobalStyle } from 'styled-components'

export const GlobalStyles = createGlobalStyle`
  /* Import Inter font with optimal loading */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  /* CSS Custom Properties for Design System */
  :root {
    /* Color Palette - Light Mode */
    --color-bg-primary: #FAFBFC;
    --color-bg-secondary: #F6F8FA;
    --color-bg-tertiary: #FFFFFF;
    --color-bg-overlay: rgba(255, 255, 255, 0.95);
    --color-bg-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    
    --color-text-primary: #1F2937;
    --color-text-secondary: #4B5563;
    --color-text-tertiary: #6B7280;
    --color-text-muted: #9CA3AF;
    --color-text-inverse: #FFFFFF;
    
    --color-brand-primary: #6366F1;
    --color-brand-primary-hover: #5B21B6;
    --color-brand-primary-light: #EEF2FF;
    --color-brand-secondary: #EC4899;
    --color-brand-secondary-hover: #DB2777;
    --color-brand-secondary-light: #FDF2F8;
    
    --color-semantic-success: #10B981;
    --color-semantic-success-light: #ECFDF5;
    --color-semantic-warning: #F59E0B;
    --color-semantic-warning-light: #FFFBEB;
    --color-semantic-error: #EF4444;
    --color-semantic-error-light: #FEF2F2;
    --color-semantic-info: #3B82F6;
    --color-semantic-info-light: #EFF6FF;
    
    --color-border-primary: #E5E7EB;
    --color-border-secondary: #D1D5DB;
    --color-border-focus: #6366F1;
    --color-border-error: #F87171;
    
    --color-surface-primary: #FFFFFF;
    --color-surface-secondary: #F9FAFB;
    --color-surface-tertiary: #F3F4F6;
    --color-surface-elevated: #FFFFFF;
    --color-surface-glass: rgba(255, 255, 255, 0.8);
    
    /* Typography */
    --font-family-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    --font-family-heading: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --font-family-mono: 'JetBrains Mono', 'Fira Code', Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
    
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.25rem;
    --font-size-2xl: 1.5rem;
    --font-size-3xl: 1.875rem;
    --font-size-4xl: 2.25rem;
    --font-size-5xl: 3rem;
    
    --font-weight-light: 300;
    --font-weight-normal: 400;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;
    --font-weight-extrabold: 800;
    
    --line-height-tight: 1.25;
    --line-height-snug: 1.375;
    --line-height-normal: 1.5;
    --line-height-relaxed: 1.625;
    --line-height-loose: 2;
    
    /* Spacing */
    --spacing-px: 1px;
    --spacing-0: 0;
    --spacing-0_5: 0.125rem;
    --spacing-1: 0.25rem;
    --spacing-1_5: 0.375rem;
    --spacing-2: 0.5rem;
    --spacing-2_5: 0.625rem;
    --spacing-3: 0.75rem;
    --spacing-3_5: 0.875rem;
    --spacing-4: 1rem;
    --spacing-5: 1.25rem;
    --spacing-6: 1.5rem;
    --spacing-7: 1.75rem;
    --spacing-8: 2rem;
    --spacing-9: 2.25rem;
    --spacing-10: 2.5rem;
    --spacing-12: 3rem;
    --spacing-14: 3.5rem;
    --spacing-16: 4rem;
    --spacing-20: 5rem;
    --spacing-24: 6rem;
    --spacing-32: 8rem;
    
    /* Border Radius */
    --radius-none: 0;
    --radius-sm: 0.125rem;
    --radius-base: 0.25rem;
    --radius-md: 0.375rem;
    --radius-lg: 0.5rem;
    --radius-xl: 0.75rem;
    --radius-2xl: 1rem;
    --radius-3xl: 1.5rem;
    --radius-full: 9999px;
    
    /* Shadows */
    --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    --shadow-base: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-md: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --shadow-lg: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    --shadow-xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    --shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
    --shadow-glow: 0 0 20px rgba(99, 102, 241, 0.3);
    --shadow-glow-lg: 0 0 40px rgba(99, 102, 241, 0.4);
    
    /* Transitions */
    --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
    --transition-spring: 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
    
    /* Z-indices */
    --z-hide: -1;
    --z-auto: auto;
    --z-base: 0;
    --z-docked: 10;
    --z-dropdown: 1000;
    --z-sticky: 1100;
    --z-banner: 1200;
    --z-overlay: 1300;
    --z-modal: 1400;
    --z-popover: 1500;
    --z-tooltip: 1800;
  }

  /* Dark Mode Variables */
  [data-theme='dark'] {
    --color-bg-primary: #0F172A;
    --color-bg-secondary: #1E293B;
    --color-bg-tertiary: #334155;
    --color-bg-overlay: rgba(15, 23, 42, 0.95);
    --color-bg-gradient: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
    
    --color-text-primary: #F8FAFC;
    --color-text-secondary: #E2E8F0;
    --color-text-tertiary: #CBD5E1;
    --color-text-muted: #94A3B8;
    --color-text-inverse: #1F2937;
    
    --color-brand-primary: #8B5CF6;
    --color-brand-primary-hover: #A78BFA;
    --color-brand-primary-light: #312E81;
    --color-brand-secondary: #F472B6;
    --color-brand-secondary-hover: #FB7185;
    --color-brand-secondary-light: #701A75;
    
    --color-semantic-success: #34D399;
    --color-semantic-success-light: #064E3B;
    --color-semantic-warning: #FBBF24;
    --color-semantic-warning-light: #78350F;
    --color-semantic-error: #F87171;
    --color-semantic-error-light: #7F1D1D;
    --color-semantic-info: #60A5FA;
    --color-semantic-info-light: #1E3A8A;
    
    --color-border-primary: #374151;
    --color-border-secondary: #4B5563;
    --color-border-focus: #8B5CF6;
    --color-border-error: #F87171;
    
    --color-surface-primary: #1E293B;
    --color-surface-secondary: #334155;
    --color-surface-tertiary: #475569;
    --color-surface-elevated: #334155;
    --color-surface-glass: rgba(30, 41, 59, 0.8);
  }

  /* Base Styles */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
    -webkit-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
  }

  body {
    margin: 0;
    font-family: var(--font-family-primary);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-normal);
    line-height: var(--line-height-normal);
    color: var(--color-text-primary);
    background: var(--color-bg-primary);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    transition: background-color var(--transition-base), color var(--transition-base);
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* Typography Improvements */
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-family-heading);
    font-weight: var(--font-weight-semibold);
    line-height: var(--line-height-tight);
    color: var(--color-text-primary);
    margin-top: 0;
    margin-bottom: var(--spacing-4);
  }

  h1 {
    font-size: var(--font-size-4xl);
    font-weight: var(--font-weight-bold);
  }

  h2 {
    font-size: var(--font-size-3xl);
    font-weight: var(--font-weight-semibold);
  }

  h3 {
    font-size: var(--font-size-2xl);
    font-weight: var(--font-weight-semibold);
  }

  h4 {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-medium);
  }

  h5 {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-medium);
  }

  h6 {
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
  }

  p {
    margin-top: 0;
    margin-bottom: var(--spacing-4);
    color: var(--color-text-secondary);
    line-height: var(--line-height-relaxed);
  }

  /* Links */
  a {
    color: var(--color-brand-primary);
    text-decoration: none;
    transition: color var(--transition-fast);
  }

  a:hover {
    color: var(--color-brand-primary-hover);
  }

  a:focus {
    outline: 2px solid var(--color-brand-primary);
    outline-offset: 2px;
    border-radius: var(--radius-sm);
  }

  /* Form Elements */
  input,
  select,
  textarea {
    font-family: inherit;
    font-size: var(--font-size-base);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-primary);
    padding: var(--spacing-3) var(--spacing-4);
    background: var(--color-surface-primary);
    color: var(--color-text-primary);
    transition: all var(--transition-base);
    width: 100%;
  }

  input:focus,
  textarea:focus,
  select:focus {
    outline: none;
    border-color: var(--color-border-focus);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  input::placeholder,
  textarea::placeholder {
    color: var(--color-text-muted);
  }

  /* Button Base */
  button {
    font-family: inherit;
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    border: none;
    border-radius: var(--radius-lg);
    transition: all var(--transition-base);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-2);
    text-decoration: none;
    user-select: none;
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Focus Styles */
  :focus {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  /* Container Styles */
  .container {
    width: 100%;
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 var(--spacing-6);
  }

  /* Layout Helpers */
  .main-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: var(--spacing-8);
    padding: var(--spacing-8);
    max-width: 1400px;
    margin: 0 auto;
  }

  /* Mobile-first responsive layout */
  @media (max-width: 768px) {
    .main-content {
      grid-template-columns: 1fr;
      padding: var(--spacing-4);
      gap: var(--spacing-6);
    }
  }

  /* Calendar Grid */
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: var(--spacing-4);
  }

  @media (max-width: 1024px) {
    .calendar-grid {
      grid-template-columns: repeat(5, 1fr);
    }
  }

  @media (max-width: 768px) {
    .calendar-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (max-width: 640px) {
    .calendar-grid {
      grid-template-columns: 1fr;
    }
  }

  /* Calendar Day Cards */
  .calendar-day {
    background: var(--color-surface-primary);
    border: 1px solid var(--color-border-primary);
    border-radius: var(--radius-xl);
    padding: var(--spacing-4);
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-base);
    position: relative;
  }

  .calendar-day:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    border-color: var(--color-brand-primary);
  }

  .calendar-day.today {
    border-color: var(--color-brand-primary);
    border-width: 2px;
    background: var(--color-brand-primary-light);
  }

  /* Section Cards */
  .recipe-section,
  .grocery-list-section {
    background: var(--color-surface-primary);
    border: 1px solid var(--color-border-primary);
    border-radius: var(--radius-2xl);
    padding: var(--spacing-6);
    box-shadow: var(--shadow-base);
  }

  /* Filter Buttons */
  .filter-btn {
    border-radius: var(--radius-lg);
    padding: var(--spacing-2_5) var(--spacing-4);
    border: 1px solid var(--color-border-primary);
    background: var(--color-surface-primary);
    color: var(--color-text-secondary);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    cursor: pointer;
    transition: all var(--transition-base);
    text-transform: none;
  }

  .filter-btn:hover {
    background: var(--color-surface-secondary);
    border-color: var(--color-brand-primary);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }

  .filter-btn.active {
    background: var(--color-brand-primary);
    color: var(--color-text-inverse);
    border-color: var(--color-brand-primary);
    box-shadow: var(--shadow-sm);
  }

  /* Lists */
  .meals-list,
  .grocery-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  /* Mini Recipe Cards */
  .mini-recipe {
    display: flex;
    align-items: center;
    gap: var(--spacing-3);
    padding: var(--spacing-2);
    border-radius: var(--radius-lg);
    transition: all var(--transition-base);
  }

  .mini-recipe img {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: var(--radius-md);
  }

  /* Loading Animations */
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }

  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  /* Utility Classes */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Accessibility Improvements */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    :root {
      --color-border-primary: #000000;
      --color-text-primary: #000000;
      --color-bg-primary: #FFFFFF;
    }

    [data-theme='dark'] {
      --color-border-primary: #FFFFFF;
      --color-text-primary: #FFFFFF;
      --color-bg-primary: #000000;
    }
  }
`;

export default GlobalStyles;
