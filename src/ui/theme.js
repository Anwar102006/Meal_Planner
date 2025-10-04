// Modern Design System for Meal Planner App
// Inspired by leading SaaS apps like Notion, Linear, and Figma

export const theme = {
  fonts: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
    heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace"
  },
  
  // Modern color palette with semantic naming
  colors: {
    light: {
      // Background colors
      bg: {
        primary: '#FAFBFC',
        secondary: '#F6F8FA', 
        tertiary: '#FFFFFF',
        overlay: 'rgba(255, 255, 255, 0.95)',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      },
      
      // Text colors
      text: {
        primary: '#1F2937',
        secondary: '#4B5563',
        tertiary: '#6B7280',
        muted: '#9CA3AF',
        inverse: '#FFFFFF'
      },
      
      // Brand colors
      brand: {
        primary: '#6366F1',
        primaryHover: '#5B21B6',
        primaryLight: '#EEF2FF',
        secondary: '#EC4899',
        secondaryHover: '#DB2777',
        secondaryLight: '#FDF2F8'
      },
      
      // Semantic colors
      semantic: {
        success: '#10B981',
        successLight: '#ECFDF5',
        warning: '#F59E0B',
        warningLight: '#FFFBEB',
        error: '#EF4444',
        errorLight: '#FEF2F2',
        info: '#3B82F6',
        infoLight: '#EFF6FF'
      },
      
      // Border colors
      border: {
        primary: '#E5E7EB',
        secondary: '#D1D5DB',
        focus: '#6366F1',
        error: '#F87171'
      },
      
      // Surface colors
      surface: {
        primary: '#FFFFFF',
        secondary: '#F9FAFB',
        tertiary: '#F3F4F6',
        elevated: '#FFFFFF',
        glass: 'rgba(255, 255, 255, 0.8)'
      }
    },
    
    dark: {
      // Background colors
      bg: {
        primary: '#0F172A',
        secondary: '#1E293B',
        tertiary: '#334155',
        overlay: 'rgba(15, 23, 42, 0.95)',
        gradient: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)'
      },
      
      // Text colors
      text: {
        primary: '#F8FAFC',
        secondary: '#E2E8F0',
        tertiary: '#CBD5E1',
        muted: '#94A3B8',
        inverse: '#1F2937'
      },
      
      // Brand colors (adjusted for dark mode)
      brand: {
        primary: '#8B5CF6',
        primaryHover: '#A78BFA',
        primaryLight: '#312E81',
        secondary: '#F472B6',
        secondaryHover: '#FB7185',
        secondaryLight: '#701A75'
      },
      
      // Semantic colors (dark mode variants)
      semantic: {
        success: '#34D399',
        successLight: '#064E3B',
        warning: '#FBBF24',
        warningLight: '#78350F',
        error: '#F87171',
        errorLight: '#7F1D1D',
        info: '#60A5FA',
        infoLight: '#1E3A8A'
      },
      
      // Border colors
      border: {
        primary: '#374151',
        secondary: '#4B5563',
        focus: '#8B5CF6',
        error: '#F87171'
      },
      
      // Surface colors
      surface: {
        primary: '#1E293B',
        secondary: '#334155',
        tertiary: '#475569',
        elevated: '#334155',
        glass: 'rgba(30, 41, 59, 0.8)'
      }
    }
  },
  
  // Typography scale
  fontSizes: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem'     // 48px
  },
  
  fontWeights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800
  },
  
  lineHeights: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2
  },
  
  // Spacing scale (consistent with Tailwind)
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem', // 2px
    1: '0.25rem',    // 4px
    1.5: '0.375rem', // 6px
    2: '0.5rem',     // 8px
    2.5: '0.625rem', // 10px
    3: '0.75rem',    // 12px
    3.5: '0.875rem', // 14px
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    7: '1.75rem',    // 28px
    8: '2rem',       // 32px
    9: '2.25rem',    // 36px
    10: '2.5rem',    // 40px
    11: '2.75rem',   // 44px
    12: '3rem',      // 48px
    14: '3.5rem',    // 56px
    16: '4rem',      // 64px
    20: '5rem',      // 80px
    24: '6rem',      // 96px
    32: '8rem',      // 128px
    40: '10rem',     // 160px
    48: '12rem',     // 192px
    56: '14rem',     // 224px
    64: '16rem'      // 256px
  },
  
  // Border radius scale
  radii: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px'
  },
  
  // Shadow system
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    // Colored shadows
    glow: '0 0 20px rgba(99, 102, 241, 0.3)',
    glowLg: '0 0 40px rgba(99, 102, 241, 0.4)'
  },
  
  // Breakpoints for responsive design
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  
  // Animation and transition system
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',
    spring: '300ms cubic-bezier(0.34, 1.56, 0.64, 1)'
  },
  
  // Z-index scale
  zIndices: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800
  }
}

export default theme
