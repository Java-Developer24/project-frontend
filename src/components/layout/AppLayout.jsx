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
        
        <div className="md:container px-[1rem]">
          <WrappedComponent {...props} />
        </div>
      </>
    );
  };
};

export default AppLayout;
