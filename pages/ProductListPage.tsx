import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Product, Condition, ListingType } from '../types';
import { api } from '../services/api';
import ProductCard from '../components/ProductCard';
import Spinner from '../components/Spinner';

const useQuery = () => {
    return new URLSearchParams(useLocation().search);
}

const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const query = useQuery();
  const searchTerm = query.get('q');
  
  const [filters, setFilters] = useState({
    priceMin: '',
    priceMax: '',
    condition: '',
    listingType: '',
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const searchParams = {
        searchTerm: searchTerm || undefined,
        priceMin: filters.priceMin ? parseFloat(filters.priceMin) : undefined,
        priceMax: filters.priceMax ? parseFloat(filters.priceMax) : undefined,
        condition: filters.condition || undefined,
        listingType: filters.listingType || undefined,
      };
      const fetchedProducts = await api.getProducts(searchParams);
      setProducts(fetchedProducts);
      setLoading(false);
    };
    fetchProducts();
  }, [searchTerm, filters]);

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Filters Sidebar */}
      <aside className="w-full md:w-1/4 lg:w-1/5">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700 sticky top-24">
          <h2 className="text-xl font-bold mb-4">Filters</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
              <div className="flex items-center space-x-2 mt-1">
                <input type="number" name="priceMin" value={filters.priceMin} onChange={handleFilterChange} placeholder="Min" className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700" />
                <span>-</span>
                <input type="number" name="priceMax" value={filters.priceMax} onChange={handleFilterChange} placeholder="Max" className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700" />
              </div>
            </div>
            <div>
              <label htmlFor="listingType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Listing Type</label>
              <select name="listingType" id="listingType" value={filters.listingType} onChange={handleFilterChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md dark:bg-gray-700">
                <option value="">All</option>
                <option value={ListingType.AUCTION}>Auction</option>
                <option value={ListingType.FIXED_PRICE}>Fixed Price</option>
              </select>
            </div>
            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Condition</label>
              <select name="condition" id="condition" value={filters.condition} onChange={handleFilterChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm rounded-md dark:bg-gray-700">
                <option value="">All</option>
                <option value={Condition.NEW}>New</option>
                <option value={Condition.USED}>Used</option>
              </select>
            </div>
          </div>
        </div>
      </aside>

      {/* Product Grid */}
      <main className="w-full md:w-3/4 lg:w-4/5">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b border-gray-300 dark:border-gray-700 pb-4">
          {searchTerm ? `Search results for "${searchTerm}"` : 'All Products'}
        </h1>
        {loading ? (
          <Spinner />
        ) : (
          <>
            {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg">
                    <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">No products found.</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your search or filters.</p>
                </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ProductListPage;