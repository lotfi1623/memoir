'use client';

import SidebarAdmin from '@/components/SidebarAdmin';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarAdmin />
      <div className="ml-64 p-8">
        {children}
      </div>
    </div>
  );
} 