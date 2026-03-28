export const dynamic = 'force-dynamic';
import React from 'react';
import { supabase } from '@/lib/supabase';

export const metadata = {
  title: 'QuickLiqi - Autonomous Wholesaling',
  description: 'Live property dashboard',
};

const fmt = (n: number | null | undefined) =>
  n !== undefined && n !== null ? `$${new Intl.NumberFormat('en-US').format(n)}` : 'N/A';

export default async function Page() {
  const { data, error } = await supabase.from('scrape_results').select('*');

  if (error) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold text-white mb-4">Error loading deals</h1>
        <pre className="bg-gray-900 p-4 rounded text-white">{error.message}</pre>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white relative font-sans">
      {/* ------------------- Header ------------------- */}
      <header className="flex items-center justify-between bg-zinc-900 px-5 py-4 border-b border-zinc-800">
        <div className="flex items-center space-x-3">
          <div className="bg-yellow-400 p-1.5 rounded-full">
            <svg className="h-5 w-5 text-black" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">QuickLiqi</h1>
            <p className="text-xs text-zinc-400">Autonomous Wholesaling</p>
          </div>
        </div>
        <button className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-bold text-black hover:bg-yellow-300 flex items-center shadow-lg shadow-yellow-400/20">
          <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          Start Swarm
        </button>
      </header>

      {/* ------------------- Search Bar ------------------- */}
      <div className="px-5 py-4">
        <div className="relative">
          <svg className="absolute left-3 top-2.5 h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, company, or area..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-yellow-400"
          />
        </div>
      </div>

      {/* ------------------- Section Title ------------------- */}
      <div className="flex items-center justify-between px-5 pb-4">
        <h2 className="text-xl font-bold text-white">Properties</h2>
        <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300">{data?.length || 0} active</span>
      </div>

      {/* ------------------- Property Grid ------------------- */}
      <main className="flex-1 overflow-y-auto px-5 pb-24">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {data && data.length > 0 ? data.map((deal: any) => (
            <article key={deal.id} className="relative rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-sm">
              {/* Buyer badge */}
              {deal.matched_buyer && (
                <div className="absolute top-5 right-5 flex items-center space-x-1">
                  <span className="text-yellow-400">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                  </span>
                </div>
              )}

              {/* Address */}
              <h3 className="text-lg font-bold text-white pr-8">{deal.address || 'Unknown Address'}</h3>
              
              {/* Sub-header */}
              <div className="mt-1 flex items-center text-sm text-zinc-400 space-x-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                <span>{deal.bedrooms ?? '-'} Bed • {deal.bathrooms ?? '-'} Bath • {deal.sqft ?? '-'} SqFt</span>
              </div>

              {/* Badges / Keywords */}
              {Array.isArray(deal.keywords) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300">
                    Buyer: {deal.matched_buyer || 'Unassigned'}
                  </span>
                  {deal.keywords.slice(0, 2).map((kw: string, i: number) => (
                    <span key={i} className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300 capitalize">
                      {kw}
                    </span>
                  ))}
                </div>
              )}

              {/* Financial block */}
              <div className="mt-5 grid grid-cols-2 gap-y-3 gap-x-4 border-t border-zinc-800 pt-4">
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-500">Listing:</span>
                  <span className="text-sm font-medium text-white">{fmt(deal.listing_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-500">ARV:</span>
                  <span className="text-sm font-medium text-white">{fmt(deal.arv)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-500">Rehab:</span>
                  <span className="text-sm font-medium text-white">{fmt(deal.estimated_rehab)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-bold text-green-500">MAO:</span>
                  <span className="text-sm font-bold text-green-400">{fmt(deal.max_allowable_offer)}</span>
                </div>
              </div>
            </article>
          )) : <p className="text-zinc-500">No properties found in database.</p>}
        </div>
      </main>

      {/* ------------------- Bottom Navigation ------------------- */}
      <nav className="fixed bottom-0 left-0 right-0 flex justify-around bg-zinc-950 border-t border-zinc-800 py-2 pb-6 z-50">
        <button className="flex flex-col items-center text-[10px] text-zinc-500 hover:text-white transition-colors">
          <svg className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          Dashboard
        </button>
        <button className="flex flex-col items-center text-[10px] text-yellow-400">
          <svg className="h-6 w-6 mb-1" fill="currentColor" viewBox="0 0 24 24"><path d="M3 3h18v2H3V3zm0 4h12v2H3V7zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm0 4h18v2H3v-2z" /></svg>
          Properties
        </button>
        <button className="flex flex-col items-center text-[10px] text-zinc-500 hover:text-white transition-colors">
          <svg className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          Buyers
        </button>
        <button className="flex flex-col items-center text-[10px] text-zinc-500 hover:text-white transition-colors">
          <svg className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          Settings
        </button>
      </nav>
    </div>
  );
}
