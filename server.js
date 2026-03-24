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

// Telegram Bot & Gemini API config
const TELEGRAM_BOT_TOKEN = '8386252338:AAFirFqVKJU47o75lhoWuWob5bSvT5m29KA';
const GEMINI_API_KEY = 'AIzaSyBc6FFoQuB-95Q2usPMvT8CAXcZOufeCYM';

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
 * GET /api/status or /api/status/:consentId
 * Check consent status (supports both query param and path param)
 */
app.get('/api/status/:consentId?', async (req, res) => {
  try {
    const token = await getSetuToken();
    const consentId = req.params.consentId || req.query.consentId;
    
    if (!consentId) {
      return res.status(400).json({ success: false, error: 'consentId is required' });
    }

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
 * GET /api/transactions or /api/transactions/:consentId
 * Fetch FI data for an approved consent (supports both query param and path param)
 */
app.get('/api/transactions/:consentId?', async (req, res) => {
  try {
    const token = await getSetuToken();
    const consentId = req.params.consentId || req.query.consentId;

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
 * POST /api/telegram/send
 * Send alert notification via Telegram Bot
 */
app.post('/api/telegram/send', async (req, res) => {
  try {
    const { chatId, message } = req.body;
    if (!chatId || !message) {
      return res.status(400).json({ success: false, error: 'chatId and message are required' });
    }

    const telegramRes = await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }
    );

    res.json({ success: true, result: telegramRes.data.result });
  } catch (err) {
    console.error('❌ Telegram send error:', err.response?.data || err.message);
    res.status(500).json({
      success: false,
      error: err.response?.data?.description || err.message,
    });
  }
});

/**
 * GET /api/telegram/updates
 * Get recent messages to find user's chat ID
 */
app.get('/api/telegram/updates', async (req, res) => {
  try {
    const telegramRes = await axios.get(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=-10`
    );
    
    const chats = (telegramRes.data.result || []).map(u => ({
      chatId: u.message?.chat?.id || u.message?.from?.id,
      username: u.message?.from?.username,
      firstName: u.message?.from?.first_name,
      text: u.message?.text,
    })).filter(c => c.chatId);

    // De-duplicate by chatId
    const unique = [...new Map(chats.map(c => [c.chatId, c])).values()];

    res.json({ success: true, chats: unique });
  } catch (err) {
    console.error('❌ Telegram updates error:', err.response?.data || err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/gemini/insights
 * Generate AI financial insights using Gemini API
 */
app.post('/api/gemini/insights', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, error: 'prompt is required' });
    }

    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const text = geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No insights available.';
    res.json({ success: true, insight: text });
  } catch (err) {
    console.error('❌ Gemini API error:', err.response?.data || err.message);
    res.status(500).json({
      success: false,
      error: err.response?.data?.error?.message || err.message,
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
