'use client';

import Link from 'next/link';

export default function MenuLink({ item, pathname }) {
  return (
    <Link 
      href={item.path} 
      className={`dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center px-4 py-2 rounded-lg mb-2 group ${pathname === item.path ? 'bg-gray-100 text-green-600' : 'hover:bg-gray-50'} animate-menu transition-colors`}
    >
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white dark:bg-gray-900 shadow-sm group-hover:bg-green-50 transition-colors">
        {item.icon}
      </div>
      <span className="ml-4 font-medium transition-all group-hover:text-green-600">
        {item.title}
      </span>
    </Link>
  );
}