import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Leaf } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Set initial state
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`sticky top-0 z-50 w-full flex justify-center transition-all duration-300 ${isScrolled ? 'pt-4 px-4 sm:px-6 lg:px-8' : ''}`}>
      <nav className={`w-full transition-all duration-300 text-emerald-950 ${
        isScrolled 
          ? 'max-w-7xl bg-white/80 backdrop-blur-xl border border-white/50 shadow-lg shadow-emerald-900/5 rounded-2xl' 
          : 'bg-white/60 backdrop-blur-md border-b border-white/30 shadow-none'
      }`}>
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-2">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <Link to="/" className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-emerald-600" />
              <span className="font-bold text-2xl tracking-tight text-emerald-900">TokoTani</span>
            </Link>
          
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button 
                onClick={() => navigate('/cart')}
                className="relative p-2 hover:bg-emerald-50 text-emerald-900 rounded-full transition-colors flex items-center"
              >
                <ShoppingCart className="h-6 w-6" />
                {itemCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-emerald-600 rounded-full shadow-sm ring-2 ring-white">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
