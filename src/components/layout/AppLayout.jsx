import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Toaster } from "react-hot-toast";

const AppLayout = () => (WrappedComponent) => {
  return (props) => {
    return (
      <div className="min-h-screen flex flex-col">
        <Toaster position="bottom-right" reverseOrder={false} />
        <Header />
        <div className="md:container px-[1rem] flex-grow">
          <WrappedComponent {...props} />
        </div>
        <Footer />
      </div>
    );
  };
};

export default AppLayout;