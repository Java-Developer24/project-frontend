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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20">
          {/* Quick Links */}
          <div className="animate-in slide-in-from-bottom duration-700 delay-100 px-4 md:pl-40 md:ml-20">
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
            </ul>
          </div>

          {/* Support */}
          <div className="animate-in slide-in-from-bottom duration-700 delay-200 px-4 md:ml-20">
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
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800 animate-in fade-in-0 duration-1000 delay-500 px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {new Date().getFullYear()} PaidSMS. All rights reserved.
            </p>
            <div className="flex gap-4">
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