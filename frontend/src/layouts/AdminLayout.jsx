import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MobileNavbar from '../components/MobileNavbar';
import ToastContainer from '../components/ToastContainer';

export default function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F4F4F0]">
      <Sidebar />

      <div className="flex-1 overflow-y-auto flex flex-col">
        <MobileNavbar />

        <main className="flex-1 pt-14 md:pt-0">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
