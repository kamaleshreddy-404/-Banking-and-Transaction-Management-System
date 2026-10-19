import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

const DemoBanner = () => {
  return (
    <div className="demo-banner" role="banner" aria-label="Demo Environment Notice">
      <div className="demo-banner-content">
        <span className="demo-badge">
          <AlertTriangle size={14} className="banner-icon" />
          SIMULATED ENVIRONMENT
        </span>
        <strong className="demo-title">DEMO BANKING ENVIRONMENT — VIRTUAL MONEY ONLY</strong>
        <span className="demo-divider">|</span>
        <span className="demo-desc">
          All accounts, balances, beneficiaries, and transactions are simulated for educational and portfolio demonstration. No real financial operations occur.
        </span>
      </div>
    </div>
  );
};

export default DemoBanner;
