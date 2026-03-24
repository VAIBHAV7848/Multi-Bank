export const formatCurrency = (amount, currency = 'INR') => {
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  } else {
    // Assuming 1 USD = 84 INR
    const usdAmount = amount / 84;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(usdAmount);
  }
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  }).format(date);
};

export const getCategoryColor = (category) => {
  const colors = {
    Food: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    Travel: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    Shopping: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
    Bills: 'bg-red-500/10 text-red-600 dark:text-red-400',
    Entertainment: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    Health: 'bg-green-500/10 text-green-600 dark:text-green-400',
    Education: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    Income: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  };
  return colors[category] || 'bg-slate-500/10 text-slate-600 dark:text-slate-400';
};

export const getCategoryEmoji = (category) => {
  const emojis = {
    Food: '🍔',
    Travel: '✈️',
    Shopping: '🛍️',
    Bills: '🧾',
    Entertainment: '🎬',
    Health: '🏥',
    Education: '📚',
    Income: '💰',
  };
  return emojis[category] || '💸';
};
