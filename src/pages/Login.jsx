import  { useContext, useState, useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icons";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Eye, EyeOff } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import ReCAPTCHA from "react-google-recaptcha";
import Turnstile, { useTurnstile } from "react-turnstile";

import { useNavigate } from "react-router-dom";
import { useInputValidation } from "6pp";
import {
  confirmPasswordValidator,
  emailValidator,
  passwordValidator,
} from "@/utils/validators";
import axios from "axios";
import { AuthContext } from "@/utils/AppContext";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import Otp from "@/components/ui/Otp";

const Login = () => {
  const turnstile = useTurnstile();

  const [showPassword, setShowPassword] = useState(false);
  const [captchaValue, setCaptchaValue] = useState("");
  const [forgotPass, setForgotPass] = useState(false);
  const emailAdd = useInputValidation("", emailValidator);
  const email = useInputValidation("", emailValidator);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const password = useInputValidation("");
  const navigate = useNavigate();

  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState("");
  const [resendEnabled, setResendEnabled] = useState(false);
  const [timer, setTimer] = useState(60);
  const [emailSent, setEmailSent] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const errorMessage = queryParams.get('error');

    if (errorMessage) {
      toast.error(errorMessage); // Display error toast if error exists in query
    }
  },  [location.search]);

  const forgotPassword = useInputValidation("", passwordValidator);
  const confirmPassword = useInputValidation("", (value) =>
    confirmPasswordValidator(value, forgotPassword.value)
  );
  const navigateToSignUp = () => navigate("/signup");
  const { login } = useContext(AuthContext);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword((prev) => !prev);

  const handleOtpChange = (value) => {
    setOtp(value);
  };

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setResendEnabled(true);
    }
  }, [timer]);

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    setIsLoading(true);
    const verifyOtpPromise = new Promise((resolve, reject) => {
      const verifyOtpRequest = async () => {
        try {
          // Send verifyOtp request
          const response = await axios.post("/api/user/verify-forgot-otp", {
            email: email.value,
            otp,
          });
          resolve(response); // Resolve the promise on success
        } catch (error) {
          // Reject the promise on error
          reject(error);
        } finally {
          setIsLoading(false);
        }
      };

      verifyOtpRequest();
    });

    // Show toast notifications based on the promise state
    await toast.promise(verifyOtpPromise, {
      loading: "Verifying otp...",
      success: (r) => {
        setShowOTP(false);
        setForgotPass(true);
        return r.data?.message;
      },
      error: (error) => {
       
      if (error.response) {
        // API responded with an error
        toast.error(error.response.data.message);
      } else if (error.request) {
        // Request made but no response received
        toast.error("No response received from the server. Please try again.");
      } else {
        // Other errors during the request setup
        toast.error(`An unexpected error occurred: ${error.message}`);
      }
      },
    });
  };

  const handleResendOtp = async () => {
    setResendEnabled(false);
    setTimer(60);

    const resendOtpPromise = new Promise((resolve, reject) => {
      const resendOtpRequest = async () => {
        try {
          // Send ResendOtp request
          await axios.post("/api/user/resend-forgot-otp", { email: email.value });
          resolve(); // Resolve the promise on success
        } catch (error) {
          // Reject the promise on error
          reject(error);
        }
      };

      resendOtpRequest();
    });

    // Show toast notifications based on the promise state
    await toast.promise(resendOtpPromise, {
      loading: "Resending otp...",
      success: () => {
        return "OTP resent successfully";
      },
      error: (error) => {
       
      if (error.response) {
        // API responded with an error
        toast.error(error.response.data.message);
      } else if (error.request) {
        // Request made but no response received
        toast.error("No response received from the server. Please try again.");
      } else {
        // Other errors during the request setup
        toast.error(`An unexpected error occurred: ${error.message}`);
      }
      },
    });
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    const forgotPassPromise = new Promise((resolve, reject) => {
      const forgotPassRequest = async () => {
        try {
          await axios.post("/api/user/forgot-password", {
            email: email.value,
          });

          resolve(); // Resolve the promise on success
        } catch (error) {
          // Reject the promise on error
          reject(error);
        } finally {
          setIsLoading(false);
        }
      };

      forgotPassRequest();
    });

    await toast.promise(forgotPassPromise, {
      loading: "Sending otp...",
      success: () => {
        setEmailSent(true);
        setShowOTP(true);
        return "OTP sent to your email";
      },
      error: (error) => {
        toast.dismiss(); // Dismiss the loading toast
      if (error.response) {
        // Server responded with a status other than 2xx
        toast.error(error.response.data.message);
      } else if (error.request) {
        // Request was made but no response was received
        toast.error("No response received from server");
      } else {
        // Something went wrong in setting up the request
        toast.error(`Error: ${error.message}`);
      }
      toast.error(errorMessage);
      },
    });
  };

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const passwordChangePromise = new Promise((resolve, reject) => {
      const passwordChangeRequest = async () => {
        try {
          // Send passwordChange request
          await axios.post("/api/user/change-password-unauthenticated", {
            email: email.value,
            newPassword: forgotPassword.value,
          });
          resolve(); // Resolve the promise on success
        } catch (error) {
          // Reject the promise on error
          reject(error);
        } finally {
          setIsLoading(false);
        }
      };

      passwordChangeRequest();
    });

    // Show toast notifications based on the promise state
    await toast.promise(passwordChangePromise, {
      loading: "Processing request...",
      success: () => {
        setForgotPass(false);
        setEmailSent(false);
        setShowOTP(false);
        return "Password changed successfully. Please log in.";
      },
      error: (error) => {
       
      if (error.response) {
        // API responded with an error
        toast.error(error.response.data.message);
      } else if (error.request) {
        // Request made but no response received
        toast.error("No response received from the server. Please try again.");
      } else {
        // Other errors during the request setup
        toast.error(`An unexpected error occurred: ${error.message}`);
      }
      },
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Check if email, password, and captcha values are present
    if (!emailAdd?.value || !password?.value || !captchaValue) {
      toast.error("Please fill out all fields and complete the CAPTCHA");
      return;
    }
  
    setIsLoading(true);
  
    // Show a loading toast
    const loadingToastId = toast.loading("Logging in...");
  
    try {
      // Send login request to the server
      const { data } = await axios.post("/api/auth/login", {
        email: emailAdd.value,
        password: password.value,
        captcha: captchaValue,
      });
  
      // Extract token from response
      const { token } = data;
      
      // Store token and perform login action
      login(token);
  
      // Replace loading toast with success message
      toast.dismiss(loadingToastId);
      
      
      // Redirect after a short delay
      
      
      toast.success("Login successful!", {
        duration: 4000, // Display for 3 seconds
        
      });
       
        setTimeout(() => {
          toast.dismiss();
         navigate("/");
          
        }, 2000); // Adjust delay as needed
           
      

    } catch (error) {
      // Handle any errors during the login request
      toast.dismiss(loadingToastId);
  
      if (error.response) {
        // API responded with an error
        toast.error(error.response.data.message);
      } else if (error.request) {
        // Request made but no response received
        toast.error("No response received from the server. Please try again.");
      } else {
        // Other errors during the request setup
        toast.error(`An unexpected error occurred: ${error.message}`);
      }
    } finally {
      // Reset loading state regardless of success or failure
      setIsLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    try {
      
     window.location.href = "https://api.paidsms.org/api/auth/google/login"
    } catch (error) {
      // Example of redirecting with error message
        navigate(`/login?error=${encodeURIComponent(error?.response?.data?.message || "Login failed. Please try again.")}`);
    }
  };
  
 
 
 

  return (
    <div className="h-[calc(100dvh-4rem)] flex items-center justify-center">
     <Card className="bg-[#121315] w-full max-w-md rounded-lg border-none dark">
        <CardHeader>
          <CardTitle className="text-center font-medium">
            {forgotPass ? (showOTP ? "Verify OTP" : "Reset Password") : "Login"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 !pt-0">
          {!forgotPass ? (
            <>
              <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="email"
                      className="block text-sm text-[#9d9d9d] font-normal py-1"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      className="w-full h-10 pl-3 rounded-lg text-[#9d9d9d] placeholder-text-[#9d9d9d] bg-transparent border-[#e0effe] focus:border-none"
                      value={emailAdd.value}
                      onChange={emailAdd.changeHandler}
                      required
                    />
                    {emailAdd.error && (
                      <span className="text-red-500 text-xs">
                        {emailAdd.error}
                      </span>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="password"
                      className="block text-sm text-[#9d9d9d] font-normal py-1"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="w-full h-10 pl-3 pr-10 rounded-lg text-[#9d9d9d] placeholder-text-[#9d9d9d] bg-transparent border-[#e0effe] focus:border-none"
                        value={password.value}
                        onChange={password.changeHandler}
                        required
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 px-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5 text-[#9d9d9d]" />
                        ) : (
                          <Eye className="w-5 h-5 text-[#9d9d9d]" />
                        )}
                      </button>
                    </div>
                    {password.error && (
                      <span className="text-red-500 text-xs">
                        {password.error}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="link"
                      className="text-sm font-normal text-[#397CFF] !no-underline p-1 h-0"
                      onClick={() => setForgotPass(true)}
                    >
                      Forgot password
                    </Button>
                  </div>
                </div>

                <div className="flex justify-center mb-4 mt-8">
                  <Turnstile
                    sitekey="0x4AAAAAAA7JkcJWSuYHAWBL"
                    
                    onVerify={(token) => {
                      setCaptchaValue(token);
                    }}
                     className="scale-[0.85] md:transform-none"
                  />
                </div>

                <Button
                  type="submit"
                  variant="login"
                  isLoading={isLoading}
                  className="w-full text-sm font-normal mb-4"
                  disabled={
                    !emailAdd.value ||
                    !password.value
                  }
                >
                  Login
                </Button>
                <Button
                  onClick={handleGoogleLogin}
                  variant="outline"
                  type="button"
                 className="w-full text-sm"
                >
                  <Icon.google className="w-4 h-4 mr-2" /> Continue with Google
                </Button>
              </form>

              <div className="mt-4 text-center text-sm text-[#BEBEBF] font-normal">
                Don&apos;t have an account?{" "}
                <Button
                  variant="link"
                  className="!no-underline py-0 px-1 text-sm font-normal h-0"
                  onClick={navigateToSignUp}
                >
                  Sign Up
                </Button>
              </div>
            </>
          ) : !emailSent ? (
            <form onSubmit={handleForgotPasswordSubmit}>
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="email"
                    className="block text-sm text-[#9d9d9d] font-normal py-1"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    className="w-full h-10 pl-3 rounded-lg text-[#9d9d9d] placeholder-text-[#9d9d9d] bg-transparent border-[#e0effe] focus:border-none"
                    value={email.value}
                    onChange={email.changeHandler}
                    required
                  />
                  {email.error && (
                    <span className="text-red-500 text-xs">{email.error}</span>
                  )}
                </div>
              </div>

              <Button
                  type="submit"
                className="w-full bg-primary text-white font-medium py-2 rounded-lg mt-3 h-10 hover:bg-primary focus:outline-none"
                isLoading={isLoading}
                disabled={email.error || isLoading || !email.value}
              >
                Send OTP
              </Button>

            </form>
          ) : showOTP ? (
            <form onSubmit={handleOtpSubmit}>
              <div className="flex items-center justify-center gap-2 flex-col sm:flex-row">
                <Otp length={6} otp={otp} onOtpChange={handleOtpChange} />
                <div className="flex justify-center">
                  <Button
                    variant="link"
                    className="text-sm font-normal text-[#397CFF] !no-underline p-1 h-0 mt-2"
                    onClick={handleResendOtp}
                    disabled={!resendEnabled}
                  >
                    Resend OTP {resendEnabled ? "" : `(${timer}s)`}
                  </Button>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary text-white font-medium py-2  hover:bg-primary focus:outline-none rounded-lg my-4 h-10"
                  disabled={otp.length !== 6 || isLoading}
                  isLoading={isLoading}
                >
                  Verify OTP
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordChangeSubmit}>
              <div className="space-y-4">
                <div>
                  <Label
                    htmlFor="new-password"
                    className="block text-sm text-[#9d9d9d] font-normal py-1"
                  >
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your new password"
                      className="w-full h-10 pl-3 pr-10 rounded-lg text-[#9d9d9d] placeholder-text-[#9d9d9d] bg-transparent border-[#e0effe] focus:border-none"
                      value={forgotPassword.value}
                      onChange={forgotPassword.changeHandler}
                      required
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 px-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-[#9d9d9d]" />
                      ) : (
                        <Eye className="w-5 h-5 text-[#9d9d9d]" />
                      )}
                    </button>
                  </div>
                  {forgotPassword.error && (
                    <span className="text-red-500 text-xs">
                      {forgotPassword.error}
                    </span>
                  )}
                </div>
                <div>
                  <Label
                    htmlFor="confirm-password"
                    className="block text-sm text-[#9d9d9d] font-normal py-1"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
                      className="w-full h-10 pl-3 pr-10 rounded-lg text-[#9d9d9d] placeholder-text-[#9d9d9d] bg-transparent border-[#e0effe] focus:border-none"
                      value={confirmPassword.value}
                      onChange={confirmPassword.changeHandler}
                      required
                    />
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="absolute inset-y-0 right-0 px-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5 text-[#9d9d9d]" />
                      ) : (
                        <Eye className="w-5 h-5 text-[#9d9d9d]" />
                      )}
                    </button>
                  </div>
                  {confirmPassword.error && (
                    <span className="text-red-500 text-xs">
                      {confirmPassword.error}
                    </span>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-white font-medium py-2 rounded-lg mt-3 h-10"
                disabled={
                  !forgotPassword.value ||
                  !confirmPassword.value ||
                  forgotPassword.error ||
                  confirmPassword.error ||
                  isLoading
                }
                isLoading={isLoading}
              >
                Change Password
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppLayout()(Login);

