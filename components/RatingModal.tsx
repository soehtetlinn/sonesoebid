import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Order, Review } from '../types';
import { api } from '../services/api';
import StarRating from './StarRating';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onReviewSubmitted: (review: Review) => void;
}

const RatingModal: React.FC<RatingModalProps> = ({ isOpen, onClose, order, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating.');
      return;
    }
    if (!user) {
        setError('You must be logged in to leave a review.');
        return;
    }

    setError('');
    setIsLoading(true);

    const revieweeId = user.id === order.buyerId ? order.sellerId : order.buyerId;

    try {
      const newReview = await api.addReview(order.id, user, revieweeId, rating, comment);
      if (newReview) {
        onReviewSubmitted(newReview);
        onClose();
      } else {
        setError('Failed to submit review. You may have already reviewed this transaction.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">Leave a Review</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">For your transaction: <span className="font-semibold">{order.productTitle}</span></p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Overall Rating</label>
            <StarRating rating={rating} onRatingChange={setRating} interactive />
          </div>

          <div className="mb-6">
            <label htmlFor="comment" className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">Add a written review (optional)</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="What did you like or dislike?"
            />
          </div>

          {error && <p className="text-brand-red text-sm mb-4">{error}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-brand-blue text-white font-bold rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
            >
              {isLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;