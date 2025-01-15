import React from 'react';
import { Icon } from '../ui/Icons';

const Banner = ({ message, type = 'info' }) => {
  if (!message) return null;

  const getBannerStyles = () => {
    switch (type) {
      
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <div className={`w-full   rounded-lg  ${getBannerStyles()}`}>
      <div className="flex items-center justify-start gap-2 animate-scroll ">
        
        <p className="text-xs ">{message}</p>
      </div>
    </div>
  );
};

export default Banner;
