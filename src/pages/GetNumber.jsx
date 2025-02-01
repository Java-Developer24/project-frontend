import React, { useState, useEffect, useContext } from "react"
import AppLayout from "@/components/layout/AppLayout"
import { Button } from "@/components/ui/Button"
import axios from "axios"
import { AuthContext } from "@/utils/AppContext"
import { SnapLoader } from "@/components/layout/Loaders"
import toast from "react-hot-toast"
import PopoverComponent from "@/components/shared/PopoverComponent"
import { Icon } from "@/components/ui/Icons"

const GetNumber = () => {
  const [orders, setOrders] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, apiKey, fetchBalance } = useContext(AuthContext)
  const [buttonStates, setButtonStates] = useState({})
  const [otpError, setOtpError] = useState(false)
  const [loadingCancel, setLoadingCancel] = useState({})
  const [loadingBuyAgain, setLoadingBuyAgain] = useState({})
  const [popoverStates, setPopoverStates] = useState({})

  // Fetch orders and transactions
  const fetchOrdersAndTransactions = async () => {
    try {
      const [ordersResponse, transactionsResponse] = await Promise.all([
        axios.get(`/api/user/admin-api/get-orders-data/orders?userId=${user.userId}`),
        axios.get(`/api/history/transaction-history-user?userId=${user.userId}`),
      ])

      console.log("Fetched Transactions:", transactionsResponse.data) // Log here

      setOrders(ordersResponse.data)
      setTransactions(transactionsResponse.data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching data", error)
      setLoading(false)
    }
  }

  // useEffect(() => {
  //   if (user) {
  //     const fetchOrders = setInterval(() => {
  //       fetchOrdersAndTransactions();
  //     }, 5000); // Poll every 5 seconds
  //     return () => clearInterval(fetchOrders);
  //   }
  // }, [user]);
  useEffect(() => {
    if (user) {
      fetchOrdersAndTransactions()
    }
  }, [user])

  const getOTPFromTransaction = (Id) => {
    const relatedTransactions = transactions.filter((transaction) => transaction.Id === Id)

    if (relatedTransactions.length === 0) {
      return ["Waiting for SMS"]
    }

    const otpList = relatedTransactions.map((transaction) => transaction.otp).filter((otp) => otp !== null)

    return otpList.length > 0 ? otpList : ["Waiting for SMS"]
  }

  const calculateRemainingTime = (expirationTime) => {
    const now = new Date()
    const timeDifference = new Date(expirationTime) - now
    if (timeDifference <= 0) return "00:00"

    const minutes = Math.floor(timeDifference / 60000)
    const seconds = Math.floor((timeDifference % 60000) / 1000)

    return `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  
  const Countdown = ({ expirationTime, orderId, server }) => {
    const [remainingTime, setRemainingTime] = useState(() => calculateRemainingTime(expirationTime));

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
            } else {
              console.log("server",server)
              const threshold = server === 7 ? 7 : 17; // Dynamic threshold
              console.log("threshold",threshold)
              if (parseInt(newRemainingTime.split(":")[0]) <= threshold) {
                setButtonStates((prevStates) => ({
                  ...prevStates,
                  [orderId]: true,
                }));
              }
            }
            return newRemainingTime;
          }
          return prevTime;
        });
      };

      updateRemainingTime(); // Initial call
      const interval = setInterval(updateRemainingTime, 1000);

      return () => clearInterval(interval);
    }, [expirationTime, orderId, server]);

    return <span className="font-mono">{remainingTime}</span>;
};

  const handleOrderExpire = async (orderId) => {
    setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId))
    await fetchBalance(apiKey)
  }

  const handleOrderCancel = async (orderId, Id, server, hasOtp) => {
    // setLoading(true);  // Set loading to true when starting the cancel process
  setLoadingCancel((prev) => ({ ...prev, [Id]: true })) // Isolate loading per order

  try {
    // Make the cancellation request to the backend
    const cancelResponse = await axios.get(`/api/service/number-cancel?api_key=${apiKey}&Id=${Id}`)

    if (cancelResponse.status === 200) {
      // Remove the canceled order from the local state
      setOrders((prevOrders) => prevOrders.filter((order) => order.Id !== orderId))

      // Optionally, re-fetch orders and transactions from the backend to ensure data consistency
      await fetchOrdersAndTransactions()

      // Fetch balance if necessary
      await fetchBalance(apiKey)

      // Show success message
      toast.success(hasOtp ? "Order finished successfully!" : "Number cancelled successfully!")
    } else {
      // Handle error if cancellation failed on backend
      toast.error("Failed to cancel the order. Please try again.")
    }
  } catch (error) {
    // Handle error
    if (error.response) {
      // API responded with an error
      toast.error(error.response.data.status || error.response.data.message)
    } else if (error.request) {
      // Request made but no response received
      toast.error("No response received from the server. Please try again.")
    } else {
      // Other errors during the request setup
      toast.error(`An unexpected error occurred: ${error.message}`)
    }
  } finally {
    // Reset loading state for the order cancel button
    setLoadingCancel((prev) => ({ ...prev, [Id]: false }))
  }
}

  
const handleBuyAgain = async (server, service, orderId) => {
  const servicecode = service
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "")

  setLoadingBuyAgain((prev) => ({ ...prev, [orderId]: true })) // Isolate loading for Buy Again

  try {
    await axios.get(`/api/service/get-number?api_key=${apiKey}&code=${servicecode}&server=${server}`)
    await fetchOrdersAndTransactions() // Fetch orders again after successful buy
    toast.success("Number bought again successfully!")
  } catch (error) {
    if (error.response) {
      // API responded with an error
      toast.error( error.response.data.error)
    } else if (error.request) {
      // Request made but no response received
      toast.error("No response received from the server. Please try again.")
    } else {
      // Other errors during the request setup
      toast.error(`An unexpected error occurred: ${error.message}`)
    }
  } finally {
    setLoadingBuyAgain((prev) => ({ ...prev, [orderId]: false })) // Reset loading state
    fetchBalance(apiKey)
  }
}

 // Helper function to retry the OTP request
const retryRequest = async (fn, retries = 30, delay = 2000) => {
  let lastError
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Try the request
      return await fn()
    } catch (error) {
      lastError = error
      console.log(`Attempt ${attempt} failed. Retrying...`)
      // Wait for the specified delay before retrying
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
}

const handleGetOtp = async (orders) => {
  try {
    const updatedTransactions = [] // Store updated transactions

    // Retry fetching OTP for each order
    for (const order of orders) {
      const { Id } = order // Use 'Id' here
      const otpRequest = () => axios.get(`/api/service/get-otp?api_key=${apiKey}&Id=${Id}`) // OTP request function

      // Retry OTP request 3 times, with a 2-second delay between attempts
      const response = await retryRequest(otpRequest, 3, 2000)

      // Assuming your backend returns updated transaction data for the specific number
      if (response.data && response.data.length > 0) {
        updatedTransactions.push(...response.data)
      }
    }

    // Fetch the latest transactions
    const transactionsResponse = await axios.get(`/api/history/transaction-history-user?userId=${user.userId}`)
    setTransactions(transactionsResponse.data)
    setOtpError(false)
  } catch (error) {
    console.error("Error fetching OTP", error)
    setOtpError(true)
    // toast.error("Failed to fetch OTP after multiple attempts. Please try again later.")
  }
}
  useEffect(() => {
    let interval

    if (!otpError) {
      interval = setInterval(() => {
        handleGetOtp(orders)
      }, 5000)
    }
    console.log(orders)
    return () => clearInterval(interval)
  }, [orders, otpError]) // Depend on otpError to manage the interval

  const handleCopy = (number, orderId) => {
    setPopoverStates((prev) => ({ ...prev, [orderId]: true }))
    navigator.clipboard.writeText(number)
    setTimeout(() => {
      setPopoverStates((prev) => ({ ...prev, [orderId]: false }))
    }, 2000)
  }

  return (
    <div className="h-[calc(100dvh-4rem)] overflow-y-auto hide-scrollbar">
      { loading ? (
        <div className="w-full flex h-full justify-center items-center">
        <div className="flex items-center justify-center h-[calc(100dvh-6rem)]">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary"></div>
  </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="h-[calc(100dvh-4rem)]  flex items-center justify-center relative">
          <h1 className="text-[28px] lg:text-[55px] leading-[30px] lg:leading-[55px] font-[600] lg:font-[500] text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <span className="text-primary">No</span> Active Orders
          </h1>
        </div>
      ) : (
        orders.map((order) => {
          const hasOtp = getOTPFromTransaction(order.Id).some((otp) => otp !== "Waiting for SMS")

               // Get the current time and the order's creation time
 
          
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
                  <hr className="border-[#888888] border w-full" />
                  <div className="w-full flex text-center items-center justify-between">
                    <p>Otp type:</p>
                    <span>{order.otpType.split(" ")[0]}</span>
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
                  onClick={() => handleCopy(order.number, order.Id)}
                >
                  <Icon.copy className="w-4 h-4" />
                </Button>
              }
              popoverContent="Copied!"
              open={popoverStates[order.Id] || false}
              setOpen={(isOpen) =>
                setPopoverStates((prev) => ({
                  ...prev,
                  [order.Id]: isOpen,
                }))
              }
                    />
                  </p>
                </div>
                <div className="w-full flex rounded-2xl items-center justify-center h-[60px]">
                  <div className="bg-transparent max-w-56 py-4 px-5 flex w-full items-center justify-between rounded-lg">
                    <p className="font-normal">Remaining Time</p>
                    <Countdown expirationTime={order.expirationTime} orderId={order._id} server={order.server} />
                  </div>
                </div>
                <div className="w-full flex bg-[#444444] border-2 border-[#888888] rounded-2xl items-center justify-center max-h-[100px] overflow-y-scroll hide-scrollbar">
                  <div className="w-full h-full flex flex-col items-center">
                    {getOTPFromTransaction(order.Id).map((otp, index, arr) => (
                      <React.Fragment key={index}>
                        <div className="bg-transparent py-4 px-5 flex w-full items-center justify-center">
                          <h3 className="font-normal text-sm">{otp}</h3>
                        </div>
                        {index < arr.length - 1 && <hr className="border-[#888888] border w-full" />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="w-full flex rounded-2xl items-center justify-center mb-2">
                  <div className="bg-transparent pt-4 flex w-full items-center justify-center gap-4">
                  <Button
  className="py-2 px-9 rounded-full border-2 border-primary font-normal bg-primary text-white hover:bg-teal-600 transition-colors duration-200 ease-in-out"
  onClick={() => handleOrderCancel(order._id, order.Id, order.server, hasOtp)}
  isLoading={loadingCancel[order.Id]} 
 
  disabled={loadingCancel[order.number] || (!buttonStates[order._id] && !hasOtp)} 
>
  {hasOtp ? "Finish" : "Cancel"}
</Button>

                    <Button
  className="py-2 px-6 rounded-full border-2 border-primary font-normal bg-transparent text-primary hover:bg-primary hover:text-white transition-colors duration-200 ease-in-out"
  onClick={() => handleBuyAgain(order.server, order.service, order.Id, order.otpType)}
  isLoading={loadingBuyAgain[order.Id]} 
  
>
  Buy Again
</Button>
                  </div>
                </div>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}

export default AppLayout()(GetNumber)

