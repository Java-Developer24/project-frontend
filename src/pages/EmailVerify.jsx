import React from "react";
import { useLocation } from "react-router-dom";
import { Icon } from "@/components/ui/Icons";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast"; // Import Toaster here


const EmailVerify = () => {
  const { state } = useLocation();
  const email = state?.email || "your registered email";

  const handleResendVerificationEmail = async (email) => {
    try {
      console.log("Attempting to resend email to:", email); // Added log to verify email
      const response = await axios.post("/api/auth/resend-verification-email", {
        email, // User's email
      });

      console.log("Response received:", response); // Log the full response to see the structure
      const { message } = response.data;

      // Handle specific server response
      if (message === "This email is already verified.") {
        toast.info("This email is already verified.", {
           position: "bottom-right",
          autoClose: 3000,
        });
      } else if (message === "Verification email sent successfully. Please check your inbox.") {
        toast.success("Verification email sent successfully!", {
          position: "bottom-right",
          autoClose: 3000,
        });
      }

      console.log("Verification email sent successfully:", response.data);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred.";
      console.error("Error resending verification email:", errorMessage);

      // Display error toast
      toast.error(errorMessage, {
        position: "bottom-right",
        autoClose: 3000,
      });

      return errorMessage;
    }
  };
  return (
    <div className="h-[calc(100dvh-4rem)] flex items-center justify-center bg-black text-white">
      <Toaster position="top-right" reverseOrder={false} /> {/* Ensure Toaster is added here */}
      <div className="bg-[#121315] rounded-lg shadow-lg p-8 max-w-md text-center border border-[#1b1d21] animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
        <Icon.mail
          className="mx-auto w-16 h-16 mb-6 text-primary animate-in zoom-in-50 duration-1000"
        />
        <h1 className="text-2xl font-bold mb-4 text-primary animate-in slide-in-from-left duration-700 delay-300">
          Verify Your Email Address
        </h1>
        <p className="mb-6 text-gray-400 animate-in fade-in-0 duration-700 delay-500">
          We've sent a verification email to{" "}
          <span className="text-primary font-semibold">{email}</span>. Please
          check your inbox and click on the link to verify your account.
        </p>
        <button
  onClick={() => handleResendVerificationEmail(email)}
  className="bg-green-600 text-primary text-white  text-sm px-4 py-2 rounded-md shadow-md hover:scale-105 hover:shadow-lg transition-transform"
>
  Resend Verification Email
</button>


        <p className="text-sm text-gray-500 animate-in fade-in-0 duration-700 delay-700 mt-2">
          Be sure to check your spam or junk folders if you don't see the email in your inbox.
        </p>
      </div>
    </div>
  );
};

export default EmailVerify;