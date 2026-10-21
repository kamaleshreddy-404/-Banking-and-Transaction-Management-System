// Simulated client-side data store for standalone GitHub Pages static deployment
// When running locally with Spring Boot, the app connects directly to MySQL via REST API.
// When deployed on GitHub Pages static hosting, this store ensures a 100% interactive live demo.

const INITIAL_ACCOUNTS = [
  {
    accountId: 1,
    accountNumber: 'FC10010001',
    accountName: 'Primary Savings',
    accountType: 'SAVINGS',
    balance: 45250.00,
    currencyCode: 'INR',
    accountStatus: 'ACTIVE',
    openedAt: '2026-06-15T09:30:00'
  },
  {
    accountId: 2,
    accountNumber: 'FC10010002',
    accountName: 'Daily Operational',
    accountType: 'CURRENT',
    balance: 112000.00,
    currencyCode: 'INR',
    accountStatus: 'ACTIVE',
    openedAt: '2026-07-20T11:15:00'
  }
];

const INITIAL_BENEFICIARIES = [
  {
    beneficiaryId: 1,
    beneficiaryName: 'Diya Patel',
    beneficiaryAccountNumber: 'FC10020001',
    nickname: 'Sister',
    status: 'ACTIVE',
    createdAt: '2026-08-01T10:00:00'
  },
  {
    beneficiaryId: 2,
    beneficiaryName: 'Vikram Malhotra',
    beneficiaryAccountNumber: 'FC10030001',
    nickname: 'Business Partner',
    status: 'ACTIVE',
    createdAt: '2026-08-15T14:30:00'
  }
];

const INITIAL_TRANSACTIONS = [
  {
    transactionId: 101,
    transactionReference: 'TX-20261019-1001',
    transactionType: 'TRANSFER',
    sourceAccountNumber: 'FC10010001',
    sourceAccountName: 'Primary Savings',
    destinationAccountNumber: 'FC10020001',
    destinationAccountName: 'Diya Patel',
    amount: 1500.00,
    currencyCode: 'INR',
    status: 'COMPLETED',
    description: 'Simulated utility payment to Diya',
    idempotencyKey: 'tx_init_101',
    createdAt: '2026-10-19T14:30:00'
  },
  {
    transactionId: 102,
    transactionReference: 'TX-20261018-0942',
    transactionType: 'DEPOSIT',
    sourceAccountNumber: null,
    sourceAccountName: 'System Payroll',
    destinationAccountNumber: 'FC10010001',
    destinationAccountName: 'Primary Savings',
    amount: 25000.00,
    currencyCode: 'INR',
    status: 'COMPLETED',
    description: 'Simulated monthly salary credit',
    idempotencyKey: 'tx_init_102',
    createdAt: '2026-10-18T09:42:00'
  },
  {
    transactionId: 103,
    transactionReference: 'TX-20261017-1815',
    transactionType: 'TRANSFER',
    sourceAccountNumber: 'FC10010001',
    sourceAccountName: 'Primary Savings',
    destinationAccountNumber: 'FC10030001',
    destinationAccountName: 'Vikram Malhotra',
    amount: 3200.00,
    currencyCode: 'INR',
    status: 'COMPLETED',
    description: 'Simulated vendor invoice reimbursement',
    idempotencyKey: 'tx_init_103',
    createdAt: '2026-10-17T18:15:00'
  }
];

const INITIAL_LEDGER = [
  {
    ledgerEntryId: 501,
    accountId: 1,
    accountNumber: 'FC10010001',
    entryType: 'DEBIT',
    amount: 1500.00,
    runningBalance: 45250.00,
    transactionReference: 'TX-20261019-1001',
    description: 'Virtual transfer debit',
    createdAt: '2026-10-19T14:30:00'
  },
  {
    ledgerEntryId: 502,
    accountId: 1,
    accountNumber: 'FC10010001',
    entryType: 'CREDIT',
    amount: 25000.00,
    runningBalance: 46750.00,
    transactionReference: 'TX-20261018-0942',
    description: 'Simulated salary credit',
    createdAt: '2026-10-18T09:42:00'
  }
];

export const getStoredData = (key, defaultVal) => {
  try {
    const val = localStorage.getItem(`fincore_demo_${key}`);
    return val ? JSON.parse(val) : defaultVal;
  } catch {
    return defaultVal;
  }
};

export const setStoredData = (key, val) => {
  try {
    localStorage.setItem(`fincore_demo_${key}`, JSON.stringify(val));
  } catch {}
};

export const mockStore = {
  getAccounts() {
    return getStoredData('accounts', INITIAL_ACCOUNTS);
  },
  saveAccounts(accs) {
    setStoredData('accounts', accs);
  },
  getBeneficiaries() {
    return getStoredData('beneficiaries', INITIAL_BENEFICIARIES);
  },
  saveBeneficiaries(bens) {
    setStoredData('beneficiaries', bens);
  },
  getTransactions() {
    return getStoredData('transactions', INITIAL_TRANSACTIONS);
  },
  saveTransactions(txs) {
    setStoredData('transactions', txs);
  },
  getLedger() {
    return getStoredData('ledger', INITIAL_LEDGER);
  },
  saveLedger(ledger) {
    setStoredData('ledger', ledger);
  }
};

export default mockStore;
