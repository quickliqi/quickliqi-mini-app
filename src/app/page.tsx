export const dynamic = 'force-dynamic';
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

  const fmt = (n: number | null | undefined) =>
    n !== undefined && n !== null ? `$${new Intl.NumberFormat('en-US').format(n)}` : 'N/A';

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Current Deals</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((deal: any) => (
          <div
            key={deal.id}
            className="relative border rounded-lg p-4 shadow hover:shadow-lg transition"
          >
            {/* Buyer badge */}
            {deal.matched_buyer && (
              <span className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                Buyer: {deal.matched_buyer}
              </span>
            )}

            {/* Header */}
            <h2 className="text-xl font-bold mb-2">
              {deal.address || 'Unknown Address'}
            </h2>

            {/* Sub‑header */}
            <p className="text-sm text-gray-600 mb-3">
              {deal.bedrooms ?? '-'} Bed • {deal.bathrooms ?? '-'} Bath •{' '}
              {deal.sqft ?? '-'} SqFt
            </p>

            {/* Financial grid */}
            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
              <div>
                <span className="font-medium">Listing:</span> {fmt(deal.listing_price)}
              </div>
              <div>
                <span className="font-medium">ARV:</span> {fmt(deal.arv)}
              </div>
              <div>
                <span className="font-medium">Rehab:</span> {fmt(deal.estimated_rehab)}
              </div>
              <div>
                <span className="font-medium text-green-600">MAO:</span>{' '}
                {fmt(deal.max_allowable_offer)}
              </div>
            </div>

            {/* Keywords */}
            {Array.isArray(deal.keywords) && (
              <div className="flex flex-wrap gap-1 mt-2">
                {deal.keywords.map((kw: string, i: number) => (
                  <span
                    key={i}
                    className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
