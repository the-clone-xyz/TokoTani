import { Product } from '../types';

export const products: Product[] = [
  {
    id: 'p1',
    name: 'Benih Padi Inpari 32',
    description: 'Benih padi unggul Inpari 32 tahan hama dan penyakit, hasil panen tinggi. Cocok untuk sawah irigasi.',
    price: 85000,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800',
    category: 'Benih',
    stock: 50
  },
  {
    id: 'p2',
    name: 'Pupuk NPK Mutiara 16-16-16',
    description: 'Pupuk majemuk lengkap yang mengandung Nitrogren, Fosfat, dan Kalium seimbang untuk pertumbuhan tanaman.',
    price: 18000,
    image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&q=80&w=800',
    category: 'Pupuk',
    stock: 100
  },
  {
    id: 'p3',
    name: 'Cangkul Baja Asli',
    description: 'Cangkul baja kuat dan tajam, tahan lama tidak mudah tumpul. Gagang kayu jati asli.',
    price: 125000,
    image: 'https://images.unsplash.com/photo-1416879590620-80ea7b3c2e64?auto=format&fit=crop&q=80&w=800',
    category: 'Alat',
    stock: 25
  },
  {
    id: 'p4',
    name: 'Pestisida Nabati Neem Oil',
    description: 'Pembasmi hama organik ramah lingkungan, aman untuk tanaman konsumsi.',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1610476485896-1c7ef35d2543?auto=format&fit=crop&q=80&w=800',
    category: 'Obat',
    stock: 30
  },
  {
    id: 'p5',
    name: 'Traktor Mini Rotary',
    description: 'Traktor mini untuk membajak lahan sawah ukuran kecil hingga menengah. Hemat bahan bakar.',
    price: 5500000,
    image: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c5633?auto=format&fit=crop&q=80&w=800',
    category: 'Mesin',
    stock: 2
  },
  {
    id: 'p6',
    name: 'Bibit Pohon Mangga Harum Manis',
    description: 'Bibit unggul mangga harum manis siap tanam, tinggi sekitar 60cm.',
    price: 35000,
    image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&q=80&w=800',
    category: 'Bibit',
    stock: 40
  }
];
