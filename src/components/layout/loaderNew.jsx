import React from "react";

const LayoutLoader = () => {
  return (
    <div className="flex items-center justify-center h-[calc(100dvh-6rem)]">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary"></div>
  </div>
  );
};

const SnapLoader = () => {
  return (
    
    <div className="flex items-center justify-center h-[calc(100dvh-6rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary"></div>
      </div>
  );
};

export { LayoutLoader, SnapLoader };
