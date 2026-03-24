import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const SETU_BASE = process.env.SETU_BASE_URL || 'https://fiu-uat.setu.co';
const CLIENT_ID = process.env.SETU_CLIENT_ID;
const CLIENT_SECRET = process.env.SETU_SECRET;

// Cache token in-memory
let cachedToken = null;
let tokenExpiry = 0;

/**
 * Get or refresh Setu access token
 */
async function getSetuToken() {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const res = await axios.post(
      `${SETU_BASE}/api/v2/auth/token`,
      {
        clientID: CLIENT_ID,
        secret: CLIENT_SECRET,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    cachedToken = res.data.token || res.data.access_token;
    // Token usually valid for 300 seconds, refresh a bit early
    tokenExpiry = Date.now() + 280 * 1000;
    return cachedToken;
  } catch (err) {
    console.error('❌ Token fetch failed:', err.response?.data || err.message);
    throw new Error('Failed to obtain Setu token');
  }
}

/**
 * POST /api/consent
 * Creates a consent request with Setu AA
 */
app.post('/api/consent', async (req, res) => {
  try {
    const token = await getSetuToken();

    const now = new Date();
    const oneYearLater = new Date(now);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const consentPayload = {
      consentDuration: {
        unit: 'YEAR',
        value: 1,
      },
      vua: req.body.vua || '9999999999@onemoney',
      dataRange: {
        from: oneYearAgo.toISOString(),
        to: now.toISOString(),
      },
      context: [],
      redirectUrl: req.body.redirectUrl || 'http://localhost:5173/dashboard?consent=callback',
      consentMode: 'STORE',
      fetchType: 'PERIODIC',
      consentTypes: ['TRANSACTIONS', 'PROFILE', 'SUMMARY'],
      fiTypes: ['DEPOSIT'],
      Frequency: {
        unit: 'MONTH',
        value: 1,
      },
      DataLife: {
        unit: 'YEAR',
        value: 1,
      },
      purpose: {
        code: '101',
        refUri: 'https://api.rebit.org.in/aa/purpose/101.xml',
        text: 'Wealth management service',
        Category: {
          type: 'string',
        },
      },
    };

    const consentRes = await axios.post(
      `${SETU_BASE}/api/v2/consents`,
      consentPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-product-instance-id': CLIENT_ID,
        },
      }
    );

    const consentId = consentRes.data.id || consentRes.data.consentId;
    const redirectURL = consentRes.data.url || consentRes.data.redirectUrl;

    res.json({
      success: true,
      consentId,
      redirectURL,
      status: consentRes.data.status || 'PENDING',
    });
  } catch (err) {
    console.error('❌ Consent creation error:', err.response?.data || err.message);
    res.status(500).json({
      success: false,
      error: err.response?.data?.errorMsg || err.message,
    });
  }
});

/**
 * GET /api/status/:consentId
 * Check consent status
 */
app.get('/api/status/:consentId', async (req, res) => {
  try {
    const token = await getSetuToken();
    const { consentId } = req.params;

    const statusRes = await axios.get(
      `${SETU_BASE}/api/v2/consents/${consentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-product-instance-id': CLIENT_ID,
        },
      }
    );

    res.json({
      success: true,
      consentId,
      status: statusRes.data.status,
      detail: statusRes.data,
    });
  } catch (err) {
    console.error('❌ Status check error:', err.response?.data || err.message);
    res.status(500).json({
      success: false,
      error: err.response?.data?.errorMsg || err.message,
    });
  }
});

/**
 * GET /api/transactions/:consentId
 * Fetch FI data for an approved consent
 */
app.get('/api/transactions/:consentId', async (req, res) => {
  try {
    const token = await getSetuToken();
    const { consentId } = req.params;

    // Step 1: Create a data session
    const sessionRes = await axios.post(
      `${SETU_BASE}/api/v2/sessions`,
      {
        consentId,
        dataRange: {
          from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
          to: new Date().toISOString(),
        },
        format: 'json',
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-product-instance-id': CLIENT_ID,
        },
      }
    );

    const sessionId = sessionRes.data.id || sessionRes.data.sessionId;

    // Step 2: Poll session status until COMPLETED (max 30 sec)
    let sessionData = null;
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 2000));

      const pollRes = await axios.get(
        `${SETU_BASE}/api/v2/sessions/${sessionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-product-instance-id': CLIENT_ID,
          },
        }
      );

      if (
        pollRes.data.status === 'COMPLETED' ||
        pollRes.data.status === 'ACTIVE'
      ) {
        sessionData = pollRes.data;
        break;
      }

      if (
        pollRes.data.status === 'FAILED' ||
        pollRes.data.status === 'EXPIRED'
      ) {
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
          balance:
            parseFloat(accSummary.currentBalance || accSummary.balance) || 0,
        });

        const txns =
          account.Transactions?.Transaction ||
          account.transactions ||
          [];

        txns.forEach((txn) => {
          transactions.push({
            date: txn.transactionTimestamp || txn.valueDate || txn.date,
            description:
              txn.narration || txn.description || txn.reference || '',
            amount: parseFloat(txn.amount) || 0,
            type: (txn.type || txn.txnType || 'DEBIT').toUpperCase(),
            bankName,
            reference: txn.reference || '',
            category: txn.category || '',
          });
        });
      });
    });

    // Sort transactions by date descending
    transactions.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    res.json({
      success: true,
      accounts,
      transactions,
      totalAccounts: accounts.length,
      totalTransactions: transactions.length,
    });
  } catch (err) {
    console.error(
      '❌ Transaction fetch error:',
      err.response?.data || err.message
    );
    res.status(500).json({
      success: false,
      error: err.response?.data?.errorMsg || err.message,
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Setu AA Backend running on http://localhost:${PORT}`);
});
