import React, { useState } from 'react';
import { PageTransition, Card } from '../components/ui';
import { Landmark, GraduationCap, Building, Banknote, Briefcase, HelpCircle, Star, ArrowRight, X, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function SchemesPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedScheme, setSelectedScheme] = useState(null);
  
  const filters = ['All', 'Government', 'Agriculture', 'Education', 'Housing', 'Business'];

  function HomeIcon(props) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
  }

  const schemes = [
    { 
      id: 1, 
      title: 'Pradhan Mantri Mudra Yojana', 
      org: 'Govt of India', 
      category: 'Business', 
      icon: <Building className="w-6 h-6 text-blue-500" />, 
      tags: ['MSME', 'No Collateral', 'Up to ₹10L'], 
      match: 98, 
      rating: 4.8,
      description: 'MUDRA stands for Micro Units Development & Refinance Agency Ltd. It provides refinancing support to Banks / MFIs for lending to micro businesses having loan requirement up to ₹10 lakh.',
      eligibility: ['Non-Corporate Small Business', 'Trading, manufacturing, or service sector', 'Allied agricultural activities'],
      interest: 'Bank Base Rate + 1-7%',
      url: 'https://www.mudra.org.in/',
      features: ['Shishu (up to ₹50K)', 'Kishore (₹50K-₹5L)', 'Tarun (₹5L-₹10L)']
    },
    { 
      id: 2, 
      title: 'Kisan Credit Card (KCC)', 
      org: 'RBI & NABARD', 
      category: 'Agriculture', 
      icon: <Landmark className="w-6 h-6 text-emerald-500" />, 
      tags: ['Farmers', 'Low Interest', 'Card Linked'], 
      match: 65, 
      rating: 4.5,
      description: 'The KCC scheme provides timely credit to farmers for crop cultivation, post-harvest expenses, consumption requirements, and maintenance of farm assets.',
      eligibility: ['Individual/Joint Borrowers who are farmers', 'Tenant Farmers, Oral Lessees', 'SHGs or Joint Liability Groups'],
      interest: '7% (Up to 3% subvention for prompt repayment)',
      url: 'https://www.myscheme.gov.in/schemes/kcc',
      features: ['Credit limit up to ₹3 lakh', 'Flexible repayment', 'Includes crop insurance premium']
    },
    { 
      id: 3, 
      title: 'Vidya Lakshmi Education Loan', 
      org: 'NSDL', 
      category: 'Education', 
      icon: <GraduationCap className="w-6 h-6 text-purple-500" />, 
      tags: ['Students', 'Subsidized', 'Single Portal'], 
      match: 82, 
      rating: 4.2,
      description: 'Vidya Lakshmi is a first of its kind portal for students seeking Education Loan. Developed by NSDL e-Governance under the guidance of Ministry of Finance, MoE, and IBA.',
      eligibility: ['Indian Citizen', 'Secured admission in recognized institution', 'Approved course of study'],
      interest: 'Subsidized during study period (CSIS)',
      url: 'https://www.vidyalakshmi.co.in/Students/',
      features: ['Apply to multiple banks', 'Track application status', 'Link to National Scholarship Portal']
    },
    { 
      id: 4, 
      title: 'PMAY Housing Subsidy', 
      org: 'Min. of Housing', 
      category: 'Housing', 
      icon: <HomeIcon className="w-6 h-6 text-rose-500" />, 
      tags: ['Urban/Rural', 'First Home', 'Subsidy'], 
      match: 90, 
      rating: 4.7,
      description: 'Pradhan Mantri Awas Yojana offers Credit Linked Subsidy Scheme (CLSS) to EWS, LIG, and MIG categories for buying, constructing, or enhancing their first home.',
      eligibility: ['Family MUST NOT own a pucca house in India', 'Income strictly within EWS/LIG/MIG bounds', 'Female co-ownership mandatory (in most cases)'],
      interest: 'Up to ₹2.67 Lakh upfront interest subsidy',
      url: 'https://pmaymis.gov.in/',
      features: ['Subsidy credited directly to loan account', '20 years max tenure', 'Lower EMIs immediately']
    },
    { 
      id: 5, 
      title: 'Stand-Up India Scheme', 
      org: 'Govt of India', 
      category: 'Business', 
      icon: <Briefcase className="w-6 h-6 text-indigo-500" />, 
      tags: ['Women/SC/ST', 'Greenfield', '₹10L-₹1Cr'], 
      match: 75, 
      rating: 4.4,
      description: 'Stand Up India Scheme facilitates bank loans between ₹10 lakh and ₹1 Crore to at least one SC/ST borrower or one Woman borrower per bank branch for setting up a greenfield enterprise.',
      eligibility: ['SC/ST and/or women entrepreneurs, above 18 years', 'Loans for greenfield enterprises only', 'Non-defaulting borrower'],
      interest: 'Lowest applicable rate (Base Rate + 3%)',
      url: 'https://www.standupmitra.in/',
      features: ['Composite loan (Term + Working Capital)', 'Coverage by Credit Guarantee Fund (CGFSIL)', '7 year repayment period']
    },
    { 
      id: 6, 
      title: 'StartUp India Seed Fund', 
      org: 'DPIIT', 
      category: 'Business', 
      icon: <Building className="w-6 h-6 text-amber-500" />, 
      tags: ['Startups', 'Seed Capital', 'Incubators'], 
      match: 88, 
      rating: 4.6,
      description: 'Provides financial assistance to startups for proof of concept, prototype development, product trials, market entry, and commercialization.',
      eligibility: ['Recognized as a Startup by DPIIT', 'Incorporated less than 2 years ago', 'Tech-enabled core product'],
      interest: 'Up to ₹20L as Grant, up to ₹50L as Debt',
      url: 'https://seedfund.startupindia.gov.in/',
      features: ['No collateral for grants', 'Mentorship via recognized incubators', 'Flexible milestone payments']
    }
  ];

  const filteredSchemes = activeFilter === 'All' ? schemes : schemes.filter(s => s.category === activeFilter);

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Landmark className="w-6 h-6 text-indigo-500" /> Loans & Schemes
          </h2>
          <p className="text-slate-500 dark:text-slate-400">Discover real, personalized subsidies and loan opportunities</p>
        </div>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start sm:items-center gap-4">
          <div className="p-3 bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/30 shrink-0">
            <Star className="w-6 h-6 fill-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">Personalized Recommendations</h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">Based on your activity and income patterns, we found <strong className="text-blue-600 dark:text-blue-400">3 schemes</strong> with a 90%+ approval probability for your profile.</p>
          </div>
          <button 
            onClick={() => setSelectedScheme(schemes[0])}
            className="hidden sm:flex shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md shadow-blue-500/20 transition-all items-center gap-2 hover:-translate-y-0.5"
          >
            View Top Match <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeFilter === f 
                ? 'bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900' 
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800 dark:hover:border-slate-700 dark:text-slate-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSchemes.map(s => (
          <Card 
            key={s.id} 
            onClick={() => setSelectedScheme(s)}
            className="relative cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 group"
          >
            {s.match > 85 && (
              <span className="absolute -top-3 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-md z-10">
                {s.match}% MATCH
              </span>
            )}
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 shrink-0 group-hover:scale-110 transition-transform">
                {s.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{s.title}</h3>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">{s.org}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-5">
              {s.tags.map(tag => (
                <span key={tag} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider rounded-lg">
                  {tag}
                </span>
              ))}
            </div>
            
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{s.rating}</span>
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-lg">
                View Policy <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* DETAILED MODAL */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" 
            onClick={() => setSelectedScheme(null)}
          />
          <Card className="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-900 shadow-2xl animate-scale-in p-0 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-start sticky top-0">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-700">
                  {selectedScheme.icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                    {selectedScheme.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Official Portal Link</span>
                    <span className="text-slate-300 dark:text-slate-600 mx-1">•</span>
                    <span className="text-sm font-bold text-slate-500">{selectedScheme.org}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedScheme(null)}
                className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors border border-slate-200 dark:border-slate-700"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="space-y-6">
                
                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2">Overview</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
                    {selectedScheme.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Financials / Interest */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-white mb-3">
                      <Banknote className="w-4 h-4 text-emerald-500" /> Pricing & Interest
                    </h4>
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 break-words">
                      {selectedScheme.interest}
                    </p>
                  </div>

                  {/* Key Features */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-white mb-3">
                      <Star className="w-4 h-4 text-amber-500" /> Key Features
                    </h4>
                    <ul className="space-y-2">
                      {selectedScheme.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                          <span className="leading-tight">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Eligibility */}
                <div>
                  <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-3">Eligibility Criteria</h4>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                      {selectedScheme.eligibility.map((item, i) => (
                        <li key={i} className="p-4 flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
                          <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 sticky bottom-0 flex justify-between items-center sm:flex-row flex-col gap-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
                You will be redirected to the secure government portal: <br/> 
                <span className="font-mono mt-1 inline-block">{selectedScheme.url}</span>
              </p>
              <a 
                href={selectedScheme.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 hover:-translate-y-0.5 whitespace-nowrap"
              >
                Apply on Official Portal <ExternalLink className="w-4 h-4" />
              </a>
            </div>

          </Card>
        </div>
      )}

    </div>
  );
}
