import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';

export default function FloatingCart() {
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Muncul setelah di-scroll sekitar 300px ke bawah
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Jangan tampilkan di halaman cart atau checkout
  if (location.pathname === '/cart' || location.pathname === '/checkout') {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && itemCount > 0 && (
        <motion.button
          // Animasi "ease in top": mulai dari posisi lebih tinggi (y: -40) menuju ke posisi normal (y: 0)
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          onClick={() => navigate('/cart')}
          className="fixed bottom-6 right-6 z-[60] bg-white/80 hover:bg-white text-emerald-900 rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center transition-all group border border-white/50 backdrop-blur-xl"
          aria-label="Keranjang Belanja"
        >
          <div className="relative">
            <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-3 -right-3 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-bold leading-none text-white bg-emerald-600 ring-2 ring-white rounded-full shadow-sm">
              {itemCount}
            </span>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
