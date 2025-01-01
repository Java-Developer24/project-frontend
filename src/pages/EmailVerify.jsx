import React from "react";
import { useLocation } from "react-router-dom";

const EmailVerify = () => {
  const { state } = useLocation();
  const email = state?.email || "your registered email";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white">
      <div className="bg-white text-gray-800 rounded-lg shadow-lg p-8 max-w-md text-center">
        <img
          src="https://img.freepik.com/free-vector/phishing-account-concept_23-2148546508.jpg?semt=ais_hybrid" // Replace with an actual email icon or illustration
          alt="Email Verification"
          className="mx-auto w-32 mb-6"
        />
        <h1 className="text-2xl font-bold mb-4 text-indigo-600">
          Verify Your Email Address
        </h1>
        <p className="mb-6 text-gray-700">
          We've sent a verification email to{" "}
          <span className="text-indigo-600 font-semibold">{email}</span>. Please
          check your inbox and click on the link to verify your account.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Didn’t receive the email? Be sure to check your spam or junk folders.
        </p>
        <button
          onClick={() => alert("Resend feature coming soon!")}
          className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-300"
        >
          Resend Verification Email
        </button>
      </div>
    </div>
  );
};

export default EmailVerify;
