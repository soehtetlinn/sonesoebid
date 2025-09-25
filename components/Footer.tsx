import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 dark:bg-gray-900 text-white mt-auto border-t border-gray-700 dark:border-gray-600">
      <div className="container mx-auto px-4 py-6 text-center">
        <p className="text-gray-400">&copy; {new Date().getFullYear()} SoneSoe Bid. All rights reserved.</p>
        <div className="flex justify-center space-x-4 mt-2">
            <a href="#" className="hover:underline text-gray-300">About</a>
            <a href="#" className="hover:underline text-gray-300">Contact</a>
            <Link to="/disputes" className="hover:underline text-gray-300">Dispute Center</Link>
            <a href="#" className="hover:underline text-gray-300">Privacy Policy</a>
            <a href="#" className="hover:underline text-gray-300">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;