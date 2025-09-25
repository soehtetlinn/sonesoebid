import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    address_city: '',
    address_state: '',
    address_postalCode: '',
    address_country: '',
  });
  const { user: currentUser, login } = useAuth();
  const navigate = useNavigate();
  
  const isOwnProfile = currentUser?.id === parseInt(userId || '0', 10);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (userId) {
        setLoading(true);
        const fetchedUser = await api.getUserProfile(parseInt(userId, 10));
        setUser(fetchedUser);
        if (fetchedUser) {
            setFormData({ 
              username: fetchedUser.username, 
              email: fetchedUser.email,
              firstName: fetchedUser.firstName || '',
              lastName: fetchedUser.lastName || '',
              phone: fetchedUser.phone || '',
              address_line1: fetchedUser.address?.line1 || '',
              address_line2: fetchedUser.address?.line2 || '',
              address_city: fetchedUser.address?.city || '',
              address_state: fetchedUser.address?.state || '',
              address_postalCode: fetchedUser.address?.postalCode || '',
              address_country: fetchedUser.address?.country || '',
            });
        }
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [userId]);
  
  const handleEditToggle = () => {
      if (user) {
          setIsEditing(!isEditing);
      }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      const next = { ...formData, [name]: value } as typeof formData;
      setFormData(next);
      const fieldErrors = validate(next);
      setErrors(fieldErrors);
  };

  const validate = (values: typeof formData): { [key: string]: string } => {
      const es: { [key: string]: string } = {};
      if (!values.username || values.username.trim().length < 2) es.username = 'Username is required';
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!values.email || !emailRe.test(values.email)) es.email = 'Enter a valid email';
      if (values.phone) {
        const phoneRe = /^[+()\-\s\d]{7,20}$/;
        if (!phoneRe.test(values.phone)) es.phone = 'Enter a valid phone';
      }
      if (values.address_postalCode) {
        const pcRe = /^[A-Za-z0-9\-\s]{3,10}$/;
        if (!pcRe.test(values.address_postalCode)) es.address_postalCode = 'Invalid postal code';
      }
      return es;
  };
  
  const handleFormSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      const es = validate(formData);
      setErrors(es);
      if (Object.keys(es).length > 0) return;
      const updatedUser = await api.updateUserProfile(user.id, {
        username: formData.username,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: {
          line1: formData.address_line1,
          line2: formData.address_line2,
          city: formData.address_city,
          state: formData.address_state,
          postalCode: formData.address_postalCode,
          country: formData.address_country,
        },
      });
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
              <div className="mt-2 text-gray-700 dark:text-gray-300">
                {(user.firstName || user.lastName) && (
                  <p className="font-medium">{[user.firstName, user.lastName].filter(Boolean).join(' ')}</p>
                )}
                {user.phone && <p>Phone: {user.phone}</p>}
                {user.address && (
                  <p>
                    {[
                      user.address.line1,
                      user.address.line2,
                      [user.address.city, user.address.state].filter(Boolean).join(', '),
                      user.address.postalCode,
                      user.address.country,
                    ].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
            </div>
        </div>
        <div className="space-x-2">
          {currentUser && !isOwnProfile && (
            <button
              onClick={async () => {
                const convo = await api.sendMessage(null, currentUser.id, `Hi ${user.username}!`, user.id, null);
                navigate(`/dashboard/messages/${convo.id}`);
              }}
              className="px-4 py-2 bg-brand-blue text-white rounded-md font-semibold hover:bg-blue-700"
            >
              Message
            </button>
          )}
          {isOwnProfile && !isEditing && (
            <button onClick={handleEditToggle} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md font-semibold hover:bg-gray-300 dark:hover:bg-gray-500">Edit Profile</button>
          )}
        </div>
      </div>
      
      {isEditing && isOwnProfile ? (
        <form onSubmit={handleFormSubmit} className="space-y-4 mb-8">
            <div>
                <label className="block font-semibold">Username</label>
                <input type="text" name="username" value={formData.username} onChange={handleInputChange} className={`w-full mt-1 px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 ${errors.username ? 'border-brand-red' : ''}`}/>
                {errors.username && <p className="text-brand-red text-sm mt-1">{errors.username}</p>}
            </div>
            <div>
                <label className="block font-semibold">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={`w-full mt-1 px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 ${errors.email ? 'border-brand-red' : ''}`}/>
                {errors.email && <p className="text-brand-red text-sm mt-1">{errors.email}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold">First Name</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700"/>
              </div>
              <div>
                <label className="block font-semibold">Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700"/>
              </div>
            </div>
            <div>
              <label className="block font-semibold">Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={`w-full mt-1 px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 ${errors.phone ? 'border-brand-red' : ''}`}/>
              {errors.phone && <p className="text-brand-red text-sm mt-1">{errors.phone}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold">Address Line 1</label>
                <input type="text" name="address_line1" value={formData.address_line1} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700"/>
              </div>
              <div>
                <label className="block font-semibold">Address Line 2</label>
                <input type="text" name="address_line2" value={formData.address_line2} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700"/>
              </div>
              <div>
                <label className="block font-semibold">City</label>
                <input type="text" name="address_city" value={formData.address_city} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700"/>
              </div>
              <div>
                <label className="block font-semibold">State/Province</label>
                <input type="text" name="address_state" value={formData.address_state} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700"/>
              </div>
              <div>
                <label className="block font-semibold">Postal Code</label>
                <input type="text" name="address_postalCode" value={formData.address_postalCode} onChange={handleInputChange} className={`w-full mt-1 px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 ${errors.address_postalCode ? 'border-brand-red' : ''}`}/>
                {errors.address_postalCode && <p className="text-brand-red text-sm mt-1">{errors.address_postalCode}</p>}
              </div>
              <div>
                <label className="block font-semibold">Country</label>
                <input type="text" name="address_country" value={formData.address_country} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700"/>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
                <button type="button" onClick={handleEditToggle} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md font-semibold">Cancel</button>
                <button type="submit" disabled={Object.keys(errors).length > 0} className="px-4 py-2 bg-brand-blue text-white rounded-md font-semibold disabled:opacity-60">Save Changes</button>
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