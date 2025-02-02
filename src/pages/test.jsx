import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useAuth } from "@/utils/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import toast from "react-hot-toast";
import AppLayout from "@/components/layout/AppLayout";

const MfaPage = () => {
  const [mfaCode, setMfaCode] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isMFAEnabled, setIsMFAEnabled] = useState(false);
  const [isMFASetupComplete, setIsMFASetupComplete] = useState(false);
  const [loading, setLoading] = useState(true); // Track loading state
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const tempEmail = localStorage.getItem("tempEmail");

    if (!tempEmail) {
      navigate("/login");
      return;
    }

    // Function to check MFA status
    const checkMFAStatus = async () => {
      try {
        const response = await fetch("https://api.paidsms.org//api/mfa/status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ tempEmail }),
        });

        const data = await response.json();

        if (data.success && data.is2FAEnabled && data.is2FASetupComplete) {
          // MFA is fully enabled and set up
          setIsMFAEnabled(true);
          setIsMFASetupComplete(true);
        } else if (data.success && data.is2FAEnabled && !data.is2FASetupComplete) {
          // MFA is enabled but not set up
          setIsMFAEnabled(true);
          setIsMFASetupComplete(false);

          const setupResponse = await fetch("https://api.paidsms.org//api/mfa/enable", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tempEmail }),
          });

          const setupData = await setupResponse.json();
          if (setupData.qrCodeUrl) {
            setQrCodeUrl(setupData.qrCodeUrl); // Show QR code for setup
          }
        } else if (data.success && !data.is2FAEnabled) {
          // MFA is disabled
          
          login();
          setTimeout(() => {
            navigate("/"); // Redirect to desired page
          }, 2000);
        } else {
          // Handle unexpected states
          toast.error("Unexpected MFA state. Please contact support.");
        }
      } catch (error) {
        console.error("Error checking MFA status:", error);
        toast.error("Failed to check MFA status.");
      } finally {
        setLoading(false); // Set loading to false once the API call is done
      }
    };

    checkMFAStatus();
  }, [navigate]);

  const handleVerifyMFA = async (e) => {
    e.preventDefault();
    const tempEmail = localStorage.getItem("tempEmail");

    try {
      const response = await fetch("https://api.paidsms.org//api/mfa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tempEmail, mfaCode }),
      });

      const data = await response.json();

      if (data.message === "2FA verified successfully. Access granted.") {
        login();
        navigate("/");// Navigate to the main page
        toast.success(
          isMFAEnabled ? "MFA verification successful" : "MFA setup successful"
        );
      } else {
        toast.error("Invalid MFA code.");
      }
    } catch (error) {
      console.error("Error verifying MFA:", error);
      toast.error("Failed to verify MFA code.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center pt-[4rem]">
        <Card className="bg-transparent w-full max-w-md rounded-lg mb-[60px] border-none dark">
          <CardHeader>
            <CardTitle className="text-center text-[28px] font-medium">
              Loading MFA status...
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <p className="text-[#9d9d9d]">Please wait while we check your MFA status...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center pt-[4rem]">
      <Card className="bg-transparent w-full max-w-md rounded-lg mb-[60px] border-none dark">
        <CardHeader>
          <CardTitle className="text-center text-[28px] font-medium">
            {isMFAEnabled
              ? isMFASetupComplete
                ? "Enter MFA Code"
                : "Setup MFA Authentication"
              : "MFA Disabled"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {!isMFAEnabled ? (
            <div className="text-center text-[#9d9d9d]">
              <p>MFA is disabled. Redirecting you to the User data page...</p>
            </div>
          ) : (
            <>
              {/* Show QR code only if MFA is enabled but not set up */}
              {!isMFASetupComplete && qrCodeUrl && (
                <div className="mb-6">
                  <p className="text-[#9d9d9d] mb-4 text-center">
                    Scan this QR code with your authenticator app
                  </p>
                  <div className="flex justify-center mb-4">
                    <img src={qrCodeUrl} alt="MFA QR Code" className="w-48 h-48" />
                  </div>
                </div>
              )}

              {/* Show form for code input when MFA setup is pending or completed */}
              <form onSubmit={handleVerifyMFA}>
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="mfaCode"
                      className="block text-sm text-[#9d9d9d] font-normal py-1"
                    >
                      {isMFASetupComplete
                        ? "Enter Code from Authenticator"
                        : "Enter Code to Complete Setup"}
                    </Label>
                    <Input
                      id="mfaCode"
                      type="text"
                      placeholder="Enter 6-digit code"
                      className="w-full h-12 pl-3 rounded-lg !text-[#9d9d9d] !placeholder-[#9d9d9d] bg-transparent border-[#e0effe] focus:border-none"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="login"
                    className="w-full text-sm font-normal mt-4"
                  >
                    {isMFASetupComplete ? "Verify Code" : "Complete MFA Setup"}
                  </Button>
                </div>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AppLayout()(MfaPage);
