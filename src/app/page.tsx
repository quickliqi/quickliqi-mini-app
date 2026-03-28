import React from 'react';
import { supabase } from '@/lib/supabase';

export const metadata = {
  title: 'QuickLiqi Deals',
  description: 'Live deals from Supabase',
};

export default async function Page() {
  // Fetch deals server‑side
  const { data, error } = await supabase
    .from('scrape_results')
    .select('*');

  if (error) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-4">Error loading deals</h1>
        <pre className="bg-gray-100 p-4 rounded">{error.message}</pre>
      </main>
    );
  }

  if (!data || data.length === 0) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-4">No deals found</h1>
        <p>Database returned an empty result set.</p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Current Deals</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((deal: any) => (
          <div
            key={deal.id}
            className="border rounded-lg p-4 shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold mb-2">
              {deal.title || `Deal #${deal.id}`}
            </h2>
            <p className="text-sm text-gray-600 mb-2">
              {deal.description || 'No description'}
            </p>
            <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto">
{JSON.stringify(deal, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </main>
  );
}
