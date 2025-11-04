import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from '../src/contexts/AuthContext';
import { lightTheme } from '../src/theme/theme';
import LoginScreen from '../src/screens/LoginScreen';

// Mock the roverService
jest.mock('../src/services/roverService', () => ({
  login: jest.fn().mockResolvedValue({
    success: true,
    token: 'mock-token',
    user: { id: 1, username: 'admin', role: 'operator' }
  })
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock Expo modules
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' }
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient'
}));

const TestWrapper = ({ children }) => (
  <PaperProvider theme={lightTheme}>
    <AuthProvider>
      {children}
    </AuthProvider>
  </PaperProvider>
);

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form correctly', () => {
    const { getByPlaceholderText, getByText } = render(
      <TestWrapper>
        <LoginScreen />
      </TestWrapper>
    );

    expect(getByPlaceholderText('Username')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Sign In')).toBeTruthy();
  });

  it('shows demo credentials', () => {
    const { getByText } = render(
      <TestWrapper>
        <LoginScreen />
      </TestWrapper>
    );

    expect(getByText('Demo Credentials')).toBeTruthy();
    expect(getByText('Username: admin')).toBeTruthy();
    expect(getByText('Password: rover123')).toBeTruthy();
  });

  it('handles login form submission', async () => {
    const { getByPlaceholderText, getByText } = render(
      <TestWrapper>
        <LoginScreen />
      </TestWrapper>
    );

    const usernameInput = getByPlaceholderText('Username');
    const passwordInput = getByPlaceholderText('Password');
    const loginButton = getByText('Sign In');

    fireEvent.changeText(usernameInput, 'admin');
    fireEvent.changeText(passwordInput, 'rover123');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(getByText('Signing in...')).toBeTruthy();
    });
  });

  it('displays validation errors for empty fields', async () => {
    const { getByText } = render(
      <TestWrapper>
        <LoginScreen />
      </TestWrapper>
    );

    const loginButton = getByText('Sign In');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(getByText('Please enter username')).toBeTruthy();
      expect(getByText('Please enter password')).toBeTruthy();
    });
  });

  it('fills demo credentials when demo button is pressed', () => {
    const { getByText, getByPlaceholderText } = render(
      <TestWrapper>
        <LoginScreen />
      </TestWrapper>
    );

    const demoButton = getByText('Use Demo Credentials');
    fireEvent.press(demoButton);

    expect(getByPlaceholderText('Username').props.value).toBe('admin');
    expect(getByPlaceholderText('Password').props.value).toBe('rover123');
  });
});