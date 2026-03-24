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
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const token = await getSetuToken();

    const now = new Date();
    const oneYearLater = new Date(now);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};

    const consentPayload = {
      consentDuration: { unit: 'YEAR', value: 1 },
      vua: body.vua || '9999999999@onemoney',
      dataRange: {
        from: oneYearAgo.toISOString(),
        to: now.toISOString(),
      },
      context: [],
      redirectUrl: body.redirectUrl || 'https://your-app.vercel.app/dashboard?consent=callback',
      consentMode: 'STORE',
      fetchType: 'PERIODIC',
      consentTypes: ['TRANSACTIONS', 'PROFILE', 'SUMMARY'],
      fiTypes: ['DEPOSIT'],
      Frequency: { unit: 'MONTH', value: 1 },
      DataLife: { unit: 'YEAR', value: 1 },
      purpose: {
        code: '101',
        refUri: 'https://api.rebit.org.in/aa/purpose/101.xml',
        text: 'Wealth management service',
        Category: { type: 'string' },
      },
    };

    const consentRes = await axios.post(`${SETU_BASE}/api/v2/consents`, consentPayload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-product-instance-id': CLIENT_ID,
      },
    });

    const consentId = consentRes.data.id || consentRes.data.consentId;
    const redirectURL = consentRes.data.url || consentRes.data.redirectUrl;

    res.status(200).json({
      success: true,
      consentId,
      redirectURL,
      status: consentRes.data.status || 'PENDING',
    });
  } catch (err) {
    console.error('Consent error:', err.response?.data || err.message);
    res.status(500).json({
      success: false,
      error: err.response?.data?.errorMsg || err.message,
    });
  }
}
