import { supabase } from './supabase';

export async function seedInitialData(userId) {
  try {
    // 1. Check if user already has accounts
    const { data: existingAccounts, error: checkError } = await supabase
      .from('accounts')
      .select('id')
      .eq('user_id', userId)
      .limit(1);
      
    if (checkError) throw checkError;
    if (existingAccounts && existingAccounts.length > 0) {
      console.log('User already has data seeded.');
      return; // Already seeded
    }

    console.log('Seeding initial data for user:', userId);

    // 2. Insert Accounts
    const defaultAccounts = [
      { user_id: userId, bank_name: "HDFC Bank", account_name: "Savings", account_type: "Savings", balance: 145000, color: "bg-blue-600" },
      { user_id: userId, bank_name: "SBI", account_name: "Salary", account_type: "Salary", balance: 85000, color: "bg-blue-800" },
      { user_id: userId, bank_name: "ICICI Bank", account_name: "Credit Card", account_type: "Credit", balance: -15400, color: "bg-orange-500" },
      { user_id: userId, bank_name: "Axis Bank", account_name: "Business", account_type: "Current", balance: 320500, color: "bg-rose-700" },
      { user_id: userId, bank_name: "Paytm Payments Bank", account_name: "Wallet", account_type: "Wallet", balance: 4200, color: "bg-sky-500" },
    ];

    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .insert(defaultAccounts)
      .select();

    if (accountsError) throw accountsError;

    // 3. Generate and Insert Transactions
    const generatedTransactions = [];
    const categories = [
      { name: "Food & Dining", emoji: "🍔", min: 200, max: 2500, type: "debit" },
      { name: "Groceries", emoji: "🛒", min: 500, max: 4000, type: "debit" },
      { name: "Transport", emoji: "🚗", min: 100, max: 1500, type: "debit" },
      { name: "Shopping", emoji: "🛍️", min: 1000, max: 8000, type: "debit" },
      { name: "Utilities", emoji: "⚡", min: 500, max: 3000, type: "debit" },
      { name: "Entertainment", emoji: "🎬", min: 300, max: 2000, type: "debit" },
      { name: "Salary", emoji: "💰", min: 50000, max: 90000, type: "credit" },
      { name: "Investment Return", emoji: "📈", min: 1000, max: 5000, type: "credit" },
      { name: "Refund", emoji: "↩️", min: 500, max: 2000, type: "credit" },
      { name: "Freelance", emoji: "💻", min: 10000, max: 30000, type: "credit" }
    ];

    const merchants = {
      "Food & Dining": ["Zomato", "Swiggy", "Starbucks", "Domino's", "Local Cafe"],
      "Groceries": ["Blinkit", "Zepto", "BigBasket", "D-Mart", "Reliance Fresh"],
      "Transport": ["Uber", "Ola", "Metro Recharge", "Indian Oil", "HP Petrol Pump"],
      "Shopping": ["Amazon", "Myntra", "Flipkart", "Zara", "H&M"],
      "Utilities": ["Jio", "Airtel", "Adani Electricity", "Mahanagar Gas", "Water Bill"],
      "Entertainment": ["Netflix", "BookMyShow", "PVR Cinemas", "Spotify", "Amazon Prime"],
      "Salary": ["Tech Corp Inc.", "Design Studio LLC"],
      "Investment Return": ["Zerodha", "Groww", "Upstox"],
      "Refund": ["Amazon Refund", "Myntra Refund"],
      "Freelance": ["Upwork Client", "Fiverr Transfer"]
    };

    // Generate 60 transactions over the last 60 days
    const now = new Date();
    
    for (let i = 0; i < 60; i++) {
      // Pick a random date in the last 60 days
      const date = new Date(now.getTime() - Math.floor(Math.random() * 60 * 24 * 60 * 60 * 1000));
      
      // Pick a random account
      const account = accounts[Math.floor(Math.random() * accounts.length)];
      
      // Determine if debit (85%) or credit (15%)
      const isDebit = Math.random() > 0.15;
      
      // Filter categories by type
      const possibleCategories = categories.filter(c => c.type === (isDebit ? "debit" : "credit"));
      const category = possibleCategories[Math.floor(Math.random() * possibleCategories.length)];
      
      // Pick a merchant
      const merchantList = merchants[category.name];
      const merchant = merchantList[Math.floor(Math.random() * merchantList.length)];
      
      // Generate amount
      let amount = Math.floor(Math.random() * (category.max - category.min + 1)) + category.min;
      
      // Round to nearest 10 for cleaner numbers
      amount = Math.round(amount / 10) * 10;
      
      // Adjust balance logic for credit cards
      if (account.account_type === "Credit" && isDebit) {
        // Technically credit card balance goes up (more negative) on debit, but we'll store amounts as positive 
        // to match standard UI representation, type='debit' handles the minus sign in UI
      }

      generatedTransactions.push({
        user_id: userId,
        account_id: account.id,
        merchant_name: merchant,
        category: category.name,
        category_emoji: category.emoji,
        amount: amount,
        type: isDebit ? 'debit' : 'credit',
        status: Math.random() > 0.95 ? 'pending' : 'completed',
        date: date.toISOString().split('T')[0]
      });
    }

    // Sort by date descending
    generatedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

    const { error: txError } = await supabase
      .from('transactions')
      .insert(generatedTransactions);

    if (txError) throw txError;

    console.log('Successfully seeded database');
    return true;

  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  }
}
