import AppLayout from "@/components/layout/AppLayout";
import { Button, buttonVariants } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icons";
import UpiIcon from "../assets/upi.svg?react";
import { Label } from "@/components/ui/Label";
import { Input } from "@/components/ui/Input";
import { useContext, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useInputValidation } from "6pp";
import { amountValidator, trxAmountValidator } from "@/utils/validators";
import axios from "axios";
import toast from "react-hot-toast";
import { AuthContext } from "@/utils/AppContext";
import PopoverComponent from "@/components/shared/PopoverComponent";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/AlertDialog";

const Recharge = ({ maintenanceStatusTrx, maintenanceStatusUpi }) => {
  const [isUpi, setIsUpi] = useState(true);
  const amount = useInputValidation("", amountValidator);
  const trxamount = useInputValidation("", trxAmountValidator);
  const trxTransactionId = useInputValidation("");
  const [transactionOk, setTransactionOk] = useState(false);
  const [trxTransactionOk, setTrxTransactionOk] = useState(false);
  const transactionId = useInputValidation("");
  const [exchangeRate, setExchangeRate] = useState("");
  const [isloading, setIsloading] = useState(false);
  const { user, fetchBalance, apiKey } = useContext(AuthContext);
  const [QRImage, setQRImage] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(true);
  const [open, setOpen] = useState(false);
  const [minUpiAmount,setMinUpiAmount ]=useState("")
  
  useEffect(() => {
    const fetchMinUpiAmount = async () => {
      try {
        const response = await axios.get("/api/config/min-upi-amount"); // Backend endpoint to get the current min UPI amount
        const { minUpiAmount } = response.data;
        setMinUpiAmount(minUpiAmount); // Store the min amount in state
      } catch (error) {
        toast.error("Failed to fetch minimum UPI amount.");
        console.error("Error fetching min UPI amount:", error);
      }
    };
  
    fetchMinUpiAmount();
  }, []);
  
  
  console.log(apiKey)
  const fetchExchangeRate = async () => {
    try {
      const response = await axios.get("/api/recharge/exchange-rate");
      const data = await response.data;
      setExchangeRate(data.price);
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
    }
  };
  const fetchQrImage = async (amount) => {
    try {
      const response = await axios.post("/api/recharge/generate-qr", { amount });
      return response.data.qrCode; // Returning the QR code
    } catch (error) {
      throw new Error("Error fetching QR code: " + error.message);
    }
  };
  
 
  useEffect(() => {
    if (maintenanceStatusUpi) {
      setIsUpi(false);
    }
  }, [maintenanceStatusUpi]);

  useEffect(() => {
   
    fetchExchangeRate();
  }, [transactionOk, trxTransactionOk]);

  
  
  
  const handleToggleUpi = async () => {
    if (!amount.value || amount.error) {
      toast.error("Please enter a valid amount.");
      return;
    }
  
    try {
      const qrCode = await fetchQrImage(amount.value);
      setQRImage(qrCode);
      setTransactionOk(true);
    } catch (error) {
      toast.error(error.message || "Failed to generate QR code. Please try again.");
    }
  };
  
  useEffect(() => {
    if (transactionOk || trxTransactionOk) {
      fetchExchangeRate();
      fetchQrImage(amount.value).then(qrCode => setQRImage(qrCode));
    }
  }, [transactionOk, trxTransactionOk]);
  
  const handleToggleTrx = () => {
    if (!trxamount.value || trxamount.error) {
      toast.error("Please enter a valid amount.");
      return;
    }
    setTrxTransactionOk(true);
  };

  const handleUpiSubmit = async (e) => {
    e.preventDefault();
  
    if (!transactionId.value) {
      toast.error("Please enter a valid transaction ID.");
      return;
    }
  
    setIsloading(true);
    
    // Create a new promise that resolves/rejects based on the API response
    const rechargePromise = new Promise(async (resolve, reject) => {
      try {
        // Send a POST request with the necessary data
        const response = await axios.post("/api/recharge/upi", {
          transactionId: transactionId.value,
          userId: user.userId, // Extracted from context or state
          email: user.email,   // Extracted from context or state
          amount,              // Amount entered by the user
        });
  
        // Resolve the promise if the recharge was successful
        toast.success(
          response?.data?.message || "Recharge was successful. Thank you!",
          {
            autoClose: 5000, // Set duration to 3 seconds
          }
        );
        resolve(response); // Resolve the promise after success
      } catch (error) {
        // Reject the promise if there was an error
        const errorMessage =
          error.response?.data?.message || "Failed to process recharge.";
        toast.error(errorMessage);
        reject(error); // Reject the promise in case of error
      } finally {
        setIsloading(false);
      }
    });
  
    // Now the rechargePromise is resolved or rejected, you can safely chain the `.then`
   rechargePromise.then(async (response) => {
      console.log('Fetching balance with API key:', apiKey);
      await fetchBalance(apiKey); // Ensure this works as expected
      handleCancel();
      return response;
    });
  
    // await toast.promise(enhancedRechargePromise, {
    //   loading: "Checking Transaction...",
    //   success: (r) => r.data.message,
    //   // error: (error) => {
    //   //   const errorMessage =
    //   //     error.response?.data?.error ||
    //   //     "Invalid Transaction Id. Please try again.";
    //   //   return errorMessage;
    //   // },
    // });
  };
  

  const handleTrxSubmit = async (e) => {
    e.preventDefault();

    if (!trxTransactionId.value) {
      toast.error("Please enter a valid transaction ID.");
      return;
    }
    setIsloading(true);
    const rechargePromise = new Promise((resolve, reject) => {
      const rechargeRequest = async () => {
        try {
          const response = await axios.get(
           `/api/recharge/trx?transactionHash=${trxTransactionId.value}&userId=${user.userId}&email=${user.email}`
          );

          resolve(response);
        } catch (error) {
          reject(error);
        } finally {
          setIsloading(false);
        }
      };

      rechargeRequest();
    });

    await toast.promise(rechargePromise, {
      loading: "Checking Transaction...",
      success: (r) => {
        fetchBalance(apiKey);
        handleCancel();
        return r.data.message;
      },
      error: (error) => {
        const errorMessage =
          error.response?.data?.error ||
          "Invalid Transaction Id. Please try again.";
        return errorMessage;
      },
    });
  };

  const handleCancel = () => {
    setTransactionOk(false);
    setTrxTransactionOk(false);
    amount.clear();
    trxamount.clear();
    transactionId.clear();
    trxTransactionId.clear();
  };

  const handleCopy = () => {
    setOpen(true);
    navigator.clipboard.writeText(user.trxAddress);
  };

  return (
    <div className="h-[calc(100dvh-6rem)] overflow-hidden flex flex-col overflow-y-auto w-full items-center justify-center">
      <div className="flex overflow-hidden w-[500px]">
        <h1 className="animate-h1">
          {maintenanceStatusUpi && maintenanceStatusTrx
            ? "Both UPI and TRX payment methods are under maintenance."
            : maintenanceStatusUpi
            ? "UPI payment method is under maintenance."
            : maintenanceStatusTrx
            ? "TRX payment method is under maintenance."
            : null}
        </h1>
        <h1 className="animate-h1 !hidden" aria-hidden="true">
          {maintenanceStatusUpi && maintenanceStatusTrx
            ? "Both UPI and TRX payment methods are under maintenance."
            : maintenanceStatusUpi
            ? "UPI payment method is under maintenance."
            : maintenanceStatusTrx
            ? "TRX payment method is under maintenance."
            : null}
        </h1>
      </div>
      <div className="w-full flex justify-center my-10">
        <div
          className={cn(
            "w-full max-w-[720px] flex flex-col items-center rounded-2xl p-5 md:p-8",
            { "bg-[#121315]": !(maintenanceStatusTrx && maintenanceStatusUpi) }
          )}
        >
          {!(maintenanceStatusTrx && maintenanceStatusUpi) ? (
            <div className="w-full flex rounded-2xl items-center mb-3">
              <h3 className="font-medium text-[18px] lg:text-[25px]">
                Make a Payment
              </h3>
            </div>
          ) : null}
          {!transactionOk &&
          !trxTransactionOk &&
          !(maintenanceStatusUpi && maintenanceStatusTrx) ? (
            <>
              <div className="w-full flex flex-col lg:flex-row items-center justify-between lg:space-x-5">
                <div className="w-full lg:w-auto">
                  <p className="font-normal text-sm mb-3 text-[#A5A5A5]">
                    Select payment method
                  </p>

                  <div className="w-full flex flex-col gap-4 mb-2">
                    <div className="flex w-full lg:w-auto gap-5 p-2">
                      {!maintenanceStatusTrx && (
                        <Button
                          className={cn(
                            "flex-1 h-[50px] md:w-[160px] border-none rounded-[8px] font-normal bg-[#ff0b0b] hover:bg-red-600 transition-colors duration-200 ease-in-out p-4",
                            { "outline outline-offset-4 outline-2": !isUpi }
                          )}
                          onClick={() => setIsUpi(false)}
                        >
                          <Icon.trx className="w-6 h-6" />
                        </Button>
                      )}
                      {!maintenanceStatusUpi && (
                        <Button
                          className={cn(
                            "flex-1 h-[50px] md:w-[160px] border-none rounded-[8px] font-normal bg-white hover:bg-gray-100 transition-colors duration-200 ease-in-out",
                            { "outline outline-offset-4 outline-2": isUpi }
                          )}
                          onClick={() => setIsUpi(true)}
                        >
                          <UpiIcon />
                        </Button>
                      )}
                    </div>
                    <h3 className="font-medium text-[18px] lg:text-[25px] lg:hidden">
                      Pay through{" "}
                      {isUpi && !maintenanceStatusUpi ? "UPI" : "tron/trx"}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="w-full">
                <h3 className="font-medium text-[18px] lg:text-[25px] hidden lg:block">
                  Pay through{" "}
                  {isUpi && !maintenanceStatusUpi ? "UPI" : "tron/trx"}
                </h3>
              </div>
            </>
          ) : null}
          {isUpi && !maintenanceStatusUpi ? (
            !transactionOk ? (
              <>
                <div className="w-full mb-2">
                  <Label
                    htmlFor="amount"
                    className="block text-sm text-[#9d9d9d] font-normal py-2"
                  >
                     Amount (Min: ₹{minUpiAmount}) {/* Displaying the minimum UPI amount */}
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder={`Minimum ${minUpiAmount || '...'} UPI Amount`} 
                    className="w-full h-12 pl-3 rounded-lg no-arrows text-[#9d9d9d] !placeholder-[#9d9d9d] bg-transparent border-[#e0effe] focus:border-none"
                    required
                    value={amount.value}
                    onChange={amount.changeHandler}
                  />
                  {amount.error && (
                    <span className="text-red-500 text-xs">{amount.error}</span>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={handleToggleUpi}
                  variant="login"
                  className="w-32 text-sm font-normal"
                >
                  Submit
                </Button>
              </>
            ) : (
              <>
                {QRImage && ( // Conditionally render the QR image
                  <div className="w-full lg:w-auto mt-4 lg:mt-0 lg:ml-4 flex justify-center lg:justify-start">
                    <img
                      src={QRImage}
                      alt="UPI QR Code"
                      className="w-[150px]"
                    />
                  </div>
                )}
                <div className="w-full mt-2">
                  <Label
                    htmlFor="transaction-id"
                    className="block text-sm text-[#9d9d9d] font-normal py-2"
                  >
                    Enter transaction/utr id
                  </Label>
                  <Input
                    id="transaction-id"
                    type="text"
                    placeholder="Enter transaction/utr id"
                    className="w-full h-12 pl-3 rounded-lg text-[#9d9d9d] !placeholder-[#9d9d9d] bg-transparent border-[#e0effe] focus:border-none"
                    required
                    value={transactionId.value}
                    onChange={transactionId.changeHandler}
                  />
                </div>
                <div className="w-full flex gap-2 rounded-2xl items-center justify-center mt-4">
                  <Button
                    type="button"
                    onClick={handleUpiSubmit}
                    isLoading={isloading}
                    variant="login"
                    className="w-32 text-sm font-normal"
                  >
                    Submit
                  </Button>
                  <Button
                    type="button"
                    variant="cancel"
                    onClick={handleCancel}
                    disabled={isloading}
                    className="w-32 text-sm font-normal"
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )
          ) : null}
          {!isUpi && !maintenanceStatusTrx ? (
            !trxTransactionOk ? (
              <>
                <div className="w-full mb-2">
                  <Label
                    htmlFor="amount-trx"
                    className="block text-sm text-[#9d9d9d] font-normal py-2"
                  >
                    Amount
                  </Label>
                  <Input
                    id="amount-trx"
                    type="number"
                    placeholder="Minimum 1 trx.."
                    className="w-full h-12 pl-3 rounded-lg no-arrows text-[#9d9d9d] !placeholder-[#9d9d9d] bg-transparent border-[#e0effe] focus:border-none"
                    required
                    value={trxamount.value}
                    onChange={trxamount.changeHandler}
                  />
                  {trxamount.error && (
                    <span className="text-red-500 text-xs">
                      {trxamount.error}
                    </span>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={handleToggleTrx}
                  variant="login"
                  className="w-32 text-sm font-normal"
                >
                  Submit
                </Button>
              </>
            ) : (
              <div className="w-full mt-2">
                <div className="flex  w-full items-center md:gap-4 text-sm text-[#9d9d9d] font-normal pt-2">
                  <p>Exchange Rate:</p>
                  <span className="flex p-2 text-[#9d9d9d] ">
                    {exchangeRate || 0}₹
                  </span>
                </div>
                <div className="flex  w-full items-center gap-6 md:gap-10 text-sm text-[#9d9d9d] font-normal">
                  <p>Trx Amount:</p>
                  <span className="flex p-2 text-[#9d9d9d] ">
                    {trxamount.value || 0}
                  </span>
                </div>
                <div className="flex flex-col w-full md:flex-row md:items-center gap-2 md:gap-12 text-sm text-[#9d9d9d] font-normal py-2">
                  <p>Trx Address:</p>
                  <div className="flex items-center gap-4">
                    <span className="flex p-2 bg-transparent border rounded-lg text-[#9d9d9d] overflow-scroll whitespace-nowrap hide-scrollbar">
                      {user.trxAddress}
                    </span>

                    <PopoverComponent
                      buttonComponent={
                        <Button
                          variant="link"
                          className="p-0 h-0"
                          onClick={handleCopy}
                        >
                          <Icon.copy className="w-5 h-5" />
                        </Button>
                      }
                      open={open}
                      setOpen={setOpen}
                      popoverContent="Copied!"
                    />
                  </div>
                </div>
                <Label
                  htmlFor="transaction-id-trx"
                  className="block text-sm text-[#9d9d9d] font-normal py-2"
                >
                  Enter Transaction ID/Hash
                </Label>
                <Input
                  id="transaction-id-trx"
                  type="text"
                  placeholder="Enter Transaction ID/Hash"
                  className="w-full h-12 pl-3 rounded-lg text-[#9d9d9d] !placeholder-[#9d9d9d] bg-transparent border-[#e0effe] focus:border-none"
                  required
                  value={trxTransactionId.value}
                  onChange={trxTransactionId.changeHandler}
                />
                <div className="w-full flex gap-2 rounded-2xl items-center justify-center mt-4">
                  <Button
                    type="button"
                    onClick={handleTrxSubmit}
                    isLoading={isloading}
                    variant="login"
                    className="w-32 text-sm font-normal"
                  >
                    Submit
                  </Button>
                  <Button
                    type="button"
                    variant="cancel"
                    onClick={handleCancel}
                    disabled={isloading}
                    className="w-32 text-sm font-normal"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )
          ) : null}
        </div>
      </div>
      {confirmDialog && !maintenanceStatusUpi && (
        <AlertDialog open>
          <AlertDialogContent className="dark border-[#1b1d21] bg-[#121315] border-2">
            <AlertDialogHeader>
              <AlertDialogTitle></AlertDialogTitle>
              <AlertDialogDescription className="text-white">
                Minimum amount is ₹{minUpiAmount}, Otherwise no refund.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => setConfirmDialog(false)}
                className="focus:outline-none border border-white"
              >
                ok
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default AppLayout()(Recharge);