import axios from 'axios';
import mockStore from './mockDataStore';

const isStaticHosting = typeof window !== 'undefined' && (
  window.location.hostname.includes('github.io') ||
  window.location.hostname.includes('netlify') ||
  window.location.hostname.includes('vercel')
);

const API_BASE_URL = import.meta.env.VITE_API_URL || (isStaticHosting ? '/api-mock' : '/api/v1');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fincore_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Fallback Mock Engine for Static Deployments (GitHub Pages)
function handleMockRequest(config) {
  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();
  const data = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {});

  // Auth: Login
  if (url.includes('/auth/login') && method === 'post') {
    const isAdmin = data.email === 'admin@fincore.demo';
    const name = isAdmin ? 'Super Admin' : (data.email.includes('priya') ? 'Priya Patel' : (data.email.includes('diya') ? 'Diya Patel' : 'Aarav Sharma'));
    const role = isAdmin ? 'ADMIN' : 'CUSTOMER';
    return {
      status: 200,
      data: {
        token: `mock_jwt_${Date.now()}`,
        tokenType: 'Bearer',
        userId: isAdmin ? 1 : 2,
        fullName: name,
        email: data.email || 'aarav.sharma@fincore.demo',
        role: role,
        roles: [role],
        accountStatus: 'ACTIVE'
      }
    };
  }

  // Auth: Register
  if (url.includes('/auth/register') && method === 'post') {
    return {
      status: 200,
      data: {
        token: `mock_jwt_${Date.now()}`,
        tokenType: 'Bearer',
        userId: Math.floor(Math.random() * 1000) + 10,
        fullName: data.fullName || 'Demo Customer',
        email: data.email,
        role: 'CUSTOMER',
        roles: ['CUSTOMER'],
        accountStatus: 'ACTIVE'
      }
    };
  }

  // Auth: Forgot Password & Reset
  if (url.includes('/auth/forgot-password')) {
    return { status: 200, data: { message: 'Reset token generated.', data: { resetToken: 'demo_token_xyz' } } };
  }
  if (url.includes('/auth/reset-password')) {
    return { status: 200, data: { message: 'Password updated successfully.' } };
  }

  // User Profile
  if (url.includes('/users/profile')) {
    const savedUser = JSON.parse(localStorage.getItem('fincore_user') || '{}');
    if (method === 'put') {
      const updated = { ...savedUser, ...data };
      localStorage.setItem('fincore_user', JSON.stringify(updated));
      return { status: 200, data: updated };
    }
    return {
      status: 200,
      data: {
        userId: savedUser.userId || 2,
        fullName: savedUser.fullName || 'Aarav Sharma',
        email: savedUser.email || 'aarav.sharma@fincore.demo',
        phone: '+91 98765 43210',
        roles: savedUser.roles || ['CUSTOMER'],
        accountStatus: 'ACTIVE',
        addressLine: '42 Marine Drive',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400020'
      }
    };
  }

  // User Change Password
  if (url.includes('/users/change-password')) {
    return { status: 200, data: { message: 'Password updated successfully.' } };
  }

  // Accounts
  if (url === '/accounts' || url.endsWith('/accounts')) {
    if (method === 'post') {
      const accounts = mockStore.getAccounts();
      const newAcc = {
        accountId: accounts.length + 1,
        accountNumber: `FC100${Math.floor(Math.random() * 90000) + 10000}`,
        accountName: data.accountName || 'Savings Account',
        accountType: data.accountTypeId === 2 ? 'CURRENT' : 'SAVINGS',
        balance: 10000.00,
        currencyCode: 'INR',
        accountStatus: 'ACTIVE',
        openedAt: new Date().toISOString()
      };
      accounts.push(newAcc);
      mockStore.saveAccounts(accounts);
      return { status: 200, data: newAcc };
    }
    return { status: 200, data: mockStore.getAccounts() };
  }

  // Account Ledger
  if (url.includes('/accounts/') && url.includes('/ledger')) {
    const ledger = mockStore.getLedger();
    return {
      status: 200,
      data: {
        content: ledger,
        totalElements: ledger.length,
        totalPages: 1,
        page: 0,
        size: 20
      }
    };
  }

  // Account Details by ID
  if (url.match(/\/accounts\/\d+$/)) {
    const id = parseInt(url.split('/').pop(), 10);
    const accs = mockStore.getAccounts();
    const acc = accs.find(a => a.accountId === id) || accs[0];
    return { status: 200, data: acc };
  }

  // Transfers: Execute
  if (url.includes('/transfers') && method === 'post') {
    const accounts = mockStore.getAccounts();
    const source = accounts.find(a => a.accountId === data.sourceAccountId) || accounts[0];
    const amount = parseFloat(data.amount) || 0;

    // Mutate source balance
    source.balance = Math.max(0, source.balance - amount);
    mockStore.saveAccounts(accounts);

    const ref = `TX-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 8999) + 1000}`;
    const tx = {
      transactionId: Math.floor(Math.random() * 9000) + 1000,
      transactionReference: ref,
      transactionType: 'TRANSFER',
      sourceAccountNumber: source.accountNumber,
      sourceAccountName: source.accountName,
      destinationAccountNumber: data.destinationAccountNumber,
      destinationAccountName: 'Beneficiary Account',
      amount: amount,
      currencyCode: 'INR',
      status: 'COMPLETED',
      description: data.description || 'Simulated Transfer',
      idempotencyKey: config.headers?.['Idempotency-Key'] || `tx_key_${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    const txs = [tx, ...mockStore.getTransactions()];
    mockStore.saveTransactions(txs);

    const ledger = [
      {
        ledgerEntryId: Math.floor(Math.random() * 90000) + 10000,
        accountId: source.accountId,
        accountNumber: source.accountNumber,
        entryType: 'DEBIT',
        amount: amount,
        runningBalance: source.balance,
        transactionReference: ref,
        description: data.description || 'Virtual Transfer Outflow',
        createdAt: new Date().toISOString()
      },
      ...mockStore.getLedger()
    ];
    mockStore.saveLedger(ledger);

    return { status: 200, data: tx };
  }

  // Transfer Limits
  if (url.includes('/transfers/limits')) {
    return {
      status: 200,
      data: {
        userTier: 'STANDARD',
        dailyLimit: 50000.00,
        perTransactionLimit: 25000.00,
        monthlyLimit: 500000.00
      }
    };
  }

  // Transactions History
  if (url.includes('/transactions') && method === 'get' && !url.includes('/receipt')) {
    const txs = mockStore.getTransactions();
    return {
      status: 200,
      data: {
        content: txs,
        totalElements: txs.length,
        totalPages: 1,
        page: 0,
        size: 15
      }
    };
  }

  // Transaction Receipt
  if (url.includes('/transactions/') && url.includes('/receipt')) {
    const txs = mockStore.getTransactions();
    const tx = txs[0] || {};
    return {
      status: 200,
      data: {
        receiptId: `REC-${Date.now()}`,
        transactionReference: tx.transactionReference || 'TX-20261021-001',
        amount: tx.amount || 1500.00,
        currencyCode: 'INR',
        transactionType: tx.transactionType || 'TRANSFER',
        status: 'COMPLETED',
        sourceAccountNumber: tx.sourceAccountNumber || 'FC10010001',
        sourceAccountName: 'Primary Savings',
        destinationAccountNumber: tx.destinationAccountNumber || 'FC10020001',
        destinationAccountName: 'Diya Patel',
        description: tx.description || 'Simulated Virtual Fund Transfer',
        runningBalanceAfter: 43750.00,
        timestamp: tx.createdAt || new Date().toISOString()
      }
    };
  }

  // Beneficiaries
  if (url.includes('/beneficiaries')) {
    const bens = mockStore.getBeneficiaries();
    if (method === 'post') {
      const newBen = {
        beneficiaryId: bens.length + 1,
        beneficiaryName: data.beneficiaryName,
        beneficiaryAccountNumber: data.beneficiaryAccountNumber,
        nickname: data.nickname || '',
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      };
      bens.push(newBen);
      mockStore.saveBeneficiaries(bens);
      return { status: 200, data: newBen };
    }
    if (method === 'delete') {
      return { status: 200, data: { success: true } };
    }
    if (url.includes('/toggle')) {
      return { status: 200, data: { status: 'ACTIVE' } };
    }
    return { status: 200, data: bens };
  }

  // Notifications & Announcements
  if (url.includes('/notifications/announcements')) {
    return {
      status: 200,
      data: [
        {
          announcementId: 1,
          title: 'Simulated Core Banking Engine Online',
          message: 'FinCore is operating in portfolio simulation mode with 100% zero discrepancy double-entry ledger audits.',
          createdAt: new Date().toISOString()
        }
      ]
    };
  }
  if (url.includes('/notifications')) {
    return {
      status: 200,
      data: {
        content: [
          {
            notificationId: 1,
            title: 'Welcome to FinCore',
            message: 'Your virtual demo account has been initialized with welcome credit.',
            isRead: false,
            createdAt: new Date().toISOString()
          }
        ],
        totalElements: 1,
        totalPages: 1
      }
    };
  }

  // Support Tickets
  if (url.includes('/support/tickets')) {
    if (method === 'post') {
      return {
        status: 200,
        data: {
          ticketId: 101,
          ticketReference: 'TCK-2026-101',
          subject: data.subject,
          category: data.category,
          priority: data.priority,
          status: 'OPEN',
          description: data.message,
          messages: [],
          createdAt: new Date().toISOString()
        }
      };
    }
    return {
      status: 200,
      data: [
        {
          ticketId: 101,
          ticketReference: 'TCK-2026-101',
          subject: 'Virtual Limit Enhancement Query',
          category: 'LIMIT_INCREASE',
          priority: 'MEDIUM',
          status: 'IN_PROGRESS',
          description: 'Requesting simulated transfer limit review.',
          messages: [
            {
              messageId: 1,
              message: 'Hello, your simulated transfer limit is governed by the Standard tier.',
              isStaffReply: true,
              createdAt: new Date().toISOString()
            }
          ],
          createdAt: new Date().toISOString()
        }
      ]
    };
  }

  // Admin Endpoints
  if (url.includes('/admin/stats')) {
    return {
      status: 200,
      data: {
        totalUsers: 7,
        totalAccounts: 8,
        totalTransactions: 37,
        openTickets: 2
      }
    };
  }
  if (url.includes('/admin/users')) {
    return {
      status: 200,
      data: {
        content: [
          { userId: 1, fullName: 'Super Admin', email: 'admin@fincore.demo', phone: '+91 99999 00000', roles: ['ADMIN'], accountStatus: 'ACTIVE', createdAt: '2026-06-01T00:00:00' },
          { userId: 2, fullName: 'Aarav Sharma', email: 'aarav.sharma@fincore.demo', phone: '+91 98765 43210', roles: ['CUSTOMER'], accountStatus: 'ACTIVE', createdAt: '2026-06-15T00:00:00' },
          { userId: 3, fullName: 'Diya Patel', email: 'diya.patel@fincore.demo', phone: '+91 98765 11111', roles: ['CUSTOMER'], accountStatus: 'ACTIVE', createdAt: '2026-07-01T00:00:00' }
        ],
        totalElements: 3,
        totalPages: 1
      }
    };
  }
  if (url.includes('/admin/accounts')) {
    return {
      status: 200,
      data: {
        content: mockStore.getAccounts(),
        totalElements: mockStore.getAccounts().length,
        totalPages: 1
      }
    };
  }
  if (url.includes('/admin/transactions')) {
    return {
      status: 200,
      data: {
        content: mockStore.getTransactions(),
        totalElements: mockStore.getTransactions().length,
        totalPages: 1
      }
    };
  }
  if (url.includes('/admin/ledger')) {
    return {
      status: 200,
      data: {
        content: mockStore.getLedger(),
        totalElements: mockStore.getLedger().length,
        totalPages: 1
      }
    };
  }
  if (url.includes('/admin/audit-logs')) {
    return {
      status: 200,
      data: {
        content: [
          { auditLogId: 1, action: 'LOGIN_SUCCESS', userId: 2, ipAddress: '127.0.0.1', details: 'Customer authentication successful', createdAt: new Date().toISOString() },
          { auditLogId: 2, action: 'TRANSFER_EXECUTED', userId: 2, ipAddress: '127.0.0.1', details: 'Transferred ₹1,500.00 to FC10020001', createdAt: new Date().toISOString() }
        ],
        totalElements: 2,
        totalPages: 1
      }
    };
  }
  if (url.includes('/admin/limits')) {
    return {
      status: 200,
      data: [
        { userTier: 'STANDARD', dailyLimit: 50000.00, perTransactionLimit: 25000.00, monthlyLimit: 500000.00 },
        { userTier: 'PREMIUM', dailyLimit: 200000.00, perTransactionLimit: 100000.00, monthlyLimit: 2000000.00 },
        { userTier: 'VIP', dailyLimit: 1000000.00, perTransactionLimit: 500000.00, monthlyLimit: 10000000.00 }
      ]
    };
  }
  if (url.includes('/admin/system/health') || url.includes('/actuator/health')) {
    return {
      status: 200,
      data: {
        status: 'UP',
        components: {
          db: { status: 'UP', details: { database: 'MySQL 8.4', validationQuery: 'isValid()' } },
          diskSpace: { status: 'UP', details: { free: '298 GB', total: '314 GB' } },
          ping: { status: 'UP' }
        }
      }
    };
  }

  // Default fallback response
  return { status: 200, data: {} };
}

// Response interceptor: on network error or static hosting 404/405, use simulated mock engine
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If running on static hosting or backend is offline, gracefully serve mock data
    if (isStaticHosting || !error.response || error.response.status === 404 || error.response.status === 405 || error.code === 'ERR_NETWORK') {
      try {
        const mockRes = handleMockRequest(error.config);
        if (mockRes) {
          return Promise.resolve(mockRes);
        }
      } catch (mockErr) {
        console.warn('Mock fallback handled with fallback error', mockErr);
      }
    }

    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      localStorage.removeItem('fincore_token');
      localStorage.removeItem('fincore_user');
      if (!window.location.hash.includes('/login') && 
          !window.location.hash.includes('/register') &&
          !window.location.hash.includes('/forgot-password') &&
          window.location.hash !== '' && window.location.hash !== '#/') {
        window.location.hash = '#/login?expired=true';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
