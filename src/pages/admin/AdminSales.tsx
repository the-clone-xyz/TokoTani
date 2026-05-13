import React, { useState, useEffect } from 'react';
import { ShoppingBag, Download } from 'lucide-react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { formatIDR } from '../HomePage';
import Swal from 'sweetalert2';

export default function AdminSales() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    if (orders.length === 0) {
      Swal.fire('Info', 'Tidak ada data untuk diekspor', 'info');
      return;
    }

    const headers = ['ID Pesanan', 'Nama Pelanggan', 'Email', 'Telepon', 'Alamat', 'Total Pembayaran', 'Status Pembayaran', 'Status Pesanan', 'Tanggal'];
    const csvContent = [
      headers.join(','),
      ...orders.map(order => [
        order.id,
        `"${order.customer_name}"`,
        `"${order.customer_email}"`,
        `"${order.customer_phone}"`,
        `"${order.address}"`,
        order.total_amount,
        order.payment_status || 'pending',
        order.status,
        `"${new Date(order.created_at).toLocaleString('id-ID')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `data_penjualan_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchOrders(); // Refresh table
      Swal.fire({ title: 'Berhasil', text: 'Status pesanan berhasil diperbarui', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
    } catch (e) {
      console.error(e);
      Swal.fire('Error', 'Gagal memperbarui status', 'error');
    }
  };

  const columnHelper = createColumnHelper<any>();

  const columns = [
    columnHelper.accessor('id', {
      header: 'ID Pesanan',
      cell: info => <span className="font-mono text-xs text-gray-500">{info.getValue()}</span>,
    }),
    columnHelper.accessor('customer_name', {
      header: 'Nama Pelanggan',
      cell: info => <span className="font-medium text-gray-900">{info.getValue()}</span>,
    }),
    columnHelper.accessor('total_amount', {
      header: 'Total Pembayaran',
      cell: info => <span className="font-semibold text-emerald-600">{formatIDR(info.getValue())}</span>,
    }),
    columnHelper.accessor('payment_status', {
      header: 'Sts Pembayaran',
      cell: info => {
        const paymentStatus = info.getValue() as string;
        let styles = 'bg-gray-100 text-gray-800';
        if (paymentStatus === 'success') styles = 'bg-emerald-100 text-emerald-800';
        if (paymentStatus === 'pending') styles = 'bg-yellow-100 text-yellow-800';
        if (paymentStatus === 'failed') styles = 'bg-red-100 text-red-800';
        
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${styles}`}>
            {paymentStatus || 'pending'}
          </span>
        );
      },
    }),
    columnHelper.accessor('status', {
      header: 'Sts Pesanan',
      cell: info => {
        const status = info.getValue() as string;
        const row = info.row.original;
        
        // Define styles for each status
        let styles = 'bg-gray-100 text-gray-800';
        if (status === 'success' || status === 'diterima') styles = 'bg-emerald-100 text-emerald-800';
        if (status === 'diproses') styles = 'bg-blue-100 text-blue-800';
        if (status === 'diantar') styles = 'bg-indigo-100 text-indigo-800';
        if (status === 'selesai') styles = 'bg-purple-100 text-purple-800';
        if (status === 'pending') styles = 'bg-yellow-100 text-yellow-800';
        if (status === 'failed') styles = 'bg-red-100 text-red-800';
        
        return (
          <select 
            value={status}
            onChange={(e) => handleStatusChange(row.id, e.target.value)}
            className={`text-xs font-medium uppercase rounded-full px-2.5 py-1 border-none focus:ring-2 focus:ring-emerald-500 cursor-pointer outline-none ${styles}`}
          >
            <option value="pending" className="bg-white text-gray-900">PENDING</option>
            <option value="diterima" className="bg-white text-gray-900">DITERIMA</option>
            <option value="diproses" className="bg-white text-gray-900">DIPROSES</option>
            <option value="diantar" className="bg-white text-gray-900">DIANTAR</option>
            <option value="selesai" className="bg-white text-gray-900">SELESAI</option>
            <option value="failed" className="bg-white text-gray-900">FAILED</option>
          </select>
        );
      },
    }),
    columnHelper.accessor('created_at', {
      header: 'Tanggal',
      cell: info => <span className="text-sm text-gray-500">{new Date(info.getValue()).toLocaleString('id-ID')}</span>,
    }),
  ];

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <ShoppingBag className="w-6 h-6 mr-2 text-emerald-600" />
            Data Penjualan
          </h1>
          <p className="text-gray-500 text-sm mt-1">Laporan data pesanan dan penjualan produk.</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium text-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-6 py-4 font-medium">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                    Tidak ada data penjualan ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            Halaman {table.getState().pagination.pageIndex + 1} dari{' '}
            {table.getPageCount() || 1}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sebelumnya
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
