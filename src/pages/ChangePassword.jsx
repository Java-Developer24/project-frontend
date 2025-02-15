import { useInputValidation, useStrongPassword } from "6pp";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  confirmPasswordValidator,
  passwordValidator,
} from "@/utils/validators";
import { Eye, EyeOff } from "lucide-react";
import { useState, useContext, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import Turnstile, { useTurnstile } from "react-turnstile";

import axios from "axios";
import { AuthContext } from "@/utils/AppContext";
import toast from "react-hot-toast";

const ChangePassword = () => {

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [captchaValue, setCaptchaValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const recaptchaRef = useRef(null);
  const turnstile = useTurnstile();


  const currentPassword = useInputValidation("", passwordValidator);
  const password = useInputValidation("", passwordValidator);
  const confirmPassword = useInputValidation("", (value) =>
    confirmPasswordValidator(value, password.value)
  );

  const { user } = useContext(AuthContext);
  console.log(user.userId)
  const token = localStorage.getItem("paidsms-token");
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword((prev) => !prev);
  const toggleCurrentPasswordVisibility = () =>
    setShowCurrentPassword((prev) => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!captchaValue) {
      toast.error("Please complete the CAPTCHA");
      return;
    }

    if (currentPassword.value === password.value) {
      toast.error("New password cannot be the same as the current password");
      return;
    }

    setIsLoading(true);
console.log(user)
    const changePasswordRequest = async () => {
      try {
        const response = await axios.post(
          '/api/user/change-password',
          {
            currentPassword: currentPassword.value,
            newPassword: password.value,
            userId: user.userId,
            captcha: captchaValue,
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          } 
        );
        console.log(response.data)
        return response.data;  // Return the response data directly
       
      } catch (error) {
        // If there's an error, throw it to be caught by the error handler
        throw error;
      } finally {
        setIsLoading(false);
      }
    };
    
    await toast.promise(changePasswordRequest(), {
      loading: "Changing password...",
      success: (data) => {
        console.log("Success Data:", data);
        // Clear form fields on success
        currentPassword.clear();
        password.clear();
        confirmPassword.clear();
        turnstile.reset();
    
        // Use the message from the backend if available, or the default success message
        return data.message || "Password changed successfully!";
      },
      error: (error) => {
        // Handle the error from the backend response
        const errorMessage = error.response?.data?.message || "Failed to change password. Please try again.";
        if (turnstile) {
          turnstile.reset();
        }
        return errorMessage;
      }
    });
    
   
  };

  return (
    <div className="h-[calc(100dvh-4rem)] flex flex-col items-center justify-center">
      <Card className="bg-[#121315] w-full max-w-md p-4 rounded-lg border-none dark">
        <CardHeader>
          <CardTitle className="text-center font-medium">
            Change Your Password
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 md:p-6 !pt-0">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="current-password"
                  className="block text-sm text-[#9d9d9d] font-normal py-1"
                >
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter your current password"
                    className="w-full h-12 pl-3 pr-10 rounded-lg text-[#9d9d9d] placeholder-text-[#9d9d9d] bg-transparent border-[#e0effe] focus:border-none"
                    value={currentPassword.value}
                    onChange={currentPassword.changeHandler}
                    required
                  />
                  <button
                    type="button"
                    onClick={toggleCurrentPasswordVisibility}
                    className="absolute inset-y-0 right-0 px-3 flex items-center"
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="w-5 h-5 text-[#9d9d9d]" />
                    ) : (
                      <Eye className="w-5 h-5 text-[#9d9d9d]" />
                    )}
                  </button>
                </div>
                {currentPassword.error && (
                  <span className="text-red-500 text-xs">
                    {currentPassword.error}
                  </span>
                )}
              </div>
              <div>
                <Label
                  htmlFor="password"
                  className="block text-sm text-[#9d9d9d] font-normal py-1"
                >
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    className="w-full h-12 pl-3 pr-10 rounded-lg text-[#9d9d9d] placeholder-text-[#9d9d9d] bg-transparent border-[#e0effe] focus:border-none"
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
                  <span className="text-red-500 text-xs">{password.error}</span>
                )}
              </div>
              <div>
                <Label
                  htmlFor="confirm-password"
                  className="block text-sm text-[#9d9d9d] font-normal py-1"
                >
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    className="w-full h-12 pl-3 pr-10 rounded-lg text-[#9d9d9d] placeholder-text-[#9d9d9d] bg-transparent border-[#e0effe] focus:border-none"
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
            <div className="flex justify-center mb-4 mt-8">
            <Turnstile
                
                sitekey="0x4AAAAAAA7JkcJWSuYHAWBL" // Replace with your site key
                onVerify={(token) => {
                  // console.log("Captcha token:", token);
                  setCaptchaValue(token);
                }} // Store the CAPTCHA token
              />
            </div>
            <Button
              type="submit"
              variant="login"
              isLoading={isLoading}
              className="w-full text-sm font-normal mb-4"
              disabled={
                !captchaValue ||
                (captchaValue && isLoading) ||
                !currentPassword.value ||
                !password.value ||
                !confirmPassword.value ||
                currentPassword.error ||
                password.error ||
                confirmPassword.error
              }
            >
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppLayout()(ChangePassword);
