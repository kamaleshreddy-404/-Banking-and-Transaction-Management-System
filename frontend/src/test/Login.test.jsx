import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import LoginPage from '../pages/LoginPage';
import { AuthProvider } from '../context/AuthContext';

describe('LoginPage Component', () => {
  it('renders login form elements and demo buttons', () => {
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /Sign In to FinCore/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(container.querySelector('#password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Customer: Aarav Sharma/i })).toBeInTheDocument();
  });

  it('autofills credentials when clicking quick demo account button', () => {
    const { container } = render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    const demoBtn = screen.getByRole('button', { name: /Customer: Aarav Sharma/i });
    fireEvent.click(demoBtn);

    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = container.querySelector('#password');

    expect(emailInput.value).toBe('aarav.sharma@fincore.demo');
    expect(passwordInput.value).toBe('Password@123');
  });
});
