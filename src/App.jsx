import { lazy, Suspense, useContext, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "./utils/AppContext";
import ProtectRoute from "@/components/auth/ProtectRoute";
import { LayoutLoader } from "@/components/layout/Loaders";
import Maintenance from "@/pages/Maintenance"; // Lazy loaded
import HomeWrapper from "@/components/layout/HomeWrapper";
import NotFound from "@/pages/NotFound";

// Other imports for lazy-loaded pages
const Login = lazy(() => import("@/pages/Login"));
const SignUp = lazy(() => import("@/pages/SignUp"));
const ChangePassword = lazy(() => import("@/pages/ChangePassword"));
const Api_key = lazy(() => import("@/pages/Api"));
const GetNumber = lazy(() => import("@/pages/GetNumber"));
const Recharge = lazy(() => import("@/components/layout/RechargeWrapper"));
const VerifyTransaction = lazy(() => import("@/pages/VerifyTransaction"));
const History = lazy(() => import("@/pages/History"));
const About = lazy(() => import("@/pages/About"));
const CheckOtp = lazy(() => import("@/pages/CheckOtp"));
const EmailVerify = lazy(() => import("@/pages/EmailVerify"));
const VerifyEmail = lazy(() => import("@/pages/VerifyEmail"));

function App() {
  axios.defaults.baseURL = "https://api.paidsms.org/";
  axios.defaults.withCredentials = true;

  const { user, setMaintainance, isGoogleLogin } = useContext(AuthContext);
  const [isMaintenance, setIsMaintenance] = useState(null);  // Default to null to show loading state while fetching

  const fetchMaintenance = async () => {
    try {
      const response = await axios.get("/api/service/maintenance");
      const { maintainance, adminAccess } = response.data;

      if (maintainance && adminAccess) {
        setMaintainance(true);
        setIsMaintenance(false); // Admin can access, disable maintenance block
      } else if (maintainance) {
        setMaintainance(true);
        setIsMaintenance(true); // Block access for regular users
      } else {
        setMaintainance(false);
        setIsMaintenance(false); // Allow access
      }
    } catch (error) {
      console.error("Error fetching maintenance status:", error.message);
      setIsMaintenance(true); // Assume maintenance on error
    }
  };

  useEffect(() => {
    fetchMaintenance();
    const interval = setInterval(fetchMaintenance, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  if (isMaintenance === null) {
    // Return a loading or blank state while fetching the maintenance status
    return <LayoutLoader />;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={<LayoutLoader />}>
        <Routes>
          {/* Render Maintenance page immediately if under maintenance */}
          {isMaintenance ? (
            <>
              <Route path="*" element={<Navigate to="/" />} />
              <Route path="/" element={<Maintenance />} />
            </>
          ) : (
            <>
              {/* Regular routes */}
              <Route path="/" element={<HomeWrapper />} />
              <Route
                path="/change-password"
                element={
                  <ProtectRoute user={user} googleRedirect="/" redirect="/" isGoogleLogin={isGoogleLogin}>
                    <ChangePassword />
                  </ProtectRoute>
                }
              />
              <Route
                path="/api"
                element={<ProtectRoute user={user} redirect="/"><Api_key /></ProtectRoute>}
              />
              <Route
                path="/get-number"
                element={<ProtectRoute user={user} redirect="/"><GetNumber /></ProtectRoute>}
              />
              <Route
                path="/recharge"
                element={<ProtectRoute user={user} redirect="/"><Recharge /></ProtectRoute>}
              />
              <Route
                path="/verify-transaction"
                element={<ProtectRoute user={user} redirect="/"><VerifyTransaction /></ProtectRoute>}
              />
              <Route
                path="/email-verify"
                element={<ProtectRoute user={!user} redirect="/"><EmailVerify /></ProtectRoute>}
              />
              <Route
                path="/verify-email"
                element={<ProtectRoute user={!user} redirect="/"><VerifyEmail /></ProtectRoute>}
              />
              <Route
                path="/history"
                element={<ProtectRoute user={user} redirect="/"><History /></ProtectRoute>}
              />
              <Route
                path="/about"
                element={<ProtectRoute user={user || !user} redirect="/"><About /></ProtectRoute>}
              />
              <Route
                path="/my-orders"
                element={
                  <ProtectRoute user={user} redirect="/">
                    <GetNumber />
                  </ProtectRoute>
                }
              />
              <Route path="/login" element={<ProtectRoute user={!user} redirect="/"><Login /></ProtectRoute>} />
              <Route path="/signup" element={<ProtectRoute user={!user} redirect="/"><SignUp /></ProtectRoute>} />
              <Route path="/check-otp" element={<ProtectRoute user={user} redirect="/"><CheckOtp /></ProtectRoute>} />
              <Route path="*" element={<NotFound />} />
            </>
          )}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
