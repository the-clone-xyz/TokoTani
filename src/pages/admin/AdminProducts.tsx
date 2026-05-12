import React, { useState, useCallback } from 'react';
import { useProducts } from '../../context/ProductContext';
import { Plus, Edit2, Trash2, X, Check, Search, Settings, Crop, Loader2 } from 'lucide-react';
import { Product } from '../../types';
import { formatIDR } from '../HomePage';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../utils/cropImage';
import Swal from 'sweetalert2';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table';

export default function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct, isLoading: productsLoading } = useProducts();
  
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    description: '',
    price: 0,
    image: '',
    category: '',
    stock: 0
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Cropper State
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  if (productsLoading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>;
  }

  const handleOpenModal = (product?: Product) => {
    setFieldErrors({});
    setImageFile(null);
    setImageSrc(null);
    if (product) {
      setEditingId(product.id);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        category: product.category,
        stock: product.stock
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        image: '',
        category: '',
        stock: 0
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setImageFile(null);
    setImageSrc(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFieldErrors(prev => ({...prev, image: ''}));
      
      if (!file.type.startsWith('image/')) {
        setFieldErrors(prev => ({...prev, image: 'File yang diunggah harus berupa gambar.'}));
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setFieldErrors(prev => ({...prev, image: 'Ukuran gambar maksimal 2MB.'}));
        return;
      }
      
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageSrc(reader.result?.toString() || null));
      reader.readAsDataURL(file);
    }
  };

  const saveCrop = async () => {
    try {
      if (imageSrc && croppedAreaPixels) {
        const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
        setImageFile(croppedImage);
        setImageSrc(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    let hasError = false;
    const errors: Record<string, string> = {};

    if (!formData.name.trim() || formData.name.length < 3) {
      errors.name = 'Nama produk minimal 3 karakter.';
      hasError = true;
    }
    if (!formData.description.trim() || formData.description.length < 10) {
      errors.description = 'Deskripsi produk minimal 10 karakter.';
      hasError = true;
    }
    if (formData.price <= 0) {
      errors.price = 'Harga harus lebih dari 0.';
      hasError = true;
    }
    if (formData.stock < 0) {
      errors.stock = 'Stok tidak boleh negatif.';
      hasError = true;
    }
    if (!formData.category) {
      errors.category = 'Kategori harus dipilih.';
      hasError = true;
    }
    
    if (!editingId && !imageFile && !imageSrc) {
      errors.image = 'Gambar produk harus diunggah.';
      hasError = true;
    }

    if (imageSrc) {
      errors.image = 'Pilih potong terlebih dahulu untuk menyimpan gambar.';
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('description', formData.description);
      payload.append('price', formData.price.toString());
      payload.append('stock', formData.stock.toString());
      payload.append('category', formData.category);
      if (imageFile) {
        payload.append('image', imageFile);
      }

      if (editingId) {
        await updateProduct(editingId, payload);
      } else {
        await addProduct(payload);
      }
      handleCloseModal();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const columnHelper = createColumnHelper<Product>();

  const columns = [
    columnHelper.accessor('image', {
      header: 'Gambar',
      cell: info => <img src={info.getValue()} alt="Product" className="w-12 h-12 object-cover rounded-lg bg-gray-100" />,
    }),
    columnHelper.accessor('name', {
      header: 'Nama Produk',
      cell: info => <div className="font-semibold text-gray-900">{info.getValue()}</div>,
    }),
    columnHelper.accessor('category', {
      header: 'Kategori',
      cell: info => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('price', {
      header: 'Harga',
      cell: info => <span className="text-gray-700 font-medium">{formatIDR(info.getValue())}</span>,
    }),
    columnHelper.accessor('stock', {
      header: 'Stok',
      cell: info => (
        <div className={`font-medium ${info.getValue() > 10 ? 'text-gray-700' : 'text-red-600'}`}>
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: () => <div className="text-right">Aksi</div>,
      cell: props => {
        const product = props.row.original;
        return (
          <div className="flex items-center justify-end space-x-2">
            <button 
              onClick={() => handleOpenModal(product)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit Produk"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                Swal.fire({
                  title: 'Apakah Anda yakin?',
                  text: 'Anda tidak akan bisa mengembalikan produk ini!',
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonColor: '#059669', // emerald-600
                  cancelButtonColor: '#d33',
                  confirmButtonText: 'Ya, hapus!',
                  cancelButtonText: 'Batal'
                }).then((result) => {
                  if (result.isConfirmed) {
                    deleteProduct(product.id);
                    Swal.fire(
                      'Terhapus!',
                      'Produk telah dihapus.',
                      'success'
                    );
                  }
                });
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Hapus Produk"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: filteredProducts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Settings className="w-6 h-6 mr-2 text-emerald-600" />
            Kelola Produk
          </h1>
          <p className="text-gray-500 text-sm mt-1">Kelola data produk, harga, dan stok.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => handleOpenModal()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium flex items-center transition-colors shadow-sm flex-grow sm:flex-none justify-center"
          >
            <Plus className="w-5 h-5 mr-1" />
            Tambah Produk
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex items-center">
        <Search className="w-5 h-5 text-gray-400 mr-3" />
        <input 
          type="text" 
          placeholder="Cari nama produk..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full focus:outline-none text-gray-700"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="bg-gray-50 border-b border-gray-100 text-gray-500 text-sm">
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className={`px-6 py-4 font-medium ${header.id === 'actions' ? 'text-right' : ''}`}>
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
                    Tidak ada produk ditemukan.
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h2>
              <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-6">
              <form id="productForm" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
                    <input 
                      type="text" required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all ${fieldErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {fieldErrors.name && <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>}
                  </div>
                  
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                    <textarea 
                      required rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all ${fieldErrors.description ? 'border-red-500' : 'border-gray-300'}`}
                    ></textarea>
                    {fieldErrors.description && <p className="text-red-500 text-xs mt-1">{fieldErrors.description}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                    <input 
                      type="number" required min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all ${fieldErrors.price ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {fieldErrors.price && <p className="text-red-500 text-xs mt-1">{fieldErrors.price}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
                    <input 
                      type="number" required min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all ${fieldErrors.stock ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {fieldErrors.stock && <p className="text-red-500 text-xs mt-1">{fieldErrors.stock}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                    <select 
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all ${fieldErrors.category ? 'border-red-500' : 'border-gray-300'}`}
                    >
                      <option value="">Pilih Kategori...</option>
                      <option value="Benih">Benih</option>
                      <option value="Pupuk">Pupuk</option>
                      <option value="Obat">Obat</option>
                      <option value="Alat">Alat</option>
                      <option value="Mesin">Mesin</option>
                      <option value="Bibit">Bibit</option>
                    </select>
                    {fieldErrors.category && <p className="text-red-500 text-xs mt-1">{fieldErrors.category}</p>}
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Produk</label>
                    <div className="flex items-center space-x-3">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 outline-none transition-all border border-gray-300 rounded-xl mt-1"
                      />
                    </div>
                    {fieldErrors.image && <p className="text-red-500 text-xs mt-1">{fieldErrors.image}</p>}
                    {editingId && !imageFile && !imageSrc && (
                      <p className="text-xs text-gray-500 mt-2">Biarkan kosong jika tidak ingin mengubah gambar.</p>
                    )}
                    {imageFile && !imageSrc && (
                       <div className="mt-2">
                         <p className="text-xs text-emerald-600 mb-2 whitespace-normal overflow-auto w-full break-words">Gambar <strong>{imageFile.name}</strong> terpilih.</p>
                         <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-32 h-32 object-cover rounded-xl border border-gray-200" />
                       </div>
                    )}
                  </div>
                  
                  {/* Cropper Section */}
                  {imageSrc && (
                    <div className="col-span-1 md:col-span-2 mt-4">
                      <div className="relative w-full h-64 bg-gray-100 rounded-xl overflow-hidden mb-4">
                        <Cropper
                          image={imageSrc}
                          crop={crop}
                          zoom={zoom}
                          aspect={1}
                          onCropChange={setCrop}
                          onCropComplete={onCropComplete}
                          onZoomChange={setZoom}
                        />
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setImageSrc(null)}
                          className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                          Batal Potong
                        </button>
                        <button
                          type="button"
                          onClick={saveCrop}
                          className="px-4 py-2 text-sm text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 flex items-center"
                        >
                          <Crop className="w-4 h-4 mr-2" />
                          Simpan Potongan
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex-shrink-0 flex justify-end space-x-3">
              <button 
                type="button" 
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button 
                type="submit"
                form="productForm"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Check className="w-5 h-5 mr-1" />
                )}
                {isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
