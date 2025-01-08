import React, { useState, useEffect, useContext } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import axios from "axios";
import { AuthContext } from "@/utils/AppContext";
import { SnapLoader } from "@/components/layout/Loaders";
import toast from "react-hot-toast";
import PopoverComponent from "@/components/shared/PopoverComponent";
import { Icon } from "@/components/ui/Icons";

const GetNumber = () => {
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, apiKey, fetchBalance } = useContext(AuthContext);
  const [buttonStates, setButtonStates] = useState({});
  const [otpError, setOtpError] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState({});
  const [loadingBuyAgain, setLoadingBuyAgain] = useState({});
  const [popoverStates, setPopoverStates] = useState({});

  // Fetch orders and transactions
  const fetchOrdersAndTransactions = async () => {
    try {
      const [ordersResponse, transactionsResponse] = await Promise.all([
        axios.get(`/api/user/orders?userId=${user.userId}`),
        axios.get(`/api/history/transaction-history-user?userId=${user.userId}`),
      ]);
  
      console.log('Fetched Transactions:', transactionsResponse.data); // Log here
  
      setOrders(ordersResponse.data);
      setTransactions(transactionsResponse.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data", error);
      setLoading(false);
    }
  };
  

  useEffect(() => {
    if (user) {
      fetchOrdersAndTransactions();
    }
  }, [user]);



  const getOTPFromTransaction = (number) => { // Use 'number' here
        console.log('Fetching OTP for number:', number);
        const relatedTransactions = transactions.filter(
            (transaction) => transaction.number === number // Compare numbers
        );
        console.log('Related Transactions:', relatedTransactions);

        if (relatedTransactions.length === 0) {
            return ["Waiting for SMS"];
        }

        const otpList = relatedTransactions
            .map((transaction) => transaction.otps)
            .filter((otps) => otps && otps.length > 0);

        if (otpList.length === 0) {
            return ["Waiting for SMS"];
        }

        return otpList.flatMap((otpArray) => otpArray.map((otp) => otp.message));
    };
  

  

  const calculateRemainingTime = (expirationTime) => {
    const now = new Date();
    const timeDifference = new Date(expirationTime) - now;
    if (timeDifference <= 0) return "00:00";

    const minutes = Math.floor(timeDifference / 60000);
    const seconds = Math.floor((timeDifference % 60000) / 1000);

    return `${minutes < 10 ? "0" : ""}${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}`;
  };

  const Countdown = ({ expirationTime, orderId }) => {
    const [remainingTime, setRemainingTime] = useState(() =>
      calculateRemainingTime(expirationTime)
    );

    useEffect(() => {
      const updateRemainingTime = () => {
        const newRemainingTime = calculateRemainingTime(expirationTime);
        setRemainingTime((prevTime) => {
          if (prevTime !== newRemainingTime) {
            if (newRemainingTime === "00:00") {
              setButtonStates((prevStates) => ({
                ...prevStates,
                [orderId]: true,
              }));
              handleOrderExpire(orderId);
            } else if (newRemainingTime.split(":")[0] <= "18") {
              setButtonStates((prevStates) => ({
                ...prevStates,
                [orderId]: true,
              }));
            }
            return newRemainingTime;
          }
          return prevTime;
        });
      };

      updateRemainingTime(); // Initial call
      const interval = setInterval(updateRemainingTime, 1000);

      return () => clearInterval(interval);
    }, [expirationTime, orderId]);

    return <span className="font-mono">{remainingTime}</span>;
  };
  const handleOrderExpire = async (orderId) => {
    setOrders((prevOrders) =>
      prevOrders.filter((order) => order._id !== orderId)
    );
    await fetchBalance(apiKey);
  };

  const handleOrderCancel = async (orderId, numberId, server, hasOtp) => {
    setLoadingCancel((prev) => ({ ...prev, [orderId]: true }));

    const orderCancelPromise = new Promise((resolve, reject) => {
      const orderCancelRequest = async () => {
        try {
          await axios.get(
            `/api/service/number-cancel?api_key=${apiKey}&id=${numberId}&server=${server}`
          );
          resolve();
        } catch (error) {
          reject(error);
        } finally {
          fetchBalance(apiKey);
          handleOrderExpire(orderId);
          setLoadingCancel((prev) => ({ ...prev, [orderId]: false }));
        }
      };

      orderCancelRequest();
    });

    await toast.promise(orderCancelPromise, {
      loading: hasOtp ? "Finishing Order..." : "Cancelling Number...",
      success: () => {
        return hasOtp
          ? "Order finished successfully!"
          : "Number cancelled successfully!";
      },
      error: (error) => {
        const errorMessage =
          error.response?.data?.error || "Error cancelling the Number!";
        return errorMessage;
      },
    });
  };

  const handleBuyAgain = async (server, service, orderId,otpType) => {
    const servicecode = service
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "");

    setLoadingBuyAgain((prev) => ({ ...prev, [orderId]: true }));
    const buyAgainPromise = new Promise((resolve, reject) => {
      const buyAgainRequest = async () => {
        try {
          await axios.get(
            `/api/service/get-number?api_key=${apiKey}&servicecode=${servicecode}&server=${server}&otpType=${otpType}`
          );

          await fetchOrdersAndTransactions();

          resolve();
        } catch (error) {
          reject(error);
        } finally {
          fetchBalance(apiKey);
          setLoadingBuyAgain((prev) => ({ ...prev, [orderId]: false }));
        }
      };

      buyAgainRequest();
    });

    await toast.promise(buyAgainPromise, {
      loading: "Buying Again...",
      success: () => {
        return "Number bought again successfully!";
      },
      error: (error) => {
        console.error("Error buying the number again", error);
        const errorMessage = error.response?.data?.error || "Please try again.";
        return errorMessage;
      },
    });
  };

  const handleGetOtp = async (orders) => {
    try {
        const updatedTransactions = []; // Store updated transactions

        for (const order of orders) {
            const { server, requestId } = order; // Use 'number' here
            const response = await axios.get(
                `/api/service/get-otp?api_key=${apiKey}&server=${server}&requestId=${requestId}` // Use 'number' here
            );

            // Assuming your backend returns updated transaction data for the specific number
            if (response.data && response.data.length > 0) {
              updatedTransactions.push(...response.data);
            }
        }

        // Fetch the latest transactions
        const transactionsResponse = await axios.get(
            `/api/history/transaction-history-user?userId=${user.userId}`
        );
        setTransactions(transactionsResponse.data);
        setOtpError(false);
    } catch (error) {
        console.error("Error fetching OTP", error);
        setOtpError(true);
    }
};
  
  useEffect(() => {
    let interval;

    if (!otpError) {
      interval = setInterval(() => {
        handleGetOtp(orders);
      }, 5000);
    }
console.log(orders)
    return () => clearInterval(interval);
  }, [orders, otpError]); // Depend on otpError to manage the interval

  const handleCopy = (number, orderId) => {
    setPopoverStates((prev) => ({ ...prev, [orderId]: true }));
    navigator.clipboard.writeText(number);
  };

  return (
    <div className="h-[calc(100dvh-4rem)] overflow-y-auto hide-scrollbar">
      {loading ? (
        <div className="w-full flex h-full justify-center items-center">
          <SnapLoader />
        </div>
      ) : orders.length === 0 ? (
        <div className="h-[calc(100dvh-4rem)]  flex items-center justify-center relative">
          <h1 className="text-[28px] lg:text-[55px] leading-[30px] lg:leading-[55px] font-[600] lg:font-[500] text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <span className="text-primary">No</span> Active Orders
          </h1>
        </div>
      ) : (
        orders.map((order) => {
          const otps = getOTPFromTransaction(order.numberId); // Get the OTPs for the order
          const hasOtp = otps.some((otp) => otp !== "Waiting for SMS"
          );

          return (
            <div className="w-full flex justify-center my-12" key={order._id}>
              <div className="w-full max-w-[520px] flex flex-col items-center border-2 border-[#1b1d21] bg-[#121315] rounded-2xl p-5">
                <div className="w-full flex flex-col items-center px-4 mb-4 text-sm font-normal gap-y-2">
                  <div className="w-full flex text-center items-center justify-between">
                    <p>Service:</p>
                    <span> {order.service}</span>
                  </div>
                  <hr className="border-[#888888] border w-full" />
                  <div className="w-full flex text-center items-center justify-between">
                    <p>Server:</p>
                    <span> {order.server}</span>
                  </div>
                  <hr className="border-[#888888] border w-full" />
                  <div className="w-full flex text-center items-center justify-between">
                    <p>Price:</p>
                    <span> ₹{order.price}</span>
                  </div>
                </div>

                <div className="w-full flex border rounded-2xl items-center justify-center h-[45px]">
                  <p className="py-4 px-5 flex w-full gap-4 items-center justify-center rounded-lg text-xl font-medium">
                    <span>+91&nbsp;{order.number}</span>
                    <PopoverComponent
                      buttonComponent={
                        <Button
                          variant="link"
                          className="p-0 h-0"
                          onClick={() => handleCopy(order.number, order._id)}
                        >
                          <Icon.copy className="w-4 h-4" />
                        </Button>
                      }
                      popoverContent="Copied!"
                      open={popoverStates[order._id] || false}
                      setOpen={(isOpen) =>
                        setPopoverStates((prev) => ({
                          ...prev,
                          [order._id]: isOpen,
                        }))
                      }
                    />
                  </p>
                </div>
                <div className="w-full flex rounded-2xl items-center justify-center h-[60px]">
                  <div className="bg-transparent max-w-56 py-4 px-5 flex w-full items-center justify-between rounded-lg">
                    <p className="font-normal">Remaining Time</p>
                    <Countdown
                      expirationTime={order.expirationTime}
                      orderId={order._id}
                    />
                  </div>
                </div>
                <div className="w-full flex bg-[#444444] border-2 border-[#888888] rounded-2xl items-center justify-center max-h-[100px] overflow-y-scroll hide-scrollbar">
                  <div className="w-full h-full flex flex-col items-center">
                    {otps.map((otpMessage, index) => (
                      <React.Fragment key={index}>
                        <div className="bg-transparent py-4 px-5 flex w-full items-center justify-center">
                          <h3 className="font-normal text-sm">{otpMessage}</h3>
                        </div>
                        {index < otps.length - 1 && <hr className="border-[#888888] border w-full" />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="w-full flex rounded-2xl items-center justify-center mb-2">
                  <div className="bg-transparent pt-4 flex w-full items-center justify-center gap-4">
                    <Button
                      className="py-2 px-9 rounded-full border-2 border-primary font-normal bg-primary text-white hover:bg-teal-600 transition-colors duration-200 ease-in-out"
                      onClick={() =>
                        handleOrderCancel(
                          order._id,
                          order.numberId,
                          order.server,
                          hasOtp
                        )
                      }
                      isLoading={loadingCancel[order._id]}
                      disabled={
                        loadingCancel[order._id] ||
                        (!buttonStates[order._id] && !hasOtp)
                      }
                    >
                      {hasOtp ? "Finish" : "Cancel"}
                    </Button>
                    <Button
                      className="py-2 px-6 rounded-full border-2 border-primary font-normal bg-transparent text-primary hover:bg-primary hover:text-white transition-colors duration-200 ease-in-out"
                      onClick={() =>
                        handleBuyAgain(order.server, order.service, order._id,order.otpType)
                      }
                      isLoading={loadingBuyAgain[order._id]}
                    >
                      Buy Again
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default AppLayout()(GetNumber);
