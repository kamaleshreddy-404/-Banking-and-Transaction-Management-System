import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DemoBanner from '../components/common/DemoBanner';

describe('DemoBanner Component', () => {
  it('renders the mandatory simulated environment banking disclaimer', () => {
    render(<DemoBanner />);
    
    expect(
      screen.getByText(/DEMO BANKING ENVIRONMENT — VIRTUAL MONEY ONLY/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/All accounts, balances, beneficiaries, and transactions are simulated/i)
    ).toBeInTheDocument();
  });
});
