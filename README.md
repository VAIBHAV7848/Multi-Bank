# ⚡ Finclario

Finclario is a next-generation AI-powered unified dashboard that provides absolute clarity over your finances. Designed to aggregate all your bank accounts, instantly detect anomalies, provide deep AI-driven financial analysis, and automatically push real-time alerts.

## 🚀 Key Features

- **🌐 Setu Account Aggregator Integration:** Connect multiple bank accounts securely using India's Account Aggregator framework to fetch live balances and transactions.
- **🤖 Gemini AI Financial Advisor:** Leverages the advanced Google Gemini engine (`gemini-flash`) to analyze your spending habits, assess your financial health, and respond to free-form chat queries about your money.
- **📱 Real-time Telegram Alerts:** Features a custom Telegram bot connection that instantly pushes critical security notifications (like anomalous debits) directly to your phone.
- **📄 Professional Reporting Engine:** Instantly generate and download beautifully-formatted PDF Account Statements and detailed CSV transaction matrices without breaking a sweat.
- **🛡️ Secure & Scalable Architecture:** Built on Vite + React 19, styled flawlessly with modern Tailwind CSS, backed by Vercel Serverless Functions and Supabase PostgreSQL.
- **🎯 Smart Goals & Analytics:** Visual analytics via advanced charting to help track net worth, income flows, and budgeting targets effortlessly.

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite 6, Tailwind CSS 4, Lucide React
- **Backend/API:** Vercel Serverless Functions (Node.js)
- **Database:** Supabase (Real-time PostgreSQL)
- **External Apis:** Google Gemini AI, Telegram Bot API, Setu Sandbox (AA)

## 🏃‍♂️ Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/VAIBHAV7848/Multi-Bank.git
   cd Multi-Bank
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up your Environment Variables:**
   Create a `.env` file requiring keys for Supabase and Setu. Note: For the hackathon build, the Telegram & Gemini integrations are handled gracefully via serverless endpoints.

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## 🪄 Hackathon Demo Script (Built-in!)
For presentation purposes, this application includes a master **Run Demo Script** button (floating bottom-right). Triggering this script during your pitch will:
1. Visually intercept an anomaly on the dashboard.
2. Auto-fetch the judge's registered Chat ID.
3. Blast a high-priority security push notification directly through Telegram to prove real-time interactivity.

## 📄 License
Proudly built for the HackArena Hackathon. MIT License.