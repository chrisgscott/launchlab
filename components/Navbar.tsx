import React from 'react';
import Link from 'next/link';
import config from '@/config';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-indigo-600">
          {config.appName}
        </Link>
        <div className="space-x-4">
          <Link href="/idea" className="text-gray-800 hover:text-indigo-600">
            Launch Idea
          </Link>
          <Link href="/pricing" className="text-gray-800 hover:text-indigo-600">
            Pricing
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
