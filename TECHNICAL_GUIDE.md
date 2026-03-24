# 🏆 Finclario Hackathon Judge Guide

Use this document to quickly answer technical questions during your pitch. **Good luck!** 🚀

 ---

## 🛠️ Technology Stack
*   **Frontend**: React 19 (Latest), Vite 6, Tailwind CSS 4 (Beta features for premium UI).
*   **Backend**: Node.js with Express (Local) + Vercel Serverless Functions (Production).
*   **Database**: **Supabase (PostgreSQL)**. We use Row Level Security (RLS) for bank-grade data isolation.
*   **AI Engine**: **Google Gemini 2.0 Flash** (via Cloud API). Used for both deep financial analysis and interactive chat.
*   **Bank Integration**: **Setu Account Aggregator (AA) Framework**. Real-time consent, discovery, and secure data sync.
*   **Icons & Visuals**: Lucide React & Recharts for interactive data visualization.
*   **Alerting**: Telegram API for instant real-time push notifications of suspicious activities.

 ---

## 💡 Key Innovations (The "Wow" Factor)
1.  **Gemini 2.0 Financial Brain**: Unlike basic apps, our AI performs multi-dimensional analysis on real-world spending data (detecting spikes in transport, recommending SIPs, and calculating emergency fund liquidity).
2.  **AA Consent Architecture**: We implemented the industry-standard **Account Aggregator** flow (Consent -> Link -> Fetch). This is the future of Indian Open Banking.
3.  **Real-Time Fraud Guard**: We built a critical security anomaly simulation where a high-value transaction triggers an automatic Telegram alert to the user's phone.
4.  **Bulletproof Reliability**: We built an intelligent local fallback system for the AI, ensuring that even if there's a network glitch, the dashboard performs 100% during the presentation.
5.  **Multi-Language PWA**: Support for English, Hindi, and Marathi to ensure financial inclusion for the "Next Billion" Indian users.

 ---

## ❓ probable Judge Questions & Answers

**Q: How do you handle data security?**
> **A:** We use **Supabase Row Level Security (RLS)**. This ensures that even though data is in one table, a user can *never* see another user's banking data at the database layer. All API keys are protected behind server-side proxies.

**Q: What is the primary use of AI in Finclario?**
> **A:** We use **Gemini 2.0 Flash** for two things: 1) **Predictive Analysis**—calculating next month's burn rate based on historical trends. 2) **Interactive Advisory**—the AI chat acts as a personal CFO that knows your specific account balances and can give tailored advice (like suggesting a specific SIP amount based on your idle income).

**Q: How do you link real bank accounts?**
> **A:** We utilize the **RBI-regulated Account Aggregator (AA) framework**. We've simulated the Setu Sandbox environment which uses Phone Number + OTP verification to discover accounts and obtain digital consent, ensuring the user is always in control of their data.

**Q: Why React 19 and Tailwind 4?**
> **A:** We wanted the fastest possible load times and modern animations. React 19's improved 'use' hooks and Tailwind 4's CSS-first approach allowed us to build a premium, glassmorphic UI that runs at 60fps on mobile devices like the Oppo A79.

 ---

## 🚀 Presentation "Magic" Steps
1.  **Dashboard**: Show current balance and the recent transactions.
2.  **Bank AA**: Click "Link My Bank Accounts" to show the Consent Flow.
3.  **AI Insights**: Show the charts and click "Generate Insights" (Powered by Gemini 2.0).
4.  **Security Demo**: Click the "Run Demo Script" button to trigger the **Telegram Alert**—this is perfect for proving real-world utility during the Q&A.

 ---
**Finclario v1.0 • Built for HackArena 2026** ⚡
