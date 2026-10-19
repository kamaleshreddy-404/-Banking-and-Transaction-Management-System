import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import TransferPage from '../pages/TransferPage';
import { AuthProvider } from '../context/AuthContext';
import * as accountService from '../services/accountService';
import * as beneficiaryService from '../services/beneficiaryService';

describe('TransferPage Component', () => {
  it('renders simulated transfer interface', async () => {
    vi.spyOn(accountService.default, 'getAccounts').mockResolvedValue([
      { accountId: 1, accountName: 'Test Savings', accountNumber: 'FC10010001', balance: 5000, accountStatus: 'ACTIVE', currencyCode: 'INR' }
    ]);
    vi.spyOn(beneficiaryService.default, 'getBeneficiaries').mockResolvedValue([]);

    render(
      <BrowserRouter>
        <AuthProvider>
          <TransferPage />
        </AuthProvider>
      </BrowserRouter>
    );

    expect(await screen.findByRole('heading', { name: /Simulated Fund Transfer/i })).toBeInTheDocument();
    expect(screen.getByText(/From Account/i)).toBeInTheDocument();
    expect(screen.getByText(/Transfer Destination/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Review Virtual Transfer/i })).toBeInTheDocument();
  });
});
