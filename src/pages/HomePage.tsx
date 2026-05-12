import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';

// Helper to format currency
export const formatIDR = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

export default function HomePage() {
  const { products } = useProducts();
  const { addToCart } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-center justify-between mb-16 lg:mb-24 gap-12 pt-8">
        <div className="lg:w-1/2 space-y-6 text-center lg:text-left">
          <div className="inline-block bg-emerald-100 text-emerald-800 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide mb-2 border border-emerald-200 shadow-sm">
            🌱 Panen Melimpah Bersama Kami
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-emerald-950 tracking-tight leading-[1.1]">
            Sahabat <span className="text-emerald-600">Terbaik</span><br />Petani Indonesia
          </h1>
          <p className="text-lg sm:text-xl text-emerald-800/80 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
            TokoTani menyediakan benih unggul, pupuk berkualitas, hingga alat pertanian modern untuk memaksimalkan hasil panen Anda dengan harga terbaik.
          </p>
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <a href="#katalog" className="w-full sm:w-auto inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-emerald-600/30 transition-all hover:-translate-y-0.5">
              Mulai Belanja
            </a>
            <a href="#katalog" className="w-full sm:w-auto inline-block bg-white hover:bg-emerald-50 text-emerald-700 px-8 py-3.5 rounded-2xl font-bold border border-emerald-200 shadow-sm transition-all">
              Lihat Katalog
            </a>
          </div>
        </div>
        
        <div className="lg:w-1/2 relative flex justify-center lg:justify-end w-full mt-8 lg:mt-0">
          {/* Decorative Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-tr from-emerald-200 to-green-100 rounded-full blur-3xl -z-10 opacity-60"></div>
          
          <div className="relative w-full max-w-[500px]">
            <div className="aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl ring-1 ring-black/5 relative group">
              <img 
                src="https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&q=80&w=1200"
                alt="Petani Indonesia"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            </div>
            
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -left-6 sm:-left-10 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 animate-bounce relative z-10" style={{ animationDuration: '3s' }}>
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shadow-inner">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-gray-900">Produk Terjamin</p>
                <p className="text-xs text-gray-500 font-medium">100% Kualitas Asli</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="katalog" className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Katalog Produk</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col">
            <Link to={`/product/${product.id}`} className="block relative h-36 sm:h-48 overflow-hidden group">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2 bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-1 rounded-full">
                {product.category}
              </div>
            </Link>
            <div className="p-3 sm:p-4 flex flex-col flex-grow">
              <Link to={`/product/${product.id}`}>
                <h3 className="text-sm sm:text-lg font-semibold text-gray-900 hover:text-emerald-600 transition-colors line-clamp-2 mb-1">
                  {product.name}
                </h3>
              </Link>
              <p className="text-emerald-600 font-bold text-sm sm:text-lg mb-3">
                {formatIDR(product.price)}
              </p>
              <div className="mt-auto">
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addToCart(product);
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-2 sm:px-4 py-2 rounded-lg flex items-center justify-center space-x-1 sm:space-x-2 transition-colors text-xs sm:text-base cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Tambah Keranjang</span>
                  <span className="inline sm:hidden">Tambah</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
