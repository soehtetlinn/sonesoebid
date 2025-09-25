import React, { useState, useEffect, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Product, UserRole } from '../types';
import Spinner from '../components/Spinner';

const AdminProductManagementPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllProducts = useCallback(async () => {
    setLoading(true);
    // FIX: api.getProducts expects a filters object. Pass empty object for no filters.
    const allProducts = await api.getProducts({});
    setProducts(allProducts);
    setLoading(false);
  }, []);
  
  useEffect(() => {
    if (isAuthenticated && user?.role === UserRole.ADMIN) {
      fetchAllProducts();
    }
  }, [isAuthenticated, user, fetchAllProducts]);

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to PERMANENTLY delete this product? This action cannot be undone.')) {
        const success = await api.deleteProduct(productId);
        if (success) {
            fetchAllProducts();
        } else {
            alert('Failed to delete product.');
        }
    }
  };
  
  if (!isAuthenticated || user?.role !== UserRole.ADMIN) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl border dark:border-gray-700">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b border-gray-300 dark:border-gray-700 pb-4">Product Management (All)</h1>

      {loading ? <Spinner /> : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-transparent">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="text-left py-2 px-4">Product</th>
                <th className="text-left py-2 px-4">Seller</th>
                <th className="text-left py-2 px-4">Current Price</th>
                <th className="text-left py-2 px-4">End Date</th>
                <th className="text-left py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? products.map(product => (
                <tr key={product.id} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-2 px-4 font-medium">{product.title}</td>
                  <td className="py-2 px-4">{product.seller}</td>
                  <td className="py-2 px-4">${product.currentPrice.toFixed(2)}</td>
                  <td className="py-2 px-4 text-gray-600 dark:text-gray-400">{new Date(product.endDate).toLocaleDateString()}</td>
                  <td className="py-2 px-4 space-x-2">
                    <Link to={`/dashboard/product/edit/${product.id}`} className="text-brand-blue hover:underline">Edit</Link>
                    <button onClick={() => handleDelete(product.id)} className="text-brand-red hover:underline">Delete</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminProductManagementPage;