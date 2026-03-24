import axios from 'axios';

const GEMINI_API_KEY = 'AIzaSyBc6FFoQuB-95Q2usPMvT8CAXcZOufeCYM';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, error: 'prompt is required' });
    }

    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
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
    return res.json({ success: true, insight: text });
  } catch (err) {
    console.error('Gemini API error:', err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      error: err.response?.data?.error?.message || err.message,
    });
  }
}
