import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWatchList } from '../contexts/WatchListContext';
import { api } from '../services/api';
import { Product } from '../types';
import Spinner from '../components/Spinner';
import ProductCard from '../components/ProductCard';

const WatchListPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { watchlist } = useWatchList();
  const [watchedProducts, setWatchedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (watchlist.size > 0) {
        setLoading(true);
        // In a real app, you might have a dedicated API endpoint like /api/products?ids=1,2,3
        // FIX: api.getProducts expects a filters object. Pass empty object for no filters.
        const allProducts = await api.getProducts({});
        const filteredProducts = allProducts.filter(p => watchlist.has(p.id));
        setWatchedProducts(filteredProducts);
        setLoading(false);
      } else {
        setWatchedProducts([]);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [watchlist]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl border dark:border-gray-700">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b border-gray-300 dark:border-gray-700 pb-4">My Watchlist</h1>
      
      {loading ? (
        <Spinner />
      ) : (
        <>
          {watchedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {watchedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Your watchlist is empty.</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Add items to your watchlist to keep track of them here.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WatchListPage;