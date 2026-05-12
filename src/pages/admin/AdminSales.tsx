import React from 'react';
import { ShoppingBag } from 'lucide-react';

export default function AdminSales() {
  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <ShoppingBag className="w-6 h-6 mr-2 text-emerald-600" />
          Data Penjualan
        </h1>
        <p className="text-gray-500 text-sm mt-1">Laporan data penjualan produk (Segera hadir).</p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center bg-emerald-50 max-w-xl mx-auto mt-20">
        <div className="w-20 h-20 mx-auto bg-emerald-200 rounded-full flex items-center justify-center text-emerald-700 mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Fitur Segera Hadir</h2>
        <p className="text-gray-600">Fitur pengelolaan laporan penjualan saat ini sedang dalam tahap pengembangan.</p>
      </div>
    </div>
  );
}
