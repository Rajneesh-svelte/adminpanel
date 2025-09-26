'use client';

import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  console.log("user", user )

  return (
    <nav className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-[#2E369A] px-6 py-3 backdrop-blur-sm backdrop-saturate-150">
      
      {/* --- Left Side: Navigation Links --- */}
      <div className="flex items-center gap-5">
        <Link href="/" className="text-white transition-colors hover:text-indigo-600">
          Home
        </Link>
        
        {isAuthenticated && (
          <Link href="/doctor" className="text-white transition-colors hover:text-indigo-600">
           
          </Link>
        )}
      </div>

      {/* --- Right Side: Auth Actions --- */}
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          // --- VIEW WHEN LOGGED IN ---
          <>
            <span className="text-sm text-white">
              Welcome, <span className="font-medium">{user?.role_type || 'User'}!</span>
            </span>
            <button
              onClick={logout}
              className="rounded-md bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Logout
            </button>
          </>
        ) : (
          // --- VIEW WHEN LOGGED OUT ---
          <Link
            href="/login"
            className="rounded-md bg-gray-900 px-4 py-2 font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}