import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-900 font-sans gap-6 px-4 text-center">
    <p className="text-7xl sm:text-9xl font-extrabold text-blue-600 leading-none">404</p>
    <h2 className="text-xl sm:text-2xl font-semibold">Page not found</h2>
    <p className="text-sm text-slate-500 max-w-xs">
      The page you're looking for doesn't exist or has been moved.
    </p>
    <Link
      to="/chat"
      className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-700 transition-colors shadow-md"
    >
      Go to Chat
    </Link>
  </div>
);

export default NotFoundPage;
