import { LayoutLoader } from "@/components/layout/Loaders";
import Recharge from "@/pages/Recharge";
import axios from "axios";
import { useEffect, useState } from "react";

const RechargeWrapper = () => {
  const [maintenanceStatusUpi, setMaintenanceStatusUpi] = useState(null);
  const [maintenanceStatusTrx, setMaintenanceStatusTrx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [minUpiAmount, setMinUpiAmount] = useState(null);

  // Fetch maintenance status for UPI
  const fetchMaintenanceStatusUpi = async () => {
    try {
      const response = await axios.get(
        `/api/recharge/admin-api/recharge-data-maintenance/get-recharge-maintenance?rechargeType=upi`
      );
      setMaintenanceStatusUpi(response.data.maintenance);
    } catch (error) {
      console.error("Error fetching maintenance status:", error);
    }
  };

  // Fetch maintenance status for transactions
  const fetchMaintenanceStatusTrx = async () => {
    try {
      const response = await axios.get(
        `/api/recharge/admin-api/recharge-data-maintenance/get-recharge-maintenance?rechargeType=trx`
      );
      setMaintenanceStatusTrx(response.data.maintenance);
    } catch (error) {
      console.error("Error fetching maintenance status:", error);
    }
  };

  // Fetch the minimum UPI amount (only if not already set)
  const fetchMinUpiAmount = async () => {
    if (minUpiAmount === null) {
      try {
        const response = await axios.get("/api/config/admin-api/upi-min-amt/min-upi-amount");
        const { minUpiAmount } = response.data;
        setMinUpiAmount(minUpiAmount); // Set the minimum UPI amount
      } catch (error) {
        console.error("Error fetching min UPI amount:", error);
      }
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true); // Start loader
      await Promise.all([fetchMaintenanceStatusUpi(), fetchMaintenanceStatusTrx()]);

      // Fetch the minimum UPI amount only if UPI is not under maintenance and not already fetched
      if (!maintenanceStatusUpi && minUpiAmount === null) {
        fetchMinUpiAmount();
      }

      // Artificial delay to show the loader before data is ready
      setTimeout(() => {
        setLoading(false); // Stop loader
      }, 1000);
    };

    fetchAllData();
  }, [maintenanceStatusUpi, maintenanceStatusTrx, minUpiAmount]); // Track minUpiAmount to avoid multiple fetches

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-6rem)]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary"></div>
      </div>
    );
  }

  return (
    <Recharge
      maintenanceStatusTrx={maintenanceStatusTrx}
      maintenanceStatusUpi={maintenanceStatusUpi}
      minUpiAmount={minUpiAmount} // Pass min UPI amount to Recharge page
    />
  );
};

export default RechargeWrapper;
