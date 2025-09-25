import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      // FIX: api.getProducts expects a filters object. Pass empty object for no filters.
      const allProducts = await api.getProducts({});
      // Feature first 4 products
      setProducts(allProducts.slice(0, 4));
      setLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <div>
      <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 mb-12 text-center border dark:border-gray-700">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-gray-100 mb-4">Find it, bid on it, love it.</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
          Welcome to SoneSoe Bid, your premier online marketplace for auctions and direct sales. Discover unique items from sellers around the world.
        </p>
        <Link 
            to="/products"
            className="bg-brand-blue text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-blue-700 transition-colors"
        >
          Start Shopping
        </Link>
      </section>

      <section>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">Featured Items</h2>
        {loading ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;