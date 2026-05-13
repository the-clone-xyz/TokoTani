import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { formatIDR } from './HomePage';
import Swal from 'sweetalert2';

// Extend window for Snap
declare global {
  interface Window {
    snap: any;
  }
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch Midtrans config and load script
    const loadMidtransScript = async () => {
      try {
        const res = await fetch('/api/midtrans/client-key');
        if (res.ok) {
          const data = await res.json();
          if (data && data.client_key) {
            const script = document.createElement("script");
            script.src = data.is_production 
              ? "https://app.midtrans.com/snap/snap.js"
              : "https://app.sandbox.midtrans.com/snap/snap.js";
            script.setAttribute("data-client-key", data.client_key);
            document.head.appendChild(script);
          }
        }
      } catch (e) {
        console.error("Failed to load Midtrans script", e);
      }
    };
    loadMidtransScript();
  }, []);

  const fetchOrdersRaw = async (orderIds: string[]) => {
    try {
      const orderPromises = orderIds.map(id => fetch(`/api/orders/${id}`).then(res => res.json()));
      const fetchedOrders = await Promise.all(orderPromises);
      // filter out errors
      const validOrders = fetchedOrders.filter(o => !o.error);
      // Sort descending by created_at
      validOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setOrders(validOrders);
    } catch (e) {
      console.error("Failed to fetch orders", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Read order IDs from localStorage
    const savedOrdersStr = localStorage.getItem('user_orders');
    let orderIds: string[] = [];
    if (savedOrdersStr) {
      try {
        orderIds = JSON.parse(savedOrdersStr);
      } catch (e) {}
    }

    if (orderIds.length === 0) {
      setIsLoading(false);
      return;
    }

    fetchOrdersRaw(orderIds);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300 max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Package className="mr-3 text-emerald-600 w-8 h-8" />
          Riwayat Pesanan Saya
        </h1>
        <p className="text-gray-500 mt-2">Daftar pesanan yang pernah Anda buat di toko kami.</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center">
          <Package className="w-16 h-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">Belum ada pesanan</h2>
          <p className="text-gray-500 mb-6">Anda belum memiliki riwayat pesanan yang tersimpan di perangkat ini.</p>
          <Link to="/" className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition">
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100">
                <div>
                  <p className="text-sm text-gray-500 mb-1">ID Pesanan</p>
                  <p className="font-mono font-medium text-gray-900">{order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tanggal</p>
                  <p className="font-medium text-gray-900">{new Date(order.created_at).toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total</p>
                  <p className="font-bold text-emerald-600">{formatIDR(order.total_amount)}</p>
                </div>
                <div>
                  {order.payment_status === 'success' && <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800 mb-1"><CheckCircle className="w-3 h-3 mr-1"/> Lunas</span>}
                  <br />
                  {order.status === 'pending' && <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800"><Clock className="w-4 h-4 mr-1"/> Menunggu</span>}
                  {(order.status === 'success' || order.status === 'diterima') && <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800"><CheckCircle className="w-4 h-4 mr-1"/> Diterima</span>}
                  {order.status === 'diproses' && <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"><Package className="w-4 h-4 mr-1"/> Diproses</span>}
                  {order.status === 'diantar' && <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"><Package className="w-4 h-4 mr-1"/> Diantar</span>}
                  {order.status === 'selesai' && <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"><CheckCircle className="w-4 h-4 mr-1"/> Selesai</span>}
                  {order.status === 'failed' && <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"><XCircle className="w-4 h-4 mr-1"/> Gagal</span>}
                </div>
              </div>
              
              <div className="p-6">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">Rincian Produk</h4>
                <div className="space-y-3">
                  {order.items && order.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">{item.product_name}</span>
                        <span className="ml-2 text-gray-500">x{item.quantity}</span>
                      </div>
                      <span className="text-gray-700">{formatIDR(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  {(!order.items || order.items.length === 0) && (
                    <p className="text-sm text-gray-500 italic">Rincian produk tidak tersedia</p>
                  )}
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-100 grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <h5 className="font-bold text-gray-900 mb-1">Data Pengiriman:</h5>
                    <p>{order.customer_name}</p>
                    <p>{order.customer_phone}</p>
                    <p className="mt-1">{order.address}</p>
                  </div>
                  <div className="flex items-end justify-start md:justify-end">
                    {order.payment_status === 'pending' && order.payment_token && (
                      <button
                        onClick={() => {
                          if (window.snap) {
                            window.snap.pay(order.payment_token, {
                              onSuccess: async function(result: any){
                                try {
                                  await fetch('/api/orders/update-status', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ order_id: order.id, transaction_status: result.transaction_status || 'settlement' })
                                  });
                                } catch(e) {}
                                Swal.fire('Berhasil', 'Pembayaran berhasil.', 'success').then(() => {
                                  const savedOrdersStr = localStorage.getItem('user_orders');
                                  if (savedOrdersStr) { fetchOrdersRaw(JSON.parse(savedOrdersStr)); }
                                });
                              },
                              onPending: async function(result: any){
                                try {
                                  await fetch('/api/orders/update-status', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ order_id: order.id, transaction_status: result.transaction_status || 'pending' })
                                  });
                                } catch(e) {}
                                Swal.fire('Pending', 'Pembayaran tertunda.', 'info').then(() => {
                                  const savedOrdersStr = localStorage.getItem('user_orders');
                                  if (savedOrdersStr) { fetchOrdersRaw(JSON.parse(savedOrdersStr)); }
                                });
                              },
                              onError: async function(result: any){
                                try {
                                  await fetch('/api/orders/update-status', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ order_id: order.id, transaction_status: result.transaction_status || 'cancel' })
                                  });
                                } catch(e) {}
                                Swal.fire('Error', 'Pembayaran gagal.', 'error').then(() => {
                                  const savedOrdersStr = localStorage.getItem('user_orders');
                                  if (savedOrdersStr) { fetchOrdersRaw(JSON.parse(savedOrdersStr)); }
                                });
                              },
                              onClose: function(){
                                const savedOrdersStr = localStorage.getItem('user_orders');
                                if (savedOrdersStr) { fetchOrdersRaw(JSON.parse(savedOrdersStr)); }
                              }
                            });
                          } else {
                            Swal.fire('Error', 'Sistem pembayaran sedang disiapkan, silahkan coba lagi nanti.', 'error');
                          }
                        }}
                        className="flex items-center bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Lanjutkan Pembayaran
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
