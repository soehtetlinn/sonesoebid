import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { CartItem } from '../types';
import Spinner from '../components/Spinner';

interface CartBySeller {
  sellerId: number;
  sellerName: string;
  items: CartItem[];
  subtotal: number;
}

const CartPage: React.FC = () => {
  const { cart, loading, removeFromCart, checkout } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const navigate = useNavigate();

  const cartBySeller = useMemo(() => {
    const grouped: { [key: number]: CartBySeller } = {};
    cart.forEach(item => {
      const sellerId = item.product.userId;
      if (!grouped[sellerId]) {
        grouped[sellerId] = {
          sellerId,
          sellerName: item.product.seller,
          items: [],
          subtotal: 0,
        };
      }
      grouped[sellerId].items.push(item);
      grouped[sellerId].subtotal += item.product.currentPrice * item.quantity;
    });
    return Object.values(grouped);
  }, [cart]);

  const total = cart.reduce((acc, item) => acc + item.product.currentPrice * item.quantity, 0);

  const handleCheckout = async () => {
      setIsCheckingOut(true);
      const success = await checkout();
      if (success) {
          navigate('/dashboard/orders');
      } else {
          alert("Checkout failed. Please try again.");
      }
      setIsCheckingOut(false);
  }

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl border dark:border-gray-700">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 border-b border-gray-300 dark:border-gray-700 pb-4">
        Shopping Cart
      </h1>
      {cart.length === 0 ? (
        <div className="text-center py-10">
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">Your cart is empty.</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Find something to add!</p>
          <Link to="/products" className="mt-4 inline-block bg-brand-blue text-white font-bold py-2 px-4 rounded hover:bg-blue-700">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-grow">
            {cartBySeller.map(sellerGroup => (
              <div key={sellerGroup.sellerId} className="mb-6 border dark:border-gray-700 rounded-lg">
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-t-lg">
                  <h3 className="font-semibold">Seller: <Link to={`/user/${sellerGroup.sellerId}`} className="text-brand-blue hover:underline">{sellerGroup.sellerName}</Link></h3>
                </div>
                <div className="divide-y dark:divide-gray-700">
                  {sellerGroup.items.map(item => (
                    <div key={item.product.id} className="p-4 flex items-center gap-4">
                      <img src={item.product.imageUrl} alt={item.product.title} className="w-24 h-24 object-cover rounded-md"/>
                      <div className="flex-grow">
                        <Link to={`/product/${item.product.id}`} className="font-semibold hover:text-brand-blue">{item.product.title}</Link>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                        <button onClick={() => removeFromCart(item.product.id)} className="text-sm text-brand-red hover:underline mt-1">Remove</button>
                      </div>
                      <p className="font-bold text-lg">${(item.product.currentPrice * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <aside className="w-full lg:w-1/3">
            <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg shadow-md border dark:border-gray-600 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping</span>
                <span className="text-brand-green">FREE</span>
              </div>
              <div className="border-t dark:border-gray-600 my-4"></div>
              <div className="flex justify-between font-bold text-xl">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <button onClick={handleCheckout} disabled={isCheckingOut} className="mt-6 w-full bg-brand-green text-white font-bold py-3 rounded-md hover:bg-green-700 disabled:bg-gray-400">
                {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default CartPage;