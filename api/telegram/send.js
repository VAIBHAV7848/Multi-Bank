import axios from 'axios';

const TELEGRAM_BOT_TOKEN = '8386252338:AAFirFqVKJU47o75lhoWuWob5bSvT5m29KA';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    // Send message
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

      return res.json({ success: true, result: telegramRes.data.result });
    } catch (err) {
      console.error('Telegram send error:', err.response?.data || err.message);
      return res.status(500).json({
        success: false,
        error: err.response?.data?.description || err.message,
      });
    }
  }

  if (req.method === 'GET') {
    // Get updates to find chat IDs
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

      const unique = [...new Map(chats.map(c => [c.chatId, c])).values()];
      return res.json({ success: true, chats: unique });
    } catch (err) {
      console.error('Telegram updates error:', err.response?.data || err.message);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
