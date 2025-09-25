import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Dispute, DisputeStatus } from '../types';
import Spinner from '../components/Spinner';

const DisputeCenterPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [orderId, setOrderId] = useState(location.state?.orderId || '');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      api.getDisputes(user.id).then(setDisputes).finally(() => setLoading(false));
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !orderId || !reason) {
        setMessage('Please fill in all fields.');
        return;
    }
    setSubmitting(true);
    setMessage('');
    const newDispute = await api.createDispute(orderId, user.id, reason);
    if (newDispute) {
        setMessage('Dispute filed successfully.');
        setDisputes(prev => [newDispute, ...prev]);
        setOrderId('');
        setReason('');
    } else {
        setMessage('Failed to file dispute. Please check the Order ID.');
    }
    setSubmitting(false);
  };
  
  const getStatusColor = (status: DisputeStatus) => {
      switch(status) {
          case DisputeStatus.OPEN: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
          case DisputeStatus.UNDER_REVIEW: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
          case DisputeStatus.RESOLVED: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl border dark:border-gray-700">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6">File a New Dispute</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Order ID</label>
            <input type="text" id="orderId" value={orderId} onChange={(e) => setOrderId(e.target.value)} required className="mt-1 block w-full px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700" />
          </div>
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason for Dispute</label>
            <textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} required rows={4} className="mt-1 block w-full px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700" placeholder="e.g., Item not received, item not as described..."></textarea>
          </div>
          {message && <p className="text-sm">{message}</p>}
          <button type="submit" disabled={submitting} className="px-4 py-2 bg-brand-red text-white font-bold rounded-md hover:bg-red-700 disabled:bg-gray-400">
              {submitting ? 'Submitting...' : 'Submit Dispute'}
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl border dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">My Disputes</h2>
        {loading ? <Spinner /> : (
            <div className="space-y-4">
                {disputes.length > 0 ? disputes.map(dispute => (
                    <div key={dispute.id} className="p-4 border dark:border-gray-600 rounded-lg">
                        <div className="flex justify-between items-center">
                            <p className="font-semibold">{dispute.productTitle}</p>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(dispute.status)}`}>{dispute.status}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Order ID: {dispute.orderId}</p>
                        <p className="mt-2 text-gray-700 dark:text-gray-300">{dispute.reason}</p>
                    </div>
                )) : <p>You have no open disputes.</p>}
            </div>
        )}
      </div>
    </div>
  );
};

export default DisputeCenterPage;