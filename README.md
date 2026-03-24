# ⚡ Finclario — Your Financial Command Center

[![Deployment](https://img.shields.io/badge/Deployed-Vercel-black?style=for-the-badge&logo=vercel)](https://multi-bank.vercel.app/)
[![Technology](https://img.shields.io/badge/Stack-React_19_|_Supabase-blue?style=for-the-badge&logo=react)](https://github.com/VAIBHAV7848/Multi-Bank)
[![AI](https://img.shields.io/badge/AI-Gemini_Flash-purple?style=for-the-badge&logo=google-gemini)](https://deepmind.google/technologies/gemini/)

> **Absolute clarity over your finances.** Finclario is an AI-first unified dashboard that aggregates bank accounts, provides live spending insights, and protects your wealth with real-time anomaly detection.

---

## 🌟 The Finclario Experience

Finclario solves the fragmentation of modern banking by bringing all your accounts into a single, high-fidelity command center.

### 🚀 **Key Innovations**
- **🤖 Gemini AI Insights:** Powered by `gemini-flash-latest`, our AI engine analyzes real-time spending patterns to give you proactive savings advice and detect financial leakages.
- **🌐 Account Aggregator (AA):** Secure, consent-driven bank integration using the **Setu AA Simulator**, fetching live balances and transaction history across all major Indian banks.
- **📱 Triple-Threat Auth:** A versatile login system supporting **Google OAuth**, **Email/Password**, and **Phone + OTP** (Simulated) for a seamless entry experience.
- **🔔 Real-time Alerts:** Integrated **Telegram Bot** for instant security notifications, ensuring you never miss a suspicious transaction.
- **🏛️ Modern Dashboard:** A premium, glassmorphic UI built with **Tailwind CSS 4** and **React 19**, optimized for both Desktop and Mobile (Oppo A79 & more).

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite 6, Framer Motion, Lucide Icons |
| **Styling** | Tailwind CSS 4 (Next-gen CSS) |
| **Backend** | Vercel Serverless Functions (Node.js) |
| **Database** | Supabase (PostgreSQL with RLS Security) |
| **AI Engine** | Google Gemini 1.5 Flash |
| **AA Gateway** | Setu Account Aggregator Framework |

---

## 🏃‍♂️ Quick Start (Local Setup)

```bash
# 1. Clone the repository
git clone https://github.com/VAIBHAV7848/Multi-Bank.git
cd Multi-Bank

# 2. Install dependencies
npm install

# 3. Configure Environment
# Create a .env file with your SUPABASE_URL and SUPABASE_ANON_KEY

# 4. Launch Development Server
npm run dev
```

---

## 🪄 Hackathon Demo Script (Built-in!)

For the best demo experience, use these built-in "Cheat Codes":
1. **Magic Login**: Use any email/password or any 10-digit phone number with OTP `123456` to log in instantly.
2. **Quick Sync**: On the AI Insights page, hit the **"Quick Sync Demo Data"** button to instantly populate the dashboard with realistic bank data for the judges' view.
3. **AI Chat**: Ask Gemini things like *"How can I save money this month?"* for a live demonstration of our financial intelligence engine.

---

## 🛡️ Security & Privacy
At Finclario, security is not an afterthought. We implement:
- **Supabase RLS**: Row Level Security ensures your data is only accessible to you.
- **Data Anonymization**: Sensitive transaction data is filtered before processing through the AI engine.
- **Consent-First**: No bank data is fetched without your explicit approval via the AA framework.

---

Built with ❤️ for **HackArena 2026** by [Vaibhav](https://github.com/VAIBHAV7848).
🏆 *Unified Banking. Intelligent Insights. Absolute Clarity.*