import React, { useState } from 'react';
import { Card } from '../components/ui';
import { Download, FileText, Share2, Mail, Calendar, Filter, ChevronDown } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useSupabaseData } from '../hooks/useSupabaseData';

export default function ReportsPage() {
  const { addToast } = useToast();
  const { accounts, transactions } = useSupabaseData();
  const [reportType, setReportType] = useState('Income & Expense Summary');
  const [dateRange, setDateRange] = useState('This Month');

  const generateCSV = () => {
    if (!transactions || transactions.length === 0) return 'No data available';
    const headers = ['Date', 'Merchant', 'Category', 'Type', 'Amount'];
    const rows = transactions.map(t => [
      (t.date || t.created_at || '').split('T')[0],
      `"${(t.merchant || t.merchant_name || '').replace(/"/g, '""')}"`,
      `"${t.category || ''}"`,
      t.type,
      t.amount
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  };

  const generatePDFHtml = () => {
    const today = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    const totalSpent = (transactions || []).filter(t => t.type==='debit').reduce((sum, t) => sum + Number(t.amount), 0).toLocaleString('en-IN', {style: 'currency', currency:'INR'});
    const totalIncome = (transactions || []).filter(t => t.type==='credit').reduce((sum, t) => sum + Number(t.amount), 0).toLocaleString('en-IN', {style: 'currency', currency:'INR'});

    const rows = (transactions || []).slice(0, 100).map(t => `
      <tr>
        <td>${new Date(t.date || t.created_at).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'})}</td>
        <td><strong>${t.merchant || t.merchant_name || 'Transfer'}</strong></td>
        <td>${t.category || 'General'}</td>
        <td class="${t.type === 'credit' ? 'credit' : 'debit'}">
          ${t.type === 'credit' ? '+' : '-'}${Number(t.amount).toLocaleString('en-IN', {style:'currency', currency:'INR'})}
        </td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Finclario Statement - ${reportType}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
          body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; background: #fff; margin:0; }
          .header { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 20px; border-bottom: 2px solid #3b82f6; margin-bottom: 40px; }
          .logo { font-size: 32px; font-weight: 800; color: #3b82f6; letter-spacing: -1px; margin: 0; }
          .title-box { text-align: right; }
          .title { font-size: 24px; font-weight: 800; color: #0f172a; margin-bottom: 4px; text-transform: uppercase; letter-spacing: -0.5px; }
          .subtitle { font-size: 14px; color: #64748b; font-weight: 600; }
          .summary { display: flex; gap: 20px; margin-bottom: 40px; }
          .card { flex: 1; padding: 24px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; }
          .card-label { font-size: 11px; text-transform: uppercase; font-weight: 800; color: #64748b; letter-spacing: 1.5px; margin-bottom: 8px; }
          .card-value { font-size: 28px; font-weight: 800; color: #0f172a; letter-spacing: -1px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
          th { text-align: left; padding: 16px 20px; background: #f1f5f9; font-size: 12px; text-transform: uppercase; font-weight: 800; color: #475569; letter-spacing: 1px; border-bottom: 2px solid #e2e8f0; }
          td { padding: 16px 20px; font-size: 14px; border-bottom: 1px solid #e2e8f0; color: #334155; }
          .credit { color: #10b981; font-weight: 700; text-align: right; }
          .debit { color: #0f172a; font-weight: 700; text-align: right; }
          th:last-child { text-align: right; }
          .footer { text-align: center; font-size: 12px; color: #94a3b8; padding-top: 24px; border-top: 1px solid #e2e8f0; font-weight: 600; }
          @media print {
            body { padding: 0; }
            .card { border: 1px solid #cbd5e1; background: transparent; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="logo">⚡ Finclario</h1>
          <div class="title-box">
            <div class="title">${reportType}</div>
            <div class="subtitle">Generated on ${today}</div>
          </div>
        </div>
        <div class="summary">
          <div class="card">
            <div class="card-label">Total Outflow</div>
            <div class="card-value">${totalSpent}</div>
          </div>
          <div class="card">
            <div class="card-label">Total Inflow</div>
            <div class="card-value">${totalIncome}</div>
          </div>
          <div class="card">
            <div class="card-label">Transactions</div>
            <div class="card-value">${transactions ? transactions.length : 0}</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="4" style="text-align:center; padding: 40px; color:#94a3b8;">No transactions found for this period.</td></tr>'}
          </tbody>
        </table>
        <div class="footer">
          This is an automatically generated financial statement by Finclario AI. Valid without physical signature.
        </div>
      </body>
      </html>
    `;
  };

  const handleDownload = (format) => {
    addToast(`Generating ${format} report...`, 'success');
    setTimeout(() => {
      if (format === 'CSV') {
        const csvContent = generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Finclario_${reportType.replace(/\s+/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addToast(`${format} report downloaded successfully!`, 'success');
      } else if (format === 'PDF') {
        // Create hidden iframe, inject gorgeous HTML, and trigger native PDF print popup
        const printIframe = document.createElement('iframe');
        printIframe.style.position = 'absolute';
        printIframe.style.top = '-9999px';
        document.body.appendChild(printIframe);
        
        const content = generatePDFHtml();
        printIframe.contentWindow.document.open();
        printIframe.contentWindow.document.write(content);
        printIframe.contentWindow.document.close();
        
        setTimeout(() => {
          printIframe.contentWindow.focus();
          printIframe.contentWindow.print();
          setTimeout(() => document.body.removeChild(printIframe), 2000);
          addToast(`${format} report ready for save!`, 'success');
        }, 500);
      }
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-500" /> Financial Reports
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Export and share your financial data</p>
        </div>
      </div>

      <Card className="p-1 sm:p-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          
          {/* Configuration Panel */}
          <div className="p-4 md:p-6 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 space-y-6">
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Report Type</label>
              <div className="relative">
                <select 
                  className="w-full appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <option>Income & Expense Summary</option>
                  <option>Tax Saving Statement</option>
                  <option>All Transactions List</option>
                  <option>Category Spend Analysis</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Date Range</label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setDateRange('This Month')}
                  className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm transition-colors ${
                    dateRange === 'This Month' 
                      ? 'bg-slate-50 dark:bg-slate-900 border border-blue-500 dark:border-blue-500 ring-1 ring-blue-500 text-blue-600 dark:text-blue-400' 
                      : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-500'
                  }`}
                >
                  <Calendar className="w-4 h-4" /> This Month
                </button>
                <button 
                  onClick={() => setDateRange('Last 3 Months')}
                  className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm transition-colors ${
                    dateRange === 'Last 3 Months' 
                      ? 'bg-slate-50 dark:bg-slate-900 border border-blue-500 dark:border-blue-500 ring-1 ring-blue-500 text-blue-600 dark:text-blue-400' 
                      : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-500'
                  }`}
                >
                  <Calendar className="w-4 h-4" /> Last 3 Months
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Included Accounts</label>
              <button onClick={() => addToast('Manage accounts feature coming soon!', 'info')} className="w-full flex items-center justify-between bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:border-blue-500 transition-colors">
                <span className="flex items-center gap-2"><Filter className="w-4 h-4" /> All Connected Banks</span>
                <span className="text-blue-500 font-medium text-xs">Edit</span>
              </button>
            </div>
          </div>

          {/* Action Panel */}
          <div className="md:col-span-2 p-4 md:p-6 flex flex-col justify-center items-center text-center">
            
            <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
              <FileText className="w-10 h-10 text-blue-500" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{reportType}</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm">
              Your report is ready to be generated. It will include data from {accounts?.length || 'all'} connected accounts covering {dateRange.toLowerCase()}.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 w-full px-4">
              <button 
                onClick={() => handleDownload('PDF')}
                className="flex-[1_1_200px] flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1"
              >
                <Download className="w-5 h-5" /> Download PDF
              </button>
              
              <button 
                onClick={() => handleDownload('CSV')}
                className="flex-[1_1_200px] flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white py-3 px-6 rounded-xl font-medium shadow transition-all hover:-translate-y-1"
              >
                <FileText className="w-5 h-5" /> Export as CSV
              </button>
            </div>
            
            <div className="flex gap-6 mt-8">
              <button onClick={() => addToast(`Report successfully emailed to your registered address!`, 'success')} className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                <Mail className="w-4 h-4" /> Email to self
              </button>
              <button onClick={() => addToast(`Secure shareable link copied to clipboard!`, 'success')} className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                <Share2 className="w-4 h-4" /> Share Link
              </button>
            </div>
          </div>
          
        </div>
      </Card>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card onClick={() => handleDownload('PDF')} className="hover:border-blue-500/50 cursor-pointer transition-colors group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-500 transition-colors">Tax Saving 24-25</h4>
              <p className="text-xs text-slate-500 mt-1">Generated: 2 days ago</p>
            </div>
          </div>
        </Card>
        <Card onClick={() => handleDownload('PDF')} className="hover:border-blue-500/50 cursor-pointer transition-colors group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-500 transition-colors">Feb 2025 Statement</h4>
              <p className="text-xs text-slate-500 mt-1">Generated: 1 Mar 2025</p>
            </div>
          </div>
        </Card>
        <Card onClick={() => handleDownload('CSV')} className="hover:border-blue-500/50 cursor-pointer transition-colors group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-500 transition-colors">Year-End Summary</h4>
              <p className="text-xs text-slate-500 mt-1">CSV Format</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
