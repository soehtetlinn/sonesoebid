import React from 'react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange, interactive = false }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className={`flex items-center space-x-1 ${interactive ? 'cursor-pointer' : ''}`}>
      {stars.map((star) => (
        <svg
          key={star}
          onClick={() => interactive && onRatingChange && onRatingChange(star)}
          onMouseEnter={() => interactive && onRatingChange && onRatingChange(star)}
          // onMouseLeave={() => interactive && onRatingChange && onRatingChange(rating)} // This can be added for more complex hover effects
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-6 h-6 transition-colors ${star <= rating ? 'text-brand-yellow fill-current' : 'text-gray-400 dark:text-gray-500'}`}
        >
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z"></path>
        </svg>
      ))}
    </div>
  );
};

export default StarRating;