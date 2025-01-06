import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from "@/assets/Logo-removebg-preview.png";
import { Icon } from '../ui/Icons';
import { AuthContext } from '@/utils/AppContext';

const Footer = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleProtectedLink = (e, path) => {
    if (!user) {
      e.preventDefault();
      navigate('/login');
    }
  };

  return (
    <footer className="bg-[#121315] text-white py-8 mt-auto animate-in fade-in-0 duration-1000">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-1 animate-in slide-in-from-left duration-700">
            <Link to="/" className="flex items-center mb-4 hover:opacity-80 transition-opacity">
              <img src={Logo} alt="PaidSMS Logo" className="w-[100px]" />
            </Link>
            <p className="text-gray-400 text-sm">
              Your trusted platform for SMS verification services. Get virtual numbers instantly for all your verification needs.
            </p>
          </div>

          {/* Quick Links */}
          <div className="animate-in slide-in-from-bottom duration-700 delay-100">
            <h3 className="text-lg font-semibold mb-4 text-primary">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block">
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  to="/api" 
                  className="text-gray-400 hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block"
                  onClick={(e) => handleProtectedLink(e, '/api')}
                >
                  API Documentation
                </Link>
              </li>
              <li>
                <Link 
                  to="/history" 
                  className="text-gray-400 hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block"
                  onClick={(e) => handleProtectedLink(e, '/history')}
                >
                  Transaction History
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="animate-in slide-in-from-bottom duration-700 delay-200">
            <h3 className="text-lg font-semibold mb-4 text-primary">Support</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="http://t.me/paidsms_support" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary transition-all duration-300 flex items-center gap-2 hover:translate-x-1"
                >
                  <Icon.contact className="w-4 h-4" />
                  Contact Support
                </a>
              </li>
              <li>
                <a 
                  href="https://t.me/paidsms_official" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary transition-all duration-300 flex items-center gap-2 hover:translate-x-1"
                >
                  <Icon.joinChannel className="w-4 h-4" />
                  Join Channel
                </a>
              </li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div className="animate-in slide-in-from-bottom duration-700 delay-300">
            <h3 className="text-lg font-semibold mb-4 text-primary">Payment Methods</h3>
            <div className="flex gap-4">
              <div className="bg-[#1e1e1e] p-3 rounded-lg hover:bg-[#282828] transition-all duration-300 hover:scale-105">
                <Icon.trx className="w-8 h-8" />
              </div>
              <div className="bg- p-2 rounded-lg transition-all duration-300 hover:scale-105">
                <img src="https://images.gizbot.com/img/2024/08/upi2-1723465193.jpeg" alt="UPI" className="w-15 h-10" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800 animate-in fade-in-0 duration-1000 delay-500">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} PaidSMS. All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link to="/privacy-policy" className="text-gray-400 hover:text-primary text-sm transition-all duration-300 hover:translate-y-[-2px]">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-primary text-sm transition-all duration-300 hover:translate-y-[-2px]">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;