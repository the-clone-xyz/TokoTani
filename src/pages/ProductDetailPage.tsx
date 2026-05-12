import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Info, CheckCircle } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { formatIDR } from './HomePage';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products } = useProducts();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-600">
        <p className="text-xl mb-4">Produk tidak ditemukan.</p>
        <button onClick={() => navigate('/')} className="text-emerald-600 hover:underline">
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in slide-in-from-bottom-4 duration-300">
      <Link to="/" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6 font-medium">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Kembali ke Katalog
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 md:p-8">
          {/* Image */}
          <div className="rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-auto object-cover max-h-[500px]"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="mb-2">
              <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full">
                {product.category}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <p className="text-3xl font-extrabold text-emerald-600 mb-6">
              {formatIDR(product.price)}
            </p>
            
            <div className="prose prose-sm sm:prose text-gray-600 mb-8">
              <h3 className="text-lg font-medium text-gray-900 flex items-center mb-2">
                <Info className="w-5 h-5 mr-2 text-emerald-500" />
                Deskripsi Produk
              </h3>
              <p>{product.description}</p>
            </div>

            <div className="mt-auto pt-6 border-t border-gray-100">
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-gray-700 font-medium">Atur Jumlah:</span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-l-lg transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 border-x border-gray-300 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-r-lg transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-500">Sisa stok: {product.stock}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleAddToCart}
                  disabled={added}
                  className={`py-3 px-4 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all ${
                    added ? 'bg-green-100 text-green-700' : 'bg-emerald-600 hover:bg-emerald-700 text-white box-shadow-sm'
                  }`}
                >
                  {added ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Ditambahkan!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      <span>Tambah Keranjang</span>
                    </>
                  )}
                </button>
                <button 
                  onClick={() => {
                    if (!added) {
                      addToCart(product, quantity);
                    }
                    navigate('/cart');
                  }}
                  className="py-3 px-4 rounded-xl font-semibold bg-gray-900 hover:bg-gray-800 text-white transition-all shadow-sm"
                >
                  Beli Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
