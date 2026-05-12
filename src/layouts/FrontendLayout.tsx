import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FloatingCart from '../components/FloatingCart';

export default function FrontendLayout() {
  return (
    <>
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <FloatingCart />
      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} TokoTani. All rights reserved.</p>
      </footer>
    </>
  );
}
