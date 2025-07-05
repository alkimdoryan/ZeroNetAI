// SAP Protocol Design System
export const designSystem = {
  // Color Palette - WCAG AA Compliant
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    // Node Category Colors
    categories: {
      trigger: {
        bg: '#22c55e',
        text: '#ffffff',
        border: '#16a34a',
        hover: '#15803d',
      },
      agent: {
        bg: '#f59e0b',
        text: '#ffffff',
        border: '#d97706',
        hover: '#b45309',
      },
      condition: {
        bg: '#eab308',
        text: '#ffffff',
        border: '#ca8a04',
        hover: '#a16207',
      },
      connector: {
        bg: '#3b82f6',
        text: '#ffffff',
        border: '#2563eb',
        hover: '#1d4ed8',
      },
      logic: {
        bg: '#8b5cf6',
        text: '#ffffff',
        border: '#7c3aed',
        hover: '#6d28d9',
      },
      utility: {
        bg: '#64748b',
        text: '#ffffff',
        border: '#475569',
        hover: '#334155',
      },
      // Yeni node türleri için renkler
      'http-request': {
        bg: '#64748b',
        text: '#ffffff',
        border: '#475569',
        hover: '#334155',
      },
      'database-query': {
        bg: '#14b8a6',
        text: '#ffffff',
        border: '#0f766e',
        hover: '#0d9488',
      },
      'email-send': {
        bg: '#6366f1',
        text: '#ffffff',
        border: '#4f46e5',
        hover: '#4338ca',
      },
      'notification': {
        bg: '#8b5cf6',
        text: '#ffffff',
        border: '#7c3aed',
        hover: '#6d28d9',
      },
      'loop': {
        bg: '#8b5cf6',
        text: '#ffffff',
        border: '#7c3aed',
        hover: '#6d28d9',
      },
      'delay': {
        bg: '#10b981',
        text: '#ffffff',
        border: '#059669',
        hover: '#047857',
      },
      'transform': {
        bg: '#06b6d4',
        text: '#ffffff',
        border: '#0891b2',
        hover: '#0e7490',
      },
      'error-handler': {
        bg: '#ef4444',
        text: '#ffffff',
        border: '#dc2626',
        hover: '#b91c1c',
      },
      'custom-function': {
        bg: '#8b5cf6',
        text: '#ffffff',
        border: '#7c3aed',
        hover: '#6d28d9',
      },
      custom: {
        bg: '#8b5cf6',
        text: '#ffffff',
        border: '#7c3aed',
        hover: '#6d28d9',
      },
    },
  },

  // Typography
  typography: {
    fontFamily: {
      primary: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Monaco', 'monospace'],
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
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Spacing (12-column grid system)
  spacing: {
    grid: {
      container: '1200px',
      columns: 12,
      gutter: '24px',
    },
    scale: {
      0: '0',
      1: '0.25rem',
      2: '0.5rem',
      3: '0.75rem',
      4: '1rem',
      5: '1.25rem',
      6: '1.5rem',
      8: '2rem',
      10: '2.5rem',
      12: '3rem',
      16: '4rem',
      20: '5rem',
      24: '6rem',
      32: '8rem',
    },
  },

  // Shadows & Elevation
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    glow: {
      primary: '0 0 20px rgba(59, 130, 246, 0.3)',
      success: '0 0 20px rgba(34, 197, 94, 0.3)',
      warning: '0 0 20px rgba(245, 158, 11, 0.3)',
      error: '0 0 20px rgba(239, 68, 68, 0.3)',
    },
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },

  // Transitions
  transitions: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
    },
    easing: {
      linear: 'linear',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
      spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
  },

  // Node Specifications
  nodes: {
    size: {
      compact: {
        width: '160px',
        height: '80px',
        padding: '12px',
      },
      normal: {
        width: '200px',
        height: '100px',
        padding: '16px',
      },
      expanded: {
        width: '240px',
        height: '120px',
        padding: '20px',
      },
    },
    states: {
      default: {
        opacity: 1,
        transform: 'scale(1)',
      },
      hover: {
        opacity: 1,
        transform: 'scale(1.02)',
        shadow: 'lg',
      },
      selected: {
        opacity: 1,
        transform: 'scale(1.05)',
        shadow: 'glow.primary',
      },
      disabled: {
        opacity: 0.5,
        transform: 'scale(0.98)',
      },
    },
  },

  // Connection/Edge Styles
  edges: {
    default: {
      stroke: '#94a3b8',
      strokeWidth: 2,
    },
    active: {
      stroke: '#3b82f6',
      strokeWidth: 3,
    },
    success: {
      stroke: '#22c55e',
      strokeWidth: 2,
    },
    error: {
      stroke: '#ef4444',
      strokeWidth: 2,
    },
    animated: {
      strokeDasharray: '5,5',
      animation: 'dash 1s linear infinite',
    },
  },

  // Z-Index Scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
    notification: 1070,
  },

  // Breakpoints
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

// Utility functions
export const getNodeCategoryStyle = (category: keyof typeof designSystem.colors.categories) => {
  return designSystem.colors.categories[category] || designSystem.colors.categories.utility;
};

export const getStatusColor = (status: 'success' | 'warning' | 'error' | 'info') => {
  const statusMap = {
    success: designSystem.colors.success,
    warning: designSystem.colors.warning,
    error: designSystem.colors.error,
    info: designSystem.colors.primary,
  };
  return statusMap[status];
};

export const createTransition = (
  properties: string[],
  duration: keyof typeof designSystem.transitions.duration = 'normal',
  easing: keyof typeof designSystem.transitions.easing = 'easeInOut'
) => {
  return properties
    .map(prop => `${prop} ${designSystem.transitions.duration[duration]} ${designSystem.transitions.easing[easing]}`)
    .join(', ');
};

// CSS-in-JS utilities
export const createGlassEffect = (opacity = 0.8) => ({
  background: `rgba(255, 255, 255, ${opacity})`,
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
});

export const createGradientBackground = (from: string, to: string) => ({
  background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
});

export default designSystem; 