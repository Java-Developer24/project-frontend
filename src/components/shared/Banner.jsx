import React from 'react';
import { Icon } from '../ui/Icons';

const Banner = ({ message, type = 'info' }) => {
  if (!message) return null;

  const getBannerStyles = () => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'error':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'success':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <div className={`w-full px-4 py-3  rounded-lg mb-4 overflow-hidden ${getBannerStyles()}`}>
      <div className="flex items-center justify-start gap-2 animate-scroll">
        <Icon.info className="w-5 h-5" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
};

export default Banner;
