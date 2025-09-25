import React, { useState, useEffect, useCallback } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Order, OrderStatus } from '../types';
import Spinner from '../components/Spinner';
import RatingModal from '../components/RatingModal';

const OrderHistoryPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    if (user) {
      setLoading(true);
      const userOrders = await api.getOrdersByUserId(user.id);
      setOrders(userOrders);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, fetchOrders]);

  const handleOpenReviewModal = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };
  
  const handleReviewSubmitted = () => {
    fetchOrders(); // Re-fetch orders to update the review button status
  };

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl border dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b border-gray-300 dark:border-gray-700 pb-4">Order History</h1>

        {loading ? <Spinner /> : (
          <div className="space-y-6">
            {orders.length > 0 ? orders.map(order => {
              const isBuyer = order.buyerId === user.id;
              const canLeaveReview = isBuyer ? !order.reviewLeftByBuyer : !order.reviewLeftBySeller;

              return (
              <div key={order.id} className="p-4 border dark:border-gray-700 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
                <div>
                  <Link to={`/product/${order.productId}`} className="font-semibold text-lg text-brand-blue hover:underline">{order.productTitle}</Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Order ID: {order.id} | {new Date(order.purchaseDate).toLocaleDateString()}
                  </p>
                  <p className="text-md font-bold mt-1">${order.finalPrice.toFixed(2)}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${isBuyer ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                      {isBuyer ? 'Purchase' : 'Sale'}
                    </span>
                    {order.status === OrderStatus.DISPUTED && (
                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            Disputed
                        </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {order.status !== OrderStatus.DISPUTED &&
                    <Link to="/disputes" state={{ orderId: order.id }} className="text-sm font-semibold text-brand-red hover:underline">File a Dispute</Link>
                  }
                  {canLeaveReview ? (
                    <button onClick={() => handleOpenReviewModal(order)} className="px-4 py-2 bg-brand-green text-white font-semibold rounded-md hover:bg-green-700 text-sm">
                        Leave Review
                    </button>
                  ) : (
                    <span className="text-sm text-gray-500">Review Submitted</span>
                  )}
                </div>
              </div>
            )}) : (
              <p className="text-center py-10 text-gray-500 dark:text-gray-400">You have no order history yet.</p>
            )}
          </div>
        )}
      </div>

      {isModalOpen && selectedOrder && (
        <RatingModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          order={selectedOrder}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </>
  );
};

export default OrderHistoryPage;