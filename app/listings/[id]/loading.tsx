import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="p-8 max-w-4xl mx-auto animate-pulse">
      <div className="h-4 w-24 bg-gray-800 rounded mb-8"></div>
      
      <div className="bg-[#0a0a0a] p-8 rounded-2xl border border-gray-800 shadow-2xl relative">
        <div className="absolute top-8 right-8 h-10 w-32 bg-gray-800 rounded-lg"></div>
        
        <div className="h-8 w-2/3 bg-gray-800 rounded mb-4"></div>
        <div className="h-5 w-1/3 bg-gray-800 rounded mb-12"></div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="h-3 w-16 bg-gray-800 rounded mb-3"></div>
              <div className="h-6 w-24 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex items-center justify-center py-12 gap-3 text-cyan-500">
             <Loader2 className="w-6 h-6 animate-spin" />
             <span className="font-medium tracking-widest text-sm uppercase">Loading Record...</span>
          </div>
        </div>
      </div>
    </div>
  );
}