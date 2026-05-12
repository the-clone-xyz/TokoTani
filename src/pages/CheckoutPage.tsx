import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatIDR } from './HomePage';
import { MessageCircle, MapPin, User, ChevronLeft, CreditCard } from 'lucide-react';
import Swal from 'sweetalert2';

// Extend window for Snap
declare global {
  interface Window {
    snap: any;
  }
}

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientKeyConfig, setClientKeyConfig] = useState<any>(null);

  useEffect(() => {
    // Fetch Midtrans client key
    const fetchKey = async () => {
      try {
        const res = await fetch('/api/midtrans/client-key');
        const data = await res.json();
        setClientKeyConfig(data);

        if (data && data.client_key) {
          const script = document.createElement("script");
          script.src = data.is_production 
            ? "https://app.midtrans.com/snap/snap.js"
            : "https://app.sandbox.midtrans.com/snap/snap.js";
          script.setAttribute("data-client-key", data.client_key);
          document.head.appendChild(script);
        }
      } catch (err) {
        console.error("Failed to load Midtrans config", err);
      }
    };
    fetchKey();
  }, []);

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientKeyConfig?.client_key) {
      Swal.fire('Error', 'Payment Gateway belum di tentukan. Harap hubungi admin.', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      const payload = {
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_email: 'user@example.com', // mock email
        address: formData.address,
        total_amount: cartTotal,
        items: cart
      };

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create transaction');
      }

      window.snap.pay(data.token, {
        onSuccess: async function(result: any){
          try {
            await fetch('/api/orders/update-status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ order_id: result.order_id, transaction_status: result.transaction_status || 'settlement' })
            });
            // Save to localStorage
            const savedOrdersStr = localStorage.getItem('user_orders');
            let orderIds: string[] = [];
            if (savedOrdersStr) {
               try { orderIds = JSON.parse(savedOrdersStr); } catch (e) {}
            }
            if (!orderIds.includes(result.order_id)) {
              orderIds.push(result.order_id);
              localStorage.setItem('user_orders', JSON.stringify(orderIds));
            }
          } catch(e) {}
          
          Swal.fire('Berhasil!', 'Pembayaran Anda berhasil.', 'success').then(() => {
            clearCart();
            navigate('/my-orders');
          });
        },
        onPending: async function(result: any){
          try {
            await fetch('/api/orders/update-status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ order_id: result.order_id, transaction_status: result.transaction_status || 'pending' })
            });

            const savedOrdersStr = localStorage.getItem('user_orders');
            let orderIds: string[] = [];
            if (savedOrdersStr) {
               try { orderIds = JSON.parse(savedOrdersStr); } catch (e) {}
            }
            if (!orderIds.includes(result.order_id)) {
              orderIds.push(result.order_id);
              localStorage.setItem('user_orders', JSON.stringify(orderIds));
            }
          } catch(e) {}

          Swal.fire('Menunggu Pembayaran', 'Silahkan selesaikan pembayaran Anda.', 'info').then(() => {
            clearCart();
            navigate('/my-orders');
          });
        },
        onError: async function(result: any){
          try {
            await fetch('/api/orders/update-status', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ order_id: result.order_id, transaction_status: result.transaction_status || 'cancel' })
            });
          } catch(e) {}

          Swal.fire('Gagal', 'Pembayaran gagal. Silahkan coba lagi.', 'error');
          setIsProcessing(false);
        },
        onClose: function(){
          setIsProcessing(false);
        }
      });
    } catch (err: any) {
      console.error(err);
      Swal.fire('Error', err.message, 'error');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      <button 
        onClick={() => navigate('/cart')}
        className="flex items-center text-gray-500 hover:text-emerald-600 mb-6 font-medium transition-colors"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Kembali ke Keranjang
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Form Data Diri */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold flex items-center text-gray-900 mb-6">
              <User className="w-5 h-5 mr-2 text-emerald-600" />
              Detail Pengiriman
            </h2>
            
            <form onSubmit={handleCheckout} className="space-y-4" id="checkout-form">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  name="name" 
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="Budi Santoso"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp / HP</label>
                <input 
                  type="tel" 
                  name="phone" 
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="0812xxxxxxxx"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" /> Alamat Lengkap
                </label>
                <textarea 
                  name="address" 
                  required
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="Jl. Pertanian Raya No. 1, Desa Makmur..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
                <textarea 
                  name="notes" 
                  rows={2}
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="Patokan ruman: pagar hijau"
                />
              </div>
            </form>
          </div>
        </div>

        {/* Ringkasan */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Pesanan Anda</h3>
            
            <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-start text-sm">
                  <span className="text-gray-600 line-clamp-2 w-2/3">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatIDR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-100 pt-4 mb-6">
              <div className="flex justify-between items-center mb-1">
                <span className="text-gray-600">Total Harga</span>
                <span className="font-bold text-gray-900">{formatIDR(cartTotal)}</span>
              </div>
            </div>

            <button 
              type="submit"
              form="checkout-form"
              disabled={isProcessing}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-colors shadow-sm disabled:opacity-50"
            >
              <CreditCard className="w-5 h-5" />
              <span>{isProcessing ? 'Memproses...' : 'Bayar Sekarang'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
