import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatIDR } from './HomePage';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center animate-in fade-in">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Keranjang Belanja Kosong</h2>
        <p className="text-gray-500 mb-8 max-w-md">
          Anda belum menambahkan barang apapun ke keranjang belanja. Yuk, mulai belanja kebutuhan pertanian Anda!
        </p>
        <Link 
          to="/" 
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
        >
          Mulai Belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Keranjang Belanja</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-center">
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-24 h-24 object-cover rounded-lg bg-gray-50"
              />
              <div className="flex-grow">
                <Link to={`/product/${item.id}`} className="text-lg font-semibold text-gray-900 hover:text-emerald-600 line-clamp-1">
                  {item.name}
                </Link>
                <p className="text-emerald-600 font-bold mb-3">{formatIDR(item.price)}</p>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 text-gray-500 hover:bg-gray-50 rounded-l-lg"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-3 min-w-[2.5rem] text-center font-medium text-sm">
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 text-gray-500 hover:bg-gray-50 rounded-r-lg"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 flex items-center text-sm font-medium transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Hapus
                  </button>
                </div>
              </div>
              <div className="hidden sm:block text-right self-start font-bold text-gray-900">
                {formatIDR(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Ringkasan Belanja</h3>
            
            <div className="space-y-3 mb-6 pb-6 border-b border-gray-100 text-gray-600">
              <div className="flex justify-between">
                <span>Total Harga ({cart.length} barang)</span>
                <span>{formatIDR(cartTotal)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold text-gray-900">Total Belanja</span>
              <span className="text-xl font-extrabold text-emerald-600">{formatIDR(cartTotal)}</span>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold flex items-center justify-center transition-colors mb-3"
            >
              <span>Lanjut ke Checkout</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <Link 
              to="/" 
              className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-3 rounded-xl font-semibold flex items-center justify-center transition-colors"
            >
              Kembali Belanja
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
