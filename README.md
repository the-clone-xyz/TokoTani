# TokoTani

TokoTani adalah aplikasi e-commerce platform penjualan produk pertanian. Aplikasi ini dibangun dengan stack teknologi modern, memisahkan backend (Node.js/Express) dan frontend (React/Vite) namun dapat dijalankan dalam satu kesatuan. TokoTani menyediakan pengalaman berbelanja yang mudah, mulai dari melihat produk, menambahkan ke keranjang, hingga melakukan checkout menggunakan Payment Gateway Midtrans.

## Fitur Utama

- **Halaman Beranda & Katalog Produk**: Menampilkan daftar produk pertanian lengkap dengan nama, gambar, harga, dan ketersediaan stok.
- **Keranjang Belanja (Shopping Cart)**: Memungkinkan pengguna untuk menambahkan dan mengelola jumlah produk yang ingin dibeli sebelum checkout.
- **Proses Checkout dengan Midtrans**: Mendukung berbagai metode pembayaran secara aman (Transfer Bank, E-Wallet, Card, dll) menggunakan integrasi Snap Midtrans (sandbox/production).
- **Riwayat Pesanan (Order History)**: Melacak status pesanan secara real-time yang tersimpan di memori perangkat/browser pengguna (localStorage & sinkronisasi dengan database backend).
- **Halaman Admin Dashboard**:
  - **Login Admin**: Autentikasi aman untuk masuk ke halaman manajemen.
  - **Dashboard Analytics**: Menampilkan total produk, total penjualan berhasil, dan grafik pendapatan per bulan menggunakan `recharts`.
  - **Manajemen Produk (Data Barang)**: Menambah, mengedit, atau menghapus produk lengkap dengan unggah gambar file (didukung oleh `multer`).
  - **Laporan Penjualan (Pesanan)**: Melihat data seluruh transaksi pelanggan secara detail beserta rincian statusnya (pending/success/failed) dalam format tabel.
  - **Konfigurasi Midtrans**: Konfigurasi `Merchant ID`, `Client Key`, `Server Key`, serta *Environment* (Sandbox/Production) secara dinamis dari dashboard admin tanpa perlu memodifikasi kode.

## Teknologi yang Digunakan

**Frontend:**
- **React.js (v19)** dengan Vite sebagai bundler
- **TypeScript** untuk strict type checking
- **Tailwind CSS** untuk utility-first styling UI
- **React Router Dom** untuk navigasi halaman (Routing)
- **Lucide React** untuk ikon-ikon antarmuka
- **Recharts** untuk visualisasi grafik pendapatan
- **SweetAlert2** untuk notifikasi dan popup dialog

**Backend:**
- **Node.js** dengan framework **Express.js**
- **Better SQLite3** sebagai sistem manajemen antarmuka basis data (Relational Database)
- **Midtrans Client** API NodeJS SDK (`midtrans-client`) untuk webhook & generate token transaksi
- **JSON Web Token (JWT)** untuk autentikasi dan keamanan session Admin
- **Multer** untuk penanganan *multipart/form-data* (upload gambar)

## Instalasi & Cara Menjalankan

Aplikasi ini dijalankan menggunakan Node.js. Karena SQLite digunakan sebagai database, tidak diperlukan setup database eksternal khusus.

Pastikan Node.js dan NPM telah terinstal:

1. Instalasi modul package:
   ```bash
   npm install
   ```

2. Jalankan server di environment *development*:
   ```bash
   npm run dev
   ```

3. Buka browser dan navigasikan ke URL di mana server berjalan (misal: `http://localhost:3000`).

## Akun Default

Saat pertama kali dijalankan, aplikasi akan secara otomastis menjalankan migrasi database SQLite dan membuat sebuah akun admin default jika belum ada. 

## Struktur Sistem Pembayaran (Midtrans)

1. Sebelum dapat melakukan checkout dengan sukses, admin **diwajibkan** untuk melakukan konfigurasi kunci Midtrans (`Merchant ID`, `Client Key`, dan `Server Key`) yang diperoleh dari dashboard Midtrans.
2. Saat user checkout, backend akan menerima data item, harga, dan informasi customer, lalu meminta token dari API Midtrans dan di-return ke frontend.
3. Snap pop-up payment gateway akan muncul bagi user di sisi depan menggunakan token tersimpan.
4. Ketika proses transaksi sukses/batal/pending oleh user dari tampilan UI bank/dompet elektronik, webhook Notifikasi asinkronus (yang dikonfigurasikan di dashboard Midtrans ke URL backend `domain/api/webhook/midtrans`) akan memperbarui status transaksi menjadi berhasil atau gagal secara backend-to-backend.
