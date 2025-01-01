import React, { useState, useContext,useEffect } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icons";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Eye, EyeOff } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import Turnstile, { useTurnstile } from "react-turnstile";

import { useNavigate } from "react-router-dom";
import { useInputValidation } from "6pp";
import {
  confirmPasswordValidator,
  emailValidator,
  passwordValidator,
} from "@/utils/validators";
import toast from "react-hot-toast";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import { AuthContext } from "@/utils/AppContext";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captchaValue, setCaptchaValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const turnstile = useTurnstile();


  const email = useInputValidation("", emailValidator);
  const password = useInputValidation("", passwordValidator);
  const confirmPassword = useInputValidation("", (value) =>
    confirmPasswordValidator(value, password.value)
  );

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  // Handle Google Login Redirect
  useEffect(() => {
    // Extract token from the URL query parameters
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      // Store the token and navigate
      login(token); // Store token in AuthContext
      toast.success("Login successful!");

      // Clear the query parameters and redirect
      navigate("/", { replace: true });
    }
  }, [login, navigate]);

  // Helper functions for toggling password visibility
  const toggleVisibility = (setVisibility) => setVisibility((prev) => !prev);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!captchaValue) {
      toast.error("Please complete the CAPTCHA");
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await axios.post(
        "/api/auth/signup",
        {
          email: email.value,
          password: password.value,
          confirmPassword: confirmPassword.value,
          captcha: captchaValue,
        },
        { withCredentials: true }
      );

      // Automatically log in user after signup
      
      toast.success(data.message || "Signup successful. Please verify your email to activate your account.");

      navigate("/email-verify", { state: { email: email.value } });

     
    } catch (error) {
      const message =
        error.response?.data?.message || "Signup failed. Please try again.";
      toast.error(message);
      if (turnstile) {
        turnstile.reset();
      }
    } finally {
      setIsLoading(false);
    }
  };


  
  const handleGoogleLogin = () => {
    // Redirect to the backend's Google OAuth route
    window.location.href = "http://localhost:3000/api/auth/google/signup";
  };
  
 

  return (
    <div className="h-[calc(100dvh-4rem)] flex items-center justify-center">
      <Card className="bg-[#121315] w-full max-w-md p-4 rounded-lg border-none dark">
        <CardHeader>
          <CardTitle className="text-center font-medium">
            Create Your Account
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0 md:p-6 !pt-0">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Email Input */}
              <div>
                <Label htmlFor="email" className="block text-sm text-[#9d9d9d]">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  className="w-full h-12 pl-3 rounded-lg bg-transparent border-[#e0effe]"
                  value={email.value}
                  onChange={email.changeHandler}
                  required
                />
                {email.error && (
                  <span className="text-red-500 text-xs">{email.error}</span>
                )}
              </div>

              {/* Password Input */}
              <div>
                <Label htmlFor="password" className="block text-sm text-[#9d9d9d]">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full h-12 pl-3 pr-10 rounded-lg bg-transparent border-[#e0effe]"
                    value={password.value}
                    onChange={password.changeHandler}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => toggleVisibility(setShowPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-[#9d9d9d]" />
                    ) : (
                      <Eye className="w-5 h-5 text-[#9d9d9d]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <Label
                  htmlFor="confirm-password"
                  className="block text-sm text-[#9d9d9d]"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    className="w-full h-12 pl-3 pr-10 rounded-lg bg-transparent border-[#e0effe]"
                    value={confirmPassword.value}
                    onChange={confirmPassword.changeHandler}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => toggleVisibility(setShowConfirmPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5 text-[#9d9d9d]" />
                    ) : (
                      <Eye className="w-5 h-5 text-[#9d9d9d]" />
                    )}
                  </button>
                </div>
              </div>

              {/* CAPTCHA */}
              <div className="flex justify-center my-4">
              <Turnstile
                
                sitekey="0x4AAAAAAA3HP5RN6qhb67vx" // Replace with your site key
                onVerify={(token) => {
                  // console.log("Captcha token:", token);
                  setCaptchaValue(token);
                }} // Store the CAPTCHA token
              />
                
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="login"
                className="w-full text-sm font-normal"
                isLoading={isLoading}
                disabled={
                  !captchaValue ||
                  isLoading ||
                  email.error ||
                  password.error ||
                  confirmPassword.error
                }
              >
                Create Account
              </Button>

              {/* Google Login */}
              <Button
                variant="outline"
                className="w-full text-sm"
                onClick={handleGoogleLogin}
              >
                <Icon.google className="w-4 h-4 mr-2" /> Signup with Google
              </Button>
            </div>
          </form>

          {/* Redirect to Login */}
          <div className="mt-4 text-center text-sm text-[#BEBEBF]">
            Already have an account?{" "}
            <Button
              variant="link"
              className="py-0 px-1 text-sm"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppLayout()(SignUp);
