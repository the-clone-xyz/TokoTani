import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatIDR } from './HomePage';
import { MessageCircle, MapPin, User, ChevronLeft } from 'lucide-react';

export default function CheckoutPage() {
  const { cart, cartTotal } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleWhatsAppCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format cart items
    const itemsList = cart.map(item => 
      `- ${item.name} (${item.quantity}x) = ${formatIDR(item.price * item.quantity)}`
    ).join('\n');

    const message = `*Halo TokoTani*, saya ingin memesan produk berikut:

*Daftar Pesanan:*
${itemsList}

*Total Belanja:* ${formatIDR(cartTotal)}

*Data Pengiriman:*
Nama: ${formData.name}
No HP: ${formData.phone}
Alamat: ${formData.address}
${formData.notes ? `Catatan: ${formData.notes}` : ''}

Mohon info untuk pembayaran dan pengiriman. Terima kasih.`;

    const encodedMessage = encodeURIComponent(message);
    const waNumber = '6281234567890'; // Number without '+'
    
    window.open(`https://wa.me/${waNumber}?text=${encodedMessage}`, '_blank');
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
            
            <form onSubmit={handleWhatsAppCheckout} className="space-y-4" id="checkout-form">
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
              <p className="text-xs text-gray-500 mt-2">*Belum termasuk ongkos kirim. Ongkir akan diinfokan via WhatsApp.</p>
            </div>

            <button 
              type="submit"
              form="checkout-form"
              className="w-full bg-[#25D366] hover:bg-[#1DA851] text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-colors shadow-sm"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Pesan via WhatsApp</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
