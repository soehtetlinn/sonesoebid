import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="text-center py-20">
      <h1 className="text-6xl font-extrabold text-brand-red mb-4">404</h1>
      <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Page Not Found</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
      </p>
      <Link
        to="/"
        className="bg-brand-blue text-white font-bold py-3 px-6 rounded-full text-lg hover:bg-blue-700 transition-colors"
      >
        Go Back to Homepage
      </Link>
    </div>
  );
};

export default NotFoundPage;