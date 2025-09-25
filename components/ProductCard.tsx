import React from 'react';
import { Link } from 'react-router-dom';
import { Product, ListingType } from '../types';
import CountdownTimer from './CountdownTimer';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const isAuction = product.listingType === ListingType.AUCTION;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 flex flex-col border border-transparent dark:border-gray-700">
      <Link to={`/product/${product.id}`} className="block relative">
        <img src={product.imageUrl} alt={product.title} className="w-full h-56 object-cover" />
        <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold text-white rounded-full ${isAuction ? 'bg-brand-red' : 'bg-brand-green'}`}>
            {isAuction ? 'Auction' : 'Fixed Price'}
        </span>
      </Link>
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 flex-grow">
           <Link to={`/product/${product.id}`} className="hover:text-brand-blue">{product.title}</Link>
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Seller: {product.seller}</p>
        <div className="mt-auto">
            <p className="text-xl font-bold text-gray-900 dark:text-white mb-2">${product.currentPrice.toFixed(2)}</p>
            {isAuction && (
                <>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{product.bids.length} bids</p>
                    <div className="text-sm font-medium text-brand-red">
                        <CountdownTimer endDate={product.endDate} />
                    </div>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;