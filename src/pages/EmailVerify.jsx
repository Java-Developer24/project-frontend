import React from "react";
import { useLocation } from "react-router-dom";
import { Icon } from "@/components/ui/Icons";

const EmailVerify = () => {
  const { state } = useLocation();
  const email = state?.email || "your registered email";

  return (
    <div className="h-[calc(100dvh-4rem)] flex items-center justify-center bg-black text-white">
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
        <p className="text-sm text-gray-500 animate-in fade-in-0 duration-700 delay-700">
          Be sure to check your spam or junk folders if you don't see the email in your inbox.
        </p>
      </div>
    </div>
  );
};

export default EmailVerify;