import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product, Bid, ListingType } from '../types';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useWatchList } from '../contexts/WatchListContext';
import { useCart } from '../contexts/CartContext';
import Spinner from '../components/Spinner';
import CountdownTimer from '../components/CountdownTimer';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { isWatched, addToWatchlist, removeFromWatchlist } = useWatchList();
  const { addToCart } = useCart();
  
  const fetchProduct = useCallback(async () => {
    if (id) {
      setLoading(true);
      const fetchedProduct = await api.getProductById(id);
      setProduct(fetchedProduct);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !user) return;
    
    const amount = parseFloat(bidAmount);
    const minBid = product.currentPrice + 1.00;
    if (isNaN(amount) || amount < minBid) {
      setError(`Your maximum bid must be at least $${minBid.toFixed(2)}.`);
      return;
    }
    
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    try {
        const updatedProduct = await api.placeBid(product.id, amount, user);
        if (updatedProduct) {
            setProduct(updatedProduct);
            setBidAmount('');
            setSuccess('Your maximum bid has been placed!');
        } else {
            setError('There was an error placing your bid. The price may have been updated.');
            await fetchProduct();
        }
    } catch(err) {
        setError('An unexpected error occurred.');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleWatchlistToggle = () => {
    if (!product || !isAuthenticated) return;
    if (isWatched(product.id)) {
      removeFromWatchlist(product.id);
    } else {
      addToWatchlist(product.id);
    }
  };
  
  const handleAddToCart = () => {
      if(!product || !isAuthenticated) return;
      addToCart(product, 1);
      setSuccess(`${product.title} has been added to your cart.`);
  };

  const handleBuyNow = async () => {
    if (!product || !user) return;
    setIsSubmitting(true);
    setSuccess('');
    setError('');
    if (product.listingType === ListingType.FIXED_PRICE) {
        addToCart(product, 1);
        navigate('/cart');
    } else {
        try {
          const order = await api.buyNow(product.id, user);
          if (order) {
            navigate('/dashboard/orders');
          } else {
            setError('Could not complete the purchase.');
          }
        } catch(err) {
          setError('An unexpected error occurred during purchase.');
        } finally {
          setIsSubmitting(false);
        }
    }
  };

  const handleContactSeller = async () => {
      if (!product || !user) return;
      // Start a conversation and navigate to messages page
      const conversation = await api.sendMessage(null, user.id, `Hi, I'm interested in "${product.title}".`, product.userId, product.id);
      if (conversation) {
          navigate(`/dashboard/messages/${conversation.id}`);
      }
  }

  if (loading) return <Spinner />;
  if (!product) return <div className="text-center">Product not found.</div>;

  const minBid = product.currentPrice + 1.00;
  const watched = isWatched(product.id);
  const isAuctionActive = new Date(product.endDate) > new Date();
  const isAuction = product.listingType === ListingType.AUCTION;
  const highestBidder = product.bids.length > 0 ? product.bids.sort((a,b) => b.maxBid - a.maxBid)[0] : null;

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl border dark:border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <img src={product.imageUrl} alt={product.title} className="w-full h-auto rounded-lg shadow-md" />
        </div>

        <div>
          <div className="flex justify-between items-start">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">{product.title}</h1>
            {isAuthenticated && (
              <button onClick={handleWatchlistToggle} className={`ml-4 px-3 py-1.5 text-sm font-semibold rounded-md flex items-center space-x-2 whitespace-nowrap ${watched ? 'bg-brand-yellow/20 text-brand-yellow' : 'bg-gray-200 dark:bg-gray-600'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={watched ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z"></path></svg>
                <span>{watched ? 'Watching' : 'Watch Item'}</span>
              </button>
            )}
          </div>
           <p className="text-md text-gray-500 dark:text-gray-400 mb-4">
            Sold by <Link to={`/user/${product.userId}`} className="font-semibold text-brand-blue hover:underline">{product.seller}</Link>
          </p>
           <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 space-x-4">
               <span>Condition: <span className="font-semibold">{product.condition}</span></span>
               <span>Location: <span className="font-semibold">{product.location}</span></span>
           </div>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">{product.description}</p>
          
          <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
            {isAuction && (
            <div className="flex justify-between items-center mb-4">
                <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Current Bid</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">${product.currentPrice.toFixed(2)}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">({product.bids.length} bids)</p>
                </div>
                <div className="text-right text-brand-red font-semibold">
                    <CountdownTimer endDate={product.endDate} />
                </div>
            </div>
            )}
            
            {error && <p className="text-sm text-brand-red mb-2">{error}</p>}
            {success && <p className="text-sm text-brand-green mb-2">{success}</p>}

            {isAuction ? (
              isAuctionActive ? (
                <form onSubmit={handleBidSubmit}>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {highestBidder?.userId === user?.id ? "You are the highest bidder!" : (highestBidder ? `${highestBidder.username} is winning.` : "Be the first to bid!") }
                    </p>
                    <label className="font-semibold text-sm">Place Maximum Bid (Proxy Bidding):</label>
                    <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold">$</span>
                        <input type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} placeholder={`min $${minBid.toFixed(2)}`} step="1.00" min={minBid} className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-500 rounded-md focus:outline-none focus:border-brand-blue dark:bg-gray-800" disabled={!isAuthenticated || isSubmitting}/>
                        <button type="submit" disabled={!isAuthenticated || isSubmitting} className="px-8 py-3 bg-brand-blue text-white font-bold rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                            {isSubmitting ? 'Placing...' : 'Place Bid'}
                        </button>
                    </div>
                </form>
              ) : ( <div className="text-center font-bold text-xl text-gray-700 dark:text-gray-200 p-4 bg-gray-200 dark:bg-gray-600 rounded-md">Auction has ended.</div> )
            ) : ( // Fixed Price
              <div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-4">${product.currentPrice.toFixed(2)}</p>
                  <div className="flex items-center space-x-2">
                     <button onClick={handleAddToCart} disabled={!isAuthenticated || isSubmitting} className="flex-1 py-3 bg-brand-yellow text-black font-bold rounded-md hover:opacity-90 disabled:bg-gray-400">Add to Cart</button>
                     <button onClick={handleBuyNow} disabled={!isAuthenticated || isSubmitting} className="flex-1 py-3 bg-brand-green text-white font-bold rounded-md hover:bg-green-700 disabled:bg-gray-400">Buy It Now</button>
                  </div>
              </div>
            )}
            
            {product.buyNowPrice && isAuction && isAuctionActive && (
                 <>
                    <div className="my-4 flex items-center"><div className="flex-grow border-t dark:border-gray-600"></div><span className="mx-4 text-gray-500">or</span><div className="flex-grow border-t dark:border-gray-600"></div></div>
                    <button onClick={handleBuyNow} disabled={!isAuthenticated || isSubmitting} className="w-full py-3 bg-brand-green text-white font-bold rounded-md hover:bg-green-700 disabled:bg-gray-400">
                        {isSubmitting ? 'Processing...' : `Buy It Now for $${product.buyNowPrice.toFixed(2)}`}
                    </button>
                 </>
            )}
            {!isAuthenticated && <p className="text-sm text-brand-red mt-2">Please sign in to participate.</p>}
          </div>
            { isAuthenticated && user?.id !== product.userId &&
                <button onClick={handleContactSeller} className="w-full mt-4 py-2 text-center text-brand-blue font-semibold hover:underline">
                    Contact Seller
                </button>
            }
        </div>
      </div>
      
      {isAuction && (
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 border-b border-gray-300 dark:border-gray-700 pb-2">Bid History</h2>
        {product.bids.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="min-w-full bg-transparent">
                    <thead className="bg-gray-200 dark:bg-gray-700">
                        <tr>
                            <th className="text-left py-2 px-4">Bidder</th>
                            <th className="text-left py-2 px-4">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {product.bids.slice().sort((a,b) => +new Date(b.timestamp) - +new Date(a.timestamp)).map((bid: Bid) => (
                            <tr key={bid.id} className="border-b border-gray-200 dark:border-gray-700">
                                <td className="py-2 px-4 font-medium">{bid.username}</td>
                                <td className="py-2 px-4 text-gray-600 dark:text-gray-400">{new Date(bid.timestamp).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <p className="text-gray-600 dark:text-gray-400">No bids yet. Be the first!</p>
        )}
      </div>
      )}

    </div>
  );
};

export default ProductDetailPage;