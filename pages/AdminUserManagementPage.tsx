import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { User, UserRole } from '../types';
import Spinner from '../components/Spinner';

const AdminUserManagementPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user?.role === UserRole.ADMIN) {
      api.getUsers().then(fetchedUsers => {
        setUsers(fetchedUsers);
        setLoading(false);
      });
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated || user?.role !== UserRole.ADMIN) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl border dark:border-gray-700">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b border-gray-300 dark:border-gray-700 pb-4">User Management</h1>
      
      {loading ? <Spinner /> : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-transparent">
            <thead className="bg-gray-200 dark:bg-gray-700">
              <tr>
                <th className="text-left py-2 px-4">ID</th>
                <th className="text-left py-2 px-4">Username</th>
                <th className="text-left py-2 px-4">Email</th>
                <th className="text-left py-2 px-4">Role</th>
                <th className="text-left py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-2 px-4">{u.id}</td>
                  <td className="py-2 px-4 font-medium">{u.username}</td>
                  <td className="py-2 px-4">{u.email}</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${u.role === UserRole.ADMIN ? 'bg-brand-red text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2 px-4 space-x-2">
                    <button className="text-brand-blue hover:underline">Edit</button>
                    <button className="text-brand-red hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagementPage;