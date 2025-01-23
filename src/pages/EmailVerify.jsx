import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Icon } from "@/components/ui/Icons";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import AppLayout from "@/components/layout/AppLayout";

const EmailVerify = () => {
  const { state } = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60); // Start the timer at 60 seconds
  const email = state?.email || "your registered email";

  // Timer effect
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000); // Decrease timer every second
    }
    return () => clearInterval(interval); // Clear interval on component unmount or when timer ends
  }, [timer]);

  const handleResendVerificationEmail = async (email) => {
    setIsLoading(true);
    try {
      console.log("Attempting to resend email to:", email);
      const response = await axios.post("/api/auth/resend-verification-email", { email });

      const { message } = response.data;

      if (message === "This email is already verified.") {
        toast.success("This email is already verified.", {
          autoClose: 3000,
        });
      } else if (message === "Verification email sent successfully. Please check your inbox.") {
        toast.success("Verification email sent successfully!", {
          autoClose: 3000,
        });
        setTimer(60); // Restart the timer after resend
      }

      console.log("Verification email sent successfully:", response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "An error occurred.";
      console.error("Error resending verification email:", errorMessage);

      toast.error(errorMessage, {
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100dvh-4rem)] flex items-center justify-center bg-black text-white">
      <Toaster position="top-right" reverseOrder={false} />
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
          disabled={isLoading || timer > 0} // Disable if loading or timer is running
          className={`bg-green-600 text-white text-sm px-4 py-2 rounded-md shadow-md hover:scale-105 hover:shadow-lg transition-transform ${
            isLoading || timer > 0 ? "cursor-not-allowed opacity-70" : ""
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
              Resend Verification Email...
            </div>
          ) : timer > 0 ? (
            `Resend Verification Email`
          ) : (
            "Resend Verification Email"
          )}
        </button>

        {timer > 0 && (
          <p className="text-sm text-gray-500 animate-in fade-in-0 duration-700 delay-700 mt-2">
            You can resend the email in {timer} seconds.
          </p>
        )}

        <p className="text-sm text-gray-500 animate-in fade-in-0 duration-700 delay-700 mt-2">
          Be sure to check your spam or junk folders if you don't see the email in your inbox.
        </p>
      </div>
    </div>
  );
};

export default AppLayout() (EmailVerify);
