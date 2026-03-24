import React, { useState } from 'react';
import { Card } from '../components/ui';
import { Download, FileText, Share2, Mail, Calendar, Filter, ChevronDown } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function ReportsPage() {
  const { addToast } = useToast();
  const [reportType, setReportType] = useState('Income & Expense Summary');

  const handleDownload = (format) => {
    addToast(`Generating ${format} report...`, 'success');
    setTimeout(() => {
      addToast(`${format} report downloaded successfully!`, 'success');
    }, 1500);
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
                <button className="flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:border-blue-500 transition-colors">
                  <Calendar className="w-4 h-4" /> This Month
                </button>
                <button className="flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-900 border border-blue-500 dark:border-blue-500 ring-1 ring-blue-500 rounded-lg py-2.5 text-sm text-blue-600 dark:text-blue-400 transition-colors">
                  <Calendar className="w-4 h-4" /> Last 3 Months
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Included Accounts</label>
              <button className="w-full flex items-center justify-between bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:border-blue-500 transition-colors">
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
              Your report is ready to be generated. It will include data from 4 accounts covering the last 3 months.
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
              <button className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                <Mail className="w-4 h-4" /> Email to self
              </button>
              <button className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                <Share2 className="w-4 h-4" /> Share Link
              </button>
            </div>
          </div>
          
        </div>
      </Card>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:border-blue-500/50 cursor-pointer transition-colors group">
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
        <Card className="hover:border-blue-500/50 cursor-pointer transition-colors group">
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
        <Card className="hover:border-blue-500/50 cursor-pointer transition-colors group">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-500 transition-colors">Year-End Summary</h4>
              <p className="text-xs text-slate-500 mt-1">Generated: 31 Dec 2024</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
