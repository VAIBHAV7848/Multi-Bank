import axios from 'axios';

const SETU_BASE = process.env.SETU_BASE_URL || 'https://fiu-uat.setu.co';
const CLIENT_ID = process.env.SETU_CLIENT_ID;
const CLIENT_SECRET = process.env.SETU_SECRET;

let cachedToken = null;
let tokenExpiry = 0;

async function getSetuToken() {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }
  const res = await axios.post(`${SETU_BASE}/api/v2/auth/token`, {
    clientID: CLIENT_ID,
    secret: CLIENT_SECRET,
  }, {
    headers: { 'Content-Type': 'application/json' },
  });
  cachedToken = res.data.token || res.data.access_token;
  tokenExpiry = Date.now() + 280 * 1000;
  return cachedToken;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const token = await getSetuToken();
    const consentId = req.query.consentId;

    if (!consentId) {
      return res.status(400).json({ success: false, error: 'consentId is required' });
    }

    // Step 1: Create a data session
    const sessionRes = await axios.post(`${SETU_BASE}/api/v2/sessions`, {
      consentId,
      dataRange: {
        from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        to: new Date().toISOString(),
      },
      format: 'json',
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-product-instance-id': CLIENT_ID,
      },
    });

    const sessionId = sessionRes.data.id || sessionRes.data.sessionId;

    // Step 2: Poll session status until COMPLETED (max 30 sec)
    let sessionData = null;
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 2000));

      const pollRes = await axios.get(`${SETU_BASE}/api/v2/sessions/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-product-instance-id': CLIENT_ID,
        },
      });

      if (pollRes.data.status === 'COMPLETED' || pollRes.data.status === 'ACTIVE') {
        sessionData = pollRes.data;
        break;
      }
      if (pollRes.data.status === 'FAILED' || pollRes.data.status === 'EXPIRED') {
        throw new Error(`Session ${pollRes.data.status}`);
      }
    }

    if (!sessionData) {
      throw new Error('Data fetch timed out');
    }

    // Step 3: Parse FI data from all linked banks
    const accounts = [];
    const transactions = [];
    const fiData = sessionData.fips || sessionData.data || [];

    fiData.forEach((fip) => {
      const bankName = fip.fipID || fip.fipId || 'Unknown Bank';

      (fip.Accounts || fip.accounts || []).forEach((account) => {
        const accSummary = account.Summary || account.summary || {};
        const accProfile = account.Profile || account.profile || {};

        accounts.push({
          bankName,
          maskedAccNumber: account.maskedAccNumber || account.linkRefNumber || 'XXXX',
          type: account.type || accProfile.type || 'SAVINGS',
          balance: parseFloat(accSummary.currentBalance || accSummary.balance) || 0,
        });

        const txns = account.Transactions?.Transaction || account.transactions || [];
        txns.forEach((txn) => {
          transactions.push({
            date: txn.transactionTimestamp || txn.valueDate || txn.date,
            description: txn.narration || txn.description || txn.reference || '',
            amount: parseFloat(txn.amount) || 0,
            type: (txn.type || txn.txnType || 'DEBIT').toUpperCase(),
            bankName,
            reference: txn.reference || '',
            category: txn.category || '',
          });
        });
      });
    });

    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.status(200).json({
      success: true,
      accounts,
      transactions,
      totalAccounts: accounts.length,
      totalTransactions: transactions.length,
    });
  } catch (err) {
    console.error('Transaction error:', err.response?.data || err.message);
    res.status(500).json({
      success: false,
      error: err.response?.data?.errorMsg || err.message,
    });
  }
}
