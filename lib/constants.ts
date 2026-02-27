/**
 * Application Constants
 * Central location for all app-wide constant values
 */

// App Configuration
export const APP_NAME = 'Boame Cocoa';
export const APP_DESCRIPTION = 'Cocoa Disease Detection Scanner';
export const APP_VERSION = '1.0.0';

// Routes
export const ROUTES = {
  HOME: '/',
  SIGNUP: '/signup',
  SIGNIN: '/signin',
  DASHBOARD: '/dashboard',
  SCAN: '/scan',
  HISTORY: '/history',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

// API Endpoints (add your backend URLs here)
export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: '/api/auth/signup',
    SIGNIN: '/api/auth/signin',
    SIGNOUT: '/api/auth/signout',
    VERIFY: '/api/auth/verify',
  },
  SCAN: {
    UPLOAD: '/api/scan/upload',
    ANALYZE: '/api/scan/analyze',
    HISTORY: '/api/scan/history',
  },
  USER: {
    PROFILE: '/api/user/profile',
    UPDATE: '/api/user/update',
  },
} as const;

// Disease Types
export const COCOA_DISEASES = {
  BLACK_POD: 'Black Pod Disease',
  FROSTY_POD: 'Frosty Pod Rot',
  WITCHES_BROOM: "Witches' Broom",
  SWOLLEN_SHOOT: 'Cocoa Swollen Shoot Virus',
  HEALTHY: 'Healthy',
} as const;

// Form Validation
export const VALIDATION = {
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  },
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

// Animation Durations (in milliseconds)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Image Upload
export const IMAGE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_WIDTH: 2048,
  MAX_HEIGHT: 2048,
} as const;
