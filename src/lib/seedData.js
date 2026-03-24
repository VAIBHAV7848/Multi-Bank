// Mock data arrays for offline use
const BANKS = [
  { name: 'HDFC Bank', balance: 82450.50, color: '#004c8f', account_number: 'xxxx-4589' },
  { name: 'SBI', balance: 45200.00, color: '#005aa3', account_number: 'xxxx-1204' },
  { name: 'ICICI Bank', balance: 125000.75, color: '#f58220', account_number: 'xxxx-9932' },
  { name: 'Axis Bank', balance: 18400.25, color: '#97144d', account_number: 'xxxx-5511' },
  { name: 'Paytm Payments', balance: 3250.00, color: '#00baf2', account_number: 'xxxx-0098' }
];

const MERCHANTS = [
  { name: 'Swiggy', category: 'Food', min: 150, max: 1200 },
  { name: 'Zomato', category: 'Food', min: 200, max: 1500 },
  { name: 'Uber', category: 'Travel', min: 100, max: 800 },
  { name: 'Ola', category: 'Travel', min: 80, max: 600 },
  { name: 'Amazon', category: 'Shopping', min: 500, max: 15000 },
  { name: 'Flipkart', category: 'Shopping', min: 400, max: 12000 },
  { name: 'Netflix', category: 'Entertainment', min: 649, max: 649 },
  { name: 'Spotify', category: 'Entertainment', min: 119, max: 119 },
  { name: 'Apollo Pharmacy', category: 'Health', min: 200, max: 3500 },
  { name: 'BESCOM', category: 'Bills', min: 800, max: 4500 },
  { name: 'Airtel', category: 'Bills', min: 299, max: 1499 },
  { name: 'BigBasket', category: 'Food', min: 800, max: 4000 },
  { name: 'Myntra', category: 'Shopping', min: 600, max: 5000 },
  { name: 'BookMyShow', category: 'Entertainment', min: 300, max: 2500 },
  { name: 'DMart', category: 'Shopping', min: 1500, max: 8000 }
];

const INCOME_SOURCES = [
  { name: 'Salary', min: 50000, max: 150000 },
  { name: 'Freelance', min: 10000, max: 40000 },
  { name: 'Dividend', min: 500, max: 5000 }
];

export const seedDatabase = async (userId) => {
  try {
    const existingAccounts = localStorage.getItem('mockAccounts');
    
    if (existingAccounts) {
      return { success: true, message: 'Data already exists', accountsSeeded: false };
    }

    // Generate Mock Accounts
    const insertedAccounts = BANKS.map((bank, i) => ({
      ...bank,
      bank_name: bank.name, // Ensure exact key match
      id: `acc-${i}-${userId}`,
      user_id: userId,
      created_at: new Date().toISOString()
    }));

    localStorage.setItem('mockAccounts', JSON.stringify(insertedAccounts));

    // Generate Mock Transactions
    const transactionsToInsert = [];
    const now = new Date();
    
    // Exactly 60 transactions
    for (let i = 0; i < 60; i++) {
      const date = new Date(now.getTime() - Math.random() * 180 * 24 * 60 * 60 * 1000);
      const account = insertedAccounts[Math.floor(Math.random() * insertedAccounts.length)];
      const isDebit = Math.random() > 0.15;
      
      if (isDebit) {
        const merchantInfo = MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)];
        const amount = Math.floor(Math.random() * (merchantInfo.max - merchantInfo.min + 1)) + merchantInfo.min;
        
        transactionsToInsert.push({
          id: `tx-deb-${i}`,
          user_id: userId,
          account_id: account.id,
          merchant: merchantInfo.name,
          amount: amount,
          type: 'debit',
          category: merchantInfo.category,
          created_at: date.toISOString()
        });
      } else {
        const incomeInfo = INCOME_SOURCES[Math.floor(Math.random() * INCOME_SOURCES.length)];
        const amount = Math.floor(Math.random() * (incomeInfo.max - incomeInfo.min + 1)) + incomeInfo.min;
        
        transactionsToInsert.push({
          id: `tx-cre-${i}`,
          user_id: userId,
          account_id: account.id,
          merchant: incomeInfo.name,
          amount: amount,
          type: 'credit',
          category: 'Income',
          created_at: date.toISOString()
        });
      }
    }

    // Sort descending by date
    transactionsToInsert.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    localStorage.setItem('mockTransactions', JSON.stringify(transactionsToInsert));

    return { success: true, message: 'Mock data seeded successfully', accountsSeeded: true };

  } catch (error) {
    console.error('Seeding error:', error);
    throw error;
  }
};
