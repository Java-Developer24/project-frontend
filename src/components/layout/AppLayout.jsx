/* eslint-disable react/display-name */
import React from "react";
import Header from "./Header";
import { Toaster } from "react-hot-toast";

const AppLayout = () => (WrappedComponent) => {
  return (props) => {
    return (
      <>
        {/* <Title /> */}
       
        <Header />
        <Toaster position="top-right" 
        
        containerStyle={{
          marginTop: '60px', // Moves the toaster lower
        }}
        toastOptions={{
          style: {
            fontSize: '14px', // Set your desired font size
          },
        }}
        
        
        reverseOrder={false} />
        <div className="md:container px-[1rem]">
          <WrappedComponent {...props} />
        </div>
      </>
    );
  };
};

export default AppLayout;
