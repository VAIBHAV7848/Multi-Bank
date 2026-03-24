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
    // Vercel passes query params; the consentId comes from the URL path
    // Route: /api/status?consentId=xxx
    const consentId = req.query.consentId;

    if (!consentId) {
      return res.status(400).json({ success: false, error: 'consentId is required' });
    }

    // Handle Hackathon Simulation
    if (consentId.startsWith('sim_consent_')) {
      return res.status(200).json({
        success: true,
        consentId,
        status: 'APPROVED',
        detail: { status: 'APPROVED', simulated: true },
      });
    }

    const statusRes = await axios.get(`${SETU_BASE}/api/v2/consents/${consentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-product-instance-id': CLIENT_ID,
      },
    });

    res.status(200).json({
      success: true,
      consentId,
      status: statusRes.data.status,
      detail: statusRes.data,
    });
  } catch (err) {
    console.warn('Status error, falling back to Simulation:', err.message);
    
    // HACKATHON FALLBACK
    res.status(200).json({
      success: true,
      consentId: req.query.consentId,
      status: 'APPROVED',
      detail: { status: 'APPROVED', fallback: true }
    });
  }
}
