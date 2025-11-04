import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#667eea',
    primaryContainer: '#DDD6FE',
    secondary: '#764ba2',
    secondaryContainer: '#F3E5F5',
    tertiary: '#4ECDC4',
    surface: '#FFFFFF',
    surfaceVariant: '#F8F9FA',
    background: '#F5F7FA',
    error: '#E74C3C',
    errorContainer: '#FADBD8',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onSurface: '#2C3E50',
    onBackground: '#2C3E50',
    outline: '#E1E8ED',
    shadow: '#000000',
  },
  roundness: 16,
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#8B7CF6',
    primaryContainer: '#5B21B6',
    secondary: '#A78BFA',
    secondaryContainer: '#7C3AED',
    tertiary: '#06D6A0',
    surface: '#1E293B',
    surfaceVariant: '#334155',
    background: '#0F172A',
    error: '#F87171',
    errorContainer: '#7F1D1D',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onSurface: '#F1F5F9',
    onBackground: '#F1F5F9',
    outline: '#475569',
    shadow: '#000000',
  },
  roundness: 16,
};

export const roverTheme = {
  // Rover-specific colors
  rover: {
    connected: '#10B981',
    disconnected: '#6B7280',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  },
  // Status colors
  status: {
    active: '#10B981',
    inactive: '#6B7280',
    processing: '#F59E0B',
    error: '#EF4444',
  },
  // Gradient combinations
  gradients: {
    primary: ['#667eea', '#764ba2'],
    secondary: ['#4ECDC4', '#44A08D'],
    dark: ['#0F0C29', '#24243e'],
    light: ['#FFFFFF', '#F8F9FA'],
    rover: ['#1A1A2E', '#16213E'],
  },
};