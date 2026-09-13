'use client';
import { useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';
import { IndianRupee, MapPin, Key, Loader2 } from 'lucide-react';

export default function RentalsPage() {
  const [rentals, setRentals] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    const savedState = sessionStorage.getItem('nexus_rentals_state_v1');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      setRentals(parsed.rentals);
      setPage(parsed.page);
      setTotalPages(parsed.totalPages);
      setInitialLoad(false);
      setLoading(false);
    } else {
      loadRentals(1);
    }
  }, []);

  useEffect(() => {
    if (!initialLoad) {
      sessionStorage.setItem('nexus_rentals_state_v1', JSON.stringify({
        rentals, page, totalPages
      }));
    }
  }, [rentals, page, totalPages, initialLoad]);

  const loadRentals = async (targetPage: number) => {
    setLoading(true);
    try {
      const offset = (targetPage - 1) * 50;
      const data = await fetchApi(`/v1/rentals?offset=${offset}&limit=50`);
      setRentals(data.results || data.data || []);
      setPage(targetPage);
      setTotalPages(Math.ceil((data.total || 500) / 50)); 
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const getPaginationGroup = () => {
    let pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages = [1, 2, 3, 4, '...', totalPages - 1, totalPages];
      } else if (page >= totalPages - 2) {
        pages = [1, 2, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [1, '...', page - 1, page, page + 1, '...', totalPages];
      }
    }
    return pages;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
        <Key className="text-cyan-400" /> Properties for Rent
      </h1>
      
      <section className="relative min-h-[400px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950/50 backdrop-blur-sm z-10 rounded-2xl">
            <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rentals.map(rental => (
            <Link href={`/rentals/${rental.listing_id}`} key={rental.listing_id}>
              <div className="bg-gray-900/40 p-6 rounded-2xl border border-gray-800 hover:border-cyan-500/50 hover:bg-gray-900 transition-all cursor-pointer group h-full flex flex-col shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                <h3 className="text-lg font-bold text-gray-100 mb-2 line-clamp-1 group-hover:text-cyan-400 transition-colors">
                  {rental.title}
                </h3>
                <p className="text-gray-400 text-sm mb-6 capitalize flex items-center gap-1.5 flex-1">
                  <MapPin size={14} className="text-gray-500" /> {rental.locality}
                </p>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Monthly Rent</p>
                    <p className="font-bold text-green-400 flex items-center gap-1">
                      <IndianRupee size={14} />{rental.price?.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Deposit</p>
                    <p className="font-bold text-gray-300 flex items-center gap-1">
                      <IndianRupee size={14} />{rental.deposit?.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="border-t border-gray-800/50 pt-4 flex justify-between text-sm text-gray-400 mt-auto">
                  <span>{rental.bedroom} BHK</span>
                  <span className="capitalize text-cyan-400 font-medium">{rental.furnishing}</span>
                  <span>{rental.carpet_area} sqft</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {rentals.length === 0 && !loading && (
          <div className="py-20 text-center text-gray-500 border border-dashed border-gray-800 rounded-2xl">
            No rentals found.
          </div>
        )}
      </section>

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center items-center gap-2 pb-10">
          <button 
            disabled={page === 1}
            onClick={() => loadRentals(page - 1)}
            className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-cyan-500 disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            Prev
          </button>
          
          <div className="flex items-center gap-1">
            {getPaginationGroup().map((item, index) => (
              <button
                key={index}
                disabled={item === '...'}
                onClick={() => typeof item === 'number' && loadRentals(item)}
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium transition-all ${
                  item === page 
                    ? 'bg-cyan-500 text-gray-950 shadow-[0_0_15px_rgba(6,182,212,0.6)] font-bold' 
                    : item === '...' 
                      ? 'text-gray-600 cursor-default' 
                      : 'bg-gray-900 border border-gray-800 text-gray-400 hover:border-cyan-500 hover:text-white'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <button 
            disabled={page === totalPages}
            onClick={() => loadRentals(page + 1)}
            className="px-4 py-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-cyan-500 disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}