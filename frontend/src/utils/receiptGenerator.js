export const printReceipt = (receipt) => {
  if (!receipt) return;
  const printWindow = window.open('', '_blank', 'width=700,height=800');
  if (!printWindow) {
    window.print();
    return;
  }

  const amtFormatted = receipt.amount ? Number(receipt.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00';
  const timeFormatted = receipt.timestamp ? new Date(receipt.timestamp).toLocaleString('en-IN') : new Date().toLocaleString('en-IN');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>FinCore Transfer Receipt - ${receipt.transactionReference || 'Simulated'}</title>
        <style>
          body { font-family: 'Inter', -apple-system, sans-serif; padding: 40px; color: #1E293B; background: #FFF; }
          .receipt-box { max-width: 550px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 12px; padding: 32px; }
          .header { text-align: center; border-bottom: 2px dashed #E2E8F0; padding-bottom: 20px; margin-bottom: 24px; }
          .logo { font-size: 26px; font-weight: 800; color: #10213A; }
          .logo span { color: #2563EB; }
          .disclaimer { background: #FEF3C7; color: #92400E; padding: 8px; border-radius: 6px; font-size: 11px; font-weight: 700; text-align: center; margin-top: 8px; }
          .amount-box { text-align: center; margin: 24px 0; background: #F8FAFC; padding: 18px; border-radius: 8px; }
          .amount { font-size: 32px; font-weight: 800; color: #10213A; }
          .status { display: inline-block; padding: 4px 12px; border-radius: 20px; background: #DCFCE7; color: #16A34A; font-weight: 700; font-size: 12px; margin-top: 6px; }
          .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #F1F5F9; font-size: 13px; }
          .label { color: #64748B; font-weight: 500; }
          .value { font-weight: 600; text-align: right; }
          .footer { margin-top: 32px; text-align: center; font-size: 11px; color: #94A3B8; }
        </style>
      </head>
      <body>
        <div class="receipt-box">
          <div class="header">
            <div class="logo">Fin<span>Core</span></div>
            <div style="font-size: 12px; color: #64748B; margin-top: 4px;">Simulated Banking Transaction Receipt</div>
            <div class="disclaimer">DEMO BANKING ENVIRONMENT — VIRTUAL MONEY ONLY</div>
          </div>
          <div class="amount-box">
            <div style="font-size: 12px; color: #64748B; text-transform: uppercase;">Transfer Amount</div>
            <div class="amount">₹${amtFormatted}</div>
            <div class="status">${receipt.status || 'COMPLETED'}</div>
          </div>
          <div class="row"><span class="label">Reference No:</span><span class="value">${receipt.transactionReference || '-'}</span></div>
          <div class="row"><span class="label">Transaction Type:</span><span class="value">${receipt.transactionType || 'Virtual Transfer'}</span></div>
          <div class="row"><span class="label">From Account:</span><span class="value">${receipt.sourceAccountNumberMasked || receipt.sourceAccountNumber || '-'} (${receipt.sourceAccountHolder || receipt.sourceAccountName || 'Customer'})</span></div>
          <div class="row"><span class="label">To Account:</span><span class="value">${receipt.destinationAccountNumberMasked || receipt.destinationAccountNumber || '-'} (${receipt.destinationAccountHolder || receipt.destinationAccountName || 'Beneficiary'})</span></div>
          <div class="row"><span class="label">Date & Time:</span><span class="value">${timeFormatted}</span></div>
          <div class="row"><span class="label">Description:</span><span class="value">${receipt.description || 'Simulated fund transfer'}</span></div>
          <div class="footer">
            FinCore Portfolio Simulation System • Not an actual banking financial institution.
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

export const generateReceiptPdf = printReceipt;

export default {
  printReceipt,
  generateReceiptPdf
};
