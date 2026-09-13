'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';
import { MapPin, IndianRupee, Trash2, Heart, Loader2 } from 'lucide-react';

export default function FavouritesPage() {
  const [favourites, setFavourites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/v1/saved')
      .then(data => setFavourites(data.results || data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const removeFav = async (id: string) => {
    try {
      await fetchApi(`/v1/saved/${id}`, { method: 'DELETE' });
      setFavourites(prev => prev.filter(f => f.listing_id !== id));
    } catch (err) {
      console.error("Failed to remove favourite", err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
        <Heart className="text-cyan-400 fill-cyan-400/20" /> Saved Properties
      </h1>
      
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
        </div>
      ) : favourites.length === 0 ? (
        <div className="bg-gray-900/40 border border-dashed border-gray-800 rounded-2xl p-12 text-center">
          <Heart className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-300 mb-2">No saved properties yet</h3>
          <p className="text-gray-500">Go to the feed and click the bookmark button on a property to save it here.</p>
          <Link href="/listings" className="inline-block mt-6 px-6 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/20 transition-all">
            Browse Listings
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favourites.map(listing => (
            <Link 
              href={`/listings/${listing.listing_id}`} 
              key={listing.listing_id} 
              className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800 shadow-lg flex flex-col group hover:border-cyan-500/50 transition-all cursor-pointer block"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-lg font-bold text-gray-100 group-hover:text-cyan-400 transition-colors line-clamp-1">
                  {listing.apartment_name || listing.property_type}
                </span>
                <button 
                  onClick={(e) => {
                    e.preventDefault(); // Stops the Link from triggering when deleting
                    removeFav(listing.listing_id);
                  }} 
                  className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-all shrink-0 z-10"
                  title="Remove from saved"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <p className="text-gray-400 text-sm mb-6 capitalize flex items-center gap-1.5 flex-1">
                <MapPin size={14} className="text-gray-500" /> {listing.locality}
              </p>
              <div className="border-t border-gray-800/50 pt-4 flex justify-between items-end mt-auto">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Asking Price</p>
                  <span className="font-bold text-green-400 flex items-center gap-1 text-lg">
                    <IndianRupee size={16} />{listing.price?.toLocaleString()}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Area</p>
                  <span className="text-gray-300 font-medium">{listing.carpet_area} sqft</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}