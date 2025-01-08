import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useContext } from "react";
import { AuthContext } from "@/utils/AppContext";
import axios from "axios";
import AppLayout from "@/components/layout/AppLayout";
import { Turnstile } from "@marsidev/react-turnstile";

const AdminAuthLogin = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null); // Rename for clarity
  const userId = searchParams.get("userId"); // Extract userId outside useEffect

  const handleCaptchaVerify = (token) => {
    setCaptchaToken(token);
  };

  useEffect(() => {
    const performAdminLogin = async () => {
      if (!userId) {
        toast.error("User ID is missing.");
        navigate("/signup");
        return;
      }

      if (!captchaToken) {
        // reCAPTCHA not yet verified, do nothing and wait
        return;
      }

      setIsLoading(true);
      try {
        const response = await axios.post(
          "http://localhost:3000/api/auth/admin-login-behalf-user",
          { userId, captchaToken } // Send both userId and reCAPTCHA token
        );

        const { token } = response.data;
        if (token) {
          login(token);
          toast.success("Admin login successful!");
          navigate("/");
        } else {
          toast.error("Invalid token received from backend.");
        }
      } catch (error) {
        console.error("Admin login error:", error);
        toast.error("Admin login failed.");
      } finally {
        setIsLoading(false);
        setCaptchaToken(null); // Reset after request
      }
    };

    performAdminLogin(); // Call inside useEffect
  }, [userId, captchaToken, navigate, login]); // Correct dependencies

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AppLayout>
      <h2>Admin Login</h2>
      {!userId ? (
        <p>Invalid Request</p>
      ) : (
        <Turnstile
          sitekey="YOUR_CLOUDFLARE_SITEKEY" // Replace with your actual sitekey
          onVerify={handleCaptchaVerify}
        />
      )}
    </AppLayout>
  );
};

export default AppLayout()(AdminAuthLogin);