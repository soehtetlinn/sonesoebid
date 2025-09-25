import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Product, Condition, ListingType } from '../types';
import Spinner from '../components/Spinner';

const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState<Partial<Product>>({
    title: '',
    description: '',
    category: '',
    startingPrice: 0,
    buyNowPrice: undefined,
    endDate: '',
    imageUrl: '',
    condition: Condition.USED,
    listingType: ListingType.AUCTION,
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = Boolean(id);

  useEffect(() => {
    if (isEditMode && id) {
      setLoading(true);
      api.getProductById(id).then(fetchedProduct => {
        if (fetchedProduct) {
          if (user?.role === 'ADMIN' || fetchedProduct.userId === user?.id) {
            setProduct(fetchedProduct);
          } else {
            navigate('/dashboard');
          }
        }
        setLoading(false);
      });
    }
  }, [id, isEditMode, user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      if (isEditMode && id) {
        await api.updateProduct(id, product);
      } else {
        await api.addProduct(product as Omit<Product, 'id' | 'currentPrice' | 'bids' | 'seller'>, user);
      }
      navigate(user.role === 'ADMIN' ? '/admin/products' : '/dashboard/products');
    } catch (error) {
      console.error('Failed to save product', error);
      alert('Failed to save product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl border dark:border-gray-700 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b border-gray-300 dark:border-gray-700 pb-4">
        {isEditMode ? 'Edit Product' : 'Add New Product'}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
          <input type="text" name="title" id="title" value={product.title} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue dark:bg-gray-700" />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea name="description" id="description" value={product.description} onChange={handleChange} required rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue dark:bg-gray-700" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                <input type="text" name="category" id="category" value={product.category} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue dark:bg-gray-700" />
            </div>
            <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                <input type="text" name="location" id="location" value={product.location} onChange={handleChange} required placeholder="e.g. New York, NY" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue dark:bg-gray-700" />
            </div>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Condition</label>
                <select name="condition" id="condition" value={product.condition} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue dark:bg-gray-700">
                    <option value={Condition.NEW}>New</option>
                    <option value={Condition.USED}>Used</option>
                </select>
            </div>
             <div>
                <label htmlFor="listingType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Listing Type</label>
                <select name="listingType" id="listingType" value={product.listingType} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue dark:bg-gray-700">
                    <option value={ListingType.AUCTION}>Auction</option>
                    <option value={ListingType.FIXED_PRICE}>Fixed Price</option>
                </select>
            </div>
        </div>
        <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</label>
            <input type="url" name="imageUrl" id="imageUrl" value={product.imageUrl} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue dark:bg-gray-700" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="startingPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{product.listingType === ListingType.AUCTION ? 'Starting Price' : 'Price'} ($)</label>
                <input type="number" name="startingPrice" id="startingPrice" value={product.startingPrice} onChange={handleChange} required min="0" step="0.01" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue dark:bg-gray-700" />
            </div>
            {product.listingType === ListingType.AUCTION && (
            <div>
                <label htmlFor="buyNowPrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Buy It Now Price ($) (Optional)</label>
                <input type="number" name="buyNowPrice" id="buyNowPrice" value={product.buyNowPrice || ''} onChange={handleChange} min="0" step="0.01" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue dark:bg-gray-700" />
            </div>
            )}
        </div>
        {product.listingType === ListingType.AUCTION && (
        <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Auction End Date</label>
            <input type="datetime-local" name="endDate" id="endDate" value={product.endDate?.substring(0, 16)} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue dark:bg-gray-700" />
        </div>
        )}
        <div className="flex justify-end space-x-4">
            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500">
                Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-blue hover:bg-blue-700 disabled:bg-blue-300">
                {isSubmitting ? 'Saving...' : 'Save Product'}
            </button>
        </div>
      </form>
    </div>
  );
};

export default ProductFormPage;