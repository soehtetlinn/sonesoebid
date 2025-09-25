import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Review } from '../types';
import { api } from '../services/api';
import Spinner from '../components/Spinner';
import StarRating from '../components/StarRating';
import { useAuth } from '../contexts/AuthContext';

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '' });
  const { user: currentUser, login } = useAuth();
  
  const isOwnProfile = currentUser?.id === parseInt(userId || '0', 10);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (userId) {
        setLoading(true);
        const fetchedUser = await api.getUserProfile(parseInt(userId, 10));
        setUser(fetchedUser);
        if (fetchedUser) {
            setFormData({ username: fetchedUser.username, email: fetchedUser.email });
        }
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [userId]);
  
  const handleEditToggle = () => {
      if (user) {
          setFormData({ username: user.username, email: user.email });
          setIsEditing(!isEditing);
      }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleFormSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      const updatedUser = await api.updateUserProfile(user.id, formData);
      if (updatedUser) {
          setUser(updatedUser);
          // Re-login to update context if it's the current user
          if (isOwnProfile) {
              await login(updatedUser.email);
          }
          setIsEditing(false);
      }
  };

  const calculateAverageRating = (reviews: Review[]): number => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((acc, review) => acc + review.rating, 0);
    return total / reviews.length;
  };

  if (loading) return <Spinner />;
  if (!user) return <div className="text-center">User not found.</div>;

  const averageRating = calculateAverageRating(user.reviews);

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl border dark:border-gray-700 max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-8 border-b dark:border-gray-700 pb-6">
        <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-4xl font-bold text-gray-800 dark:text-gray-100">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">{user.username}</h1>
              <p className="text-lg text-gray-500 dark:text-gray-400">{user.email}</p>
              <div className="flex items-center mt-2 space-x-2">
                <StarRating rating={averageRating} />
                <span className="text-gray-600 dark:text-gray-300 font-semibold">
                  {averageRating.toFixed(1)} average rating ({user.reviews.length} reviews)
                </span>
              </div>
            </div>
        </div>
        {isOwnProfile && !isEditing && (
            <button onClick={handleEditToggle} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md font-semibold hover:bg-gray-300 dark:hover:bg-gray-500">Edit Profile</button>
        )}
      </div>
      
      {isEditing && isOwnProfile ? (
        <form onSubmit={handleFormSubmit} className="space-y-4 mb-8">
            <div>
                <label className="block font-semibold">Username</label>
                <input type="text" name="username" value={formData.username} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700"/>
            </div>
            <div>
                <label className="block font-semibold">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700"/>
            </div>
            <div className="flex justify-end space-x-2">
                <button type="button" onClick={handleEditToggle} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-brand-blue text-white rounded-md font-semibold">Save Changes</button>
            </div>
        </form>
      ) : (
        <>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Feedback & Reviews</h2>
          <div className="space-y-6">
            {user.reviews.length > 0 ? user.reviews.map(review => (
              <div key={review.id} className="p-4 border-l-4 border-brand-blue bg-gray-50 dark:bg-gray-700/50 rounded-r-lg">
                <div className="flex justify-between items-center mb-2">
                  <StarRating rating={review.rating} />
                  <span className="text-sm text-gray-500 dark:text-gray-400">{new Date(review.timestamp).toLocaleDateString()}</span>
                </div>
                {review.comment && <p className="text-gray-700 dark:text-gray-300 italic">"{review.comment}"</p>}
                <p className="text-right text-sm text-gray-600 dark:text-gray-400 mt-2">
                  - from <Link to={`/user/${review.reviewerId}`} className="font-semibold text-brand-blue hover:underline">{review.reviewerUsername}</Link>
                </p>
              </div>
            )) : (
              <p className="text-gray-500 dark:text-gray-400">This user has not received any reviews yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfilePage;