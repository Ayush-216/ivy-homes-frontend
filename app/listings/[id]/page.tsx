'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';

export default function ListingDetail() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchApi(`/v1/listings/${params.id}`)
      .then(setListing)
      .catch(console.error)
      .finally(() => setLoading(false));

    // Check if already saved
    fetchApi('/v1/favourites')
      .then(data => {
        const isSaved = (data.results || []).some((fav: any) => fav.listing_id === params.id);
        setSaved(isSaved);
      }).catch(console.error);
  }, [params.id]);

  const toggleSave = async () => {
    try {
      if (saved) {
        await fetchApi(`/v1/favourites/${params.id}`, { method: 'DELETE' });
        setSaved(false);
      } else {
        await fetchApi('/v1/favourites', { 
          method: 'POST', 
          body: JSON.stringify({ id: params.id }) 
        });
        setSaved(true);
      }
    } catch (err) {
      console.error("Failed to toggle save", err);
    }
  };

  if (loading) return <div className="p-8 text-cyan-400">Decrypting file...</div>;
  if (!listing) return <div className="p-8 text-red-500">Record not found.</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="text-gray-400 hover:text-white mb-6">← Back to Feed</button>
      
      <div className="bg-[#0a0a0a] p-8 rounded-xl border border-gray-800 shadow-2xl relative">
        <button 
          onClick={toggleSave}
          className={`absolute top-8 right-8 px-4 py-2 rounded font-bold transition-colors ${
            saved ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          {saved ? '★ Saved to Favourites' : '☆ Save Listing'}
        </button>

        <h1 className="text-3xl font-bold text-white mb-2">{listing.apartment_name || 'Independent Property'}</h1>
        <p className="text-cyan-400 capitalize text-lg mb-8">{listing.locality}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <p className="text-gray-500 text-sm">Price</p>
            <p className="text-xl font-bold text-green-400">₹{listing.price.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Configuration</p>
            <p className="text-xl font-bold text-white">{listing.bedroom} BHK</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Area</p>
            <p className="text-xl font-bold text-white">{listing.carpet_area} sqft</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Furnishing</p>
            <p className="text-xl font-bold text-white capitalize">{listing.furnishing}</p>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6">
          <h3 className="text-lg font-bold text-gray-200 mb-3">Seller Remarks</h3>
          <p className="text-gray-400 leading-relaxed">{listing.description}</p>
        </div>

        <div className="border-t border-gray-800 mt-6 pt-6">
          <p className="text-sm text-gray-500">Contact <span className="text-gray-300">{listing.posted_by_name}</span> at <span className="text-blue-400">{listing.posted_by_contact}</span></p>
        </div>
      </div>
    </div>
  );
}