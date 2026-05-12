import React, { useState, useEffect } from 'react';
import { Save, Check } from 'lucide-react';

export default function AdminMidtrans() {
  const [formData, setFormData] = useState({
    merchant_id: '',
    client_key: '',
    server_key: '',
    is_production: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/midtrans', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFormData({
          merchant_id: data.merchant_id || '',
          client_key: data.client_key || '',
          server_key: data.server_key || '',
          is_production: data.is_production === 1
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/midtrans', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>;
  }

  return (
    <div className="animate-in fade-in duration-300 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Midtrans</h1>
        <p className="text-gray-500 text-sm mt-1">Atur konfigurasi Payment Gateway Midtrans Anda di sini.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Environment</label>
            <div className="flex items-center space-x-4 mt-2">
              <label className="inline-flex items-center">
                <input 
                  type="radio" 
                  className="form-radio text-emerald-600 focus:ring-emerald-500" 
                  checked={!formData.is_production}
                  onChange={() => setFormData({...formData, is_production: false})}
                />
                <span className="ml-2 text-sm text-gray-700">Sandbox (Testing)</span>
              </label>
              <label className="inline-flex items-center">
                <input 
                  type="radio" 
                  className="form-radio text-emerald-600 focus:ring-emerald-500" 
                  checked={formData.is_production}
                  onChange={() => setFormData({...formData, is_production: true})}
                />
                <span className="ml-2 text-sm text-gray-700">Production (Live)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Merchant ID</label>
            <input 
              type="text" 
              value={formData.merchant_id}
              onChange={(e) => setFormData({...formData, merchant_id: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="G... atau M..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Key</label>
            <input 
              type="text" 
              value={formData.client_key}
              onChange={(e) => setFormData({...formData, client_key: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="SB-Mid-client-..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Server Key</label>
            <input 
              type="text" 
              value={formData.server_key}
              onChange={(e) => setFormData({...formData, server_key: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="SB-Mid-server-..."
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm">
              {saveSuccess && (
                <span className="text-emerald-600 flex items-center">
                  <Check className="w-4 h-4 mr-1" /> Berhasil disimpan
                </span>
              )}
            </div>
            <button 
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors flex items-center disabled:opacity-50"
            >
              {isSaving ? 'Menyimpan...' : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Simpan Pengaturan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
