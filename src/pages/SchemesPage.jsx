import React, { useState } from 'react';
import { PageTransition, Card } from '../components/ui';
import { Landmark, GraduationCap, Building, Banknote, Briefcase, HelpCircle, Star, ArrowRight } from 'lucide-react';

export default function SchemesPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  
  const filters = ['All', 'Government', 'Agriculture', 'Education', 'Housing', 'Business'];

  function HomeIcon(props) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
  }

  const schemes = [
    { id: 1, title: 'Pradhan Mantri Mudra Yojana', org: 'Govt of India', category: 'Business', icon: <Building className="w-6 h-6 text-blue-500" />, tags: ['MSME', 'No Collateral'], match: 98, rating: 4.8 },
    { id: 2, title: 'Kisan Credit Card (KCC)', org: 'RBI & NABARD', category: 'Agriculture', icon: <Landmark className="w-6 h-6 text-emerald-500" />, tags: ['Farmers', 'Low Interest'], match: 65, rating: 4.5 },
    { id: 3, title: 'Vidya Lakshmi Education Loan', org: 'NSDL', category: 'Education', icon: <GraduationCap className="w-6 h-6 text-purple-500" />, tags: ['Students', 'Subsidized'], match: 82, rating: 4.2 },
    { id: 4, title: 'PMAY Housing Subsidy', org: 'Min. of Housing', category: 'Housing', icon: <HomeIcon className="w-6 h-6 text-rose-500" />, tags: ['Urban/Rural', 'First Home'], match: 90, rating: 4.7 },
    { id: 5, title: 'Stand-Up India Scheme', org: 'Govt of India', category: 'Business', icon: <Briefcase className="w-6 h-6 text-indigo-500" />, tags: ['Women/SC/ST', 'Greenfield'], match: 75, rating: 4.4 },
    { id: 6, title: 'Gold Loan Quick Disbursement', org: 'HDFC Bank', category: 'Government', icon: <Banknote className="w-6 h-6 text-amber-500" />, tags: ['Instant', 'Low Rate'], match: 88, rating: 4.6 }
  ];

  const filteredSchemes = activeFilter === 'All' ? schemes : schemes.filter(s => s.category === activeFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Landmark className="w-6 h-6 text-indigo-500" /> Loans & Schemes
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Discover personalized subsidies and loan opportunities</p>
        </div>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start sm:items-center gap-4">
          <div className="p-3 bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/30 shrink-0">
            <Star className="w-6 h-6 fill-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">Personalized Recommendations</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">Based on your activity and income patterns, we found <strong className="text-blue-600 dark:text-blue-400">3 schemes</strong> with a 90%+ approval probability for your profile.</p>
          </div>
          <button className="hidden sm:flex shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors items-center gap-2">
            Apply Now <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeFilter === f 
                ? 'bg-slate-800 text-white shadow dark:bg-slate-100 dark:text-slate-900' 
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchemes.map(s => (
          <Card key={s.id} className="relative cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            {s.match > 85 && (
              <span className="absolute -top-3 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                {s.match}% MATCH
              </span>
            )}
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                {s.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 leading-tight">{s.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{s.org}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {s.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium rounded-md">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{s.rating}</span>
              </div>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 group">
                View Details <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
