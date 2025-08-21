// PlayTale Design System - Theme Configuration

export const theme = {
  // Colors
  colors: {
    primary: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6', // Main purple
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
    },
    background: {
      main: '#fef7ed', // amber-50
      card: '#ffffff',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    text: {
      primary: '#1e293b', // slate-800
      secondary: '#64748b', // slate-500
      muted: '#94a3b8', // slate-400
      white: '#ffffff',
    },
    status: {
      success: '#10b981', // emerald-500
      error: '#ef4444', // red-500
      warning: '#f59e0b', // amber-500
      info: '#3b82f6', // blue-500
    },
    accent: {
      blue: '#dbeafe', // blue-50
      purple: '#f3e8ff', // purple-50
      green: '#ecfdf5', // emerald-50
      yellow: '#fffbeb', // amber-50
    }
  },

  // Typography
  typography: {
    fontFamily: {
      heading: 'Fredoka One, cursive',
      body: 'Nunito, sans-serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.625',
    }
  },

  // Spacing
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    base: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },

  // Border Radius
  borderRadius: {
    sm: '0.5rem',
    base: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },

  // Animations
  animations: {
    transition: 'all 0.2s ease-in-out',
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
    },
    easing: {
      default: 'ease-in-out',
      in: 'ease-in',
      out: 'ease-out',
    }
  },

  // Component specific sizes
  components: {
    progressBar: {
      circle: {
        sm: 'w-6 h-6',
        base: 'w-8 h-8',
        lg: 'w-10 h-10',
      },
      text: {
        sm: 'text-xs',
        base: 'text-sm',
        lg: 'text-base',
      }
    },
    button: {
      size: {
        sm: 'px-3 py-2 text-sm',
        base: 'px-4 py-3 text-sm',
        lg: 'px-6 py-4 text-base',
        icon: {
          sm: 'w-8 h-8',
          base: 'w-12 h-12',
          lg: 'w-16 h-16',
          xl: 'w-20 h-20',
        }
      }
    },
    card: {
      padding: {
        sm: 'p-4',
        base: 'p-6',
        lg: 'p-8',
      },
      heights: {
        // Standard minimum højde for grid-kort (familiekort og "Tilføj person")
        gridItem: '240px'
      }
    }
  }
} as const;

// Helper function to get theme values
export const getThemeValue = (path: string) => {
  return path.split('.').reduce((obj: any, key) => obj?.[key], theme);
};

// CSS Custom Properties for dynamic theming
export const cssVariables = {
  '--color-primary': theme.colors.primary[600],
  '--color-primary-light': theme.colors.primary[500],
  '--color-primary-dark': theme.colors.primary[700],
  '--color-background': theme.colors.background.main,
  '--color-text': theme.colors.text.primary,
  '--font-heading': theme.typography.fontFamily.heading,
  '--font-body': theme.typography.fontFamily.body,
  '--border-radius': theme.borderRadius.xl,
  '--shadow-card': theme.shadows.lg,
  '--transition': theme.animations.transition,
} as const;
