import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { AuthContext } from "@/utils/AppContext";
import {
  RechargeTabelMob,
  RechargeTable,
} from "@/components/shared/RechargeTable";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import moment from "moment";

const History = () => {
  const [selectedTabs, setSelectedTabs] = useState(true); // true for recharge, false for transaction
  const [rechargeHistory, setRechargeHistory] = useState([]);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true); // State to track loading
 
  const userId = user.userId;
  
 

  // State for pagination
  const [rechargeLimit, setRechargeLimit] = useState(10);
  const [rechargeCurrentPage, setRechargeCurrentPage] = useState(1);
  const [transactionLimit, setTransactionLimit] = useState(10);
  const [transactionCurrentPage, setTransactionCurrentPage] = useState(1);

  const [tranFilter, setTranFilter] = useState("All");
  const token = localStorage.getItem("paidsms-token");


  
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true); // Start loading
      try {
        const [rechargeResponse, transactionResponse] = await Promise.all([
          axios.get(`/api/history/recharge-history?userId=${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
          axios.get(`/api/history/transaction-history?userId=${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
        ]);
  
        setRechargeHistory(rechargeResponse.data.data || []); // Ensure it's an array
        setTransactionHistory(transactionResponse.data.data || []); // Ensure it's an array
      } catch (error) {
        toast.error("Failed to fetch history data");
      }finally {
        setIsLoading(false); // Stop loading
      }
    };
  
    if (userId) {
      fetchHistory(); // Call fetchHistory only when userId is defined
    }
  }, [userId]);
  
  // Filter and group transaction history data
  const filterTransactionHistory = (data) => {
    if (!Array.isArray(data)) {
      return [];
    }

    const groupedData = data.reduce((acc, entry) => {
      if (!acc[entry._id]) {
        acc[entry.id] = [];
      }
      acc[entry.id].push(entry);
      return acc;
    }, {});

    const preparedData = Object.values(groupedData).map((entries) => {
      const finishedEntries = entries.filter(
        (entry) => entry.status === "Success"
      );
      const cancelledEntries = entries.filter(
        (entry) => entry.status === "Cancelled"
      );

      const displayEntry =
        cancelledEntries.length > 0
          ? cancelledEntries[0]
          : finishedEntries.find((entry) => entry.otps && entry.otps.length > 0) ||
          finishedEntries[0];

      return {
        ...displayEntry,
        otps:
  finishedEntries
    .filter((entry) => entry.otps && entry.otps.length > 0)  // Make sure otps is non-empty
    .map((entry) => entry.otps[0].message)  // Assuming you want the OTP message
    .join(`<br><br>`) || "-",

      };
    });

    return preparedData;
  };

  let filteredTransactionHistory = filterTransactionHistory(transactionHistory);

  if (tranFilter === "Success") {
    filteredTransactionHistory = filteredTransactionHistory.filter(
      (entry) => entry.status === "Success"
    );
  } else if (tranFilter === "Cancelled") {
    filteredTransactionHistory = filteredTransactionHistory.filter(
      (entry) => entry.status === "Cancelled"
    );
  }

  // // Sort transactions by date and time
  const sortedFilteredTransactionHistory = filteredTransactionHistory.sort((a, b) =>
    moment(b.date).isBefore(moment(a.date)) ? 1 : -1
  );
  
  
  // Pagination handlers for Recharge History
  const handleRechargeLimitChange = (value) => {
    setRechargeLimit(Number(value));
    setRechargeCurrentPage(1); // Reset to the first page when limit changes
  };

  const handleRechargeNextPage = () => {
    if (rechargeCurrentPage * rechargeLimit < rechargeHistory.length) {
      setRechargeCurrentPage(rechargeCurrentPage + 1);
    }
  };

  const handleRechargePrevPage = () => {
    if (rechargeCurrentPage > 1) {
      setRechargeCurrentPage(rechargeCurrentPage - 1);
    }
  };

  // Pagination handlers for Transaction History
  const handleTransactionLimitChange = (value) => {
    setTransactionLimit(Number(value));
    setTransactionCurrentPage(1); // Reset to the first page when limit changes
  };

  const handleTransactionNextPage = () => {
    if (
      transactionCurrentPage * transactionLimit <
      sortedFilteredTransactionHistory.length
    ) {
      setTransactionCurrentPage(transactionCurrentPage + 1);
    }
  };

  const handleTransactionPrevPage = () => {
    if (transactionCurrentPage > 1) {
      setTransactionCurrentPage(transactionCurrentPage - 1);
    }
  };

  // Slice data for current page
  const startIndexRecharge = (rechargeCurrentPage - 1) * rechargeLimit;
  const startIndexTransaction = (transactionCurrentPage - 1) * transactionLimit;

  const rechargeData = Array.isArray(rechargeHistory)
    ? rechargeHistory.slice(
        startIndexRecharge,
        startIndexRecharge + rechargeLimit
      )
    : [];
  const transactionData = Array.isArray(sortedFilteredTransactionHistory)
    ? sortedFilteredTransactionHistory.slice(
        startIndexTransaction,
        startIndexTransaction + transactionLimit
      )
    : [];

  const filteredData = selectedTabs ? rechargeData : transactionData;


  const getDateRange = (data) => {
    if (data.length === 0) return "No data available";
    
    const dates = data.map((entry) => {
      const date = entry.date || entry.date_time; // Either date or date_time
      
      // Check if the date is in ISO 8601 format or custom format and parse accordingly
      if (moment(date, "YYYY-MM-DDTHH:mm:ss.SSSZ", true).isValid()) {
        return moment(date); // ISO format
      } else {
        return moment(date, "DD/MM/YYYYTHH:mm A"); // Custom format (23/10/1999T03:43 PM)
      }
    });
  
    const minDate = moment.min(dates);
    const maxDate = moment.max(dates);
  
    return `${minDate.format("YYYY/MM/DD")} - ${maxDate.format("YYYY/MM/DD")}`;
  };
  



  return (
    <div>
      <div className="bg-[#121315] h-[calc(100dvh-6rem)] flex flex-col overflow-y-auto w-full p-4 md:p-6 rounded-lg mb-[30px] border-none dark relative">
        <div className="flex flex-col md:flex-row items-center justify-between mb-2 md:mb-5">
          <div className="flex items-center h-auto">
            <div
              className={`mr-5 text-sm md:text-base  md:mr-8 cursor-pointer ${
                selectedTabs
                  ? "underline underline-offset-2 text-primary"
                  : "text-[#A5A5A5]"
              }`}
              onClick={() => setSelectedTabs(true)}
            >
              Recharge History
            </div>
            <div
              className={`cursor-pointer text-sm md:text-base ${
                !selectedTabs
                  ? "underline  underline-offset-2 text-primary"
                  : "text-[#A5A5A5]"
              }`}
              onClick={() => setSelectedTabs(false)}
            >
              Number History
            </div>
          </div>
          {!selectedTabs && (
            <div className="flex items-center gap-4">
              <Filter setTranFilter={setTranFilter} transFilter={tranFilter} />
              <p className="min-w-fit text-sm">
                Total: {filteredTransactionHistory.length}
              </p>
            </div>
          )}
          <div className="flex items-center gap-4">
            <Limiter
              limit={selectedTabs ? rechargeLimit : transactionLimit}
              onLimitChange={(value) =>
                selectedTabs
                  ? handleRechargeLimitChange(value)
                  : handleTransactionLimitChange(value)
              }
            />
            <p className="text-[#A5A5A5] text-sm">
              Data:{" "}
              <span className="text-white font-normal text-xs">
                {getDateRange(selectedTabs ? rechargeData : transactionData)}
              </span>
            </p>
          </div>
        </div>
        <hr className="border-t border-[#373737]" />

        <div className="h-[calc(100%-100px)] overflow-y-auto hide-scrollbar relative">
          {selectedTabs ? (
            rechargeHistory.length > 0 ? (
              <>
                <div className="hidden md:block">
                  <RechargeTable
                    data={rechargeData}
                    currentPage={rechargeCurrentPage}
                    limit={rechargeLimit}
                  />
                </div>
                <div className="block md:hidden">
                  <RechargeTabelMob
                    data={rechargeData}
                    currentPage={rechargeCurrentPage}
                    limit={rechargeLimit}
                  />
                </div>
              </>
            ) : (
              <div className="text-white text-center h-full flex items-center justify-center">
                No history available
              </div>
            )
          ) : transactionHistory.length > 0 ? (
            <>
              <div className="hidden md:block">
                <NumberTable
                  data={transactionData}
                  
                  currentPage={transactionCurrentPage}
                  limit={transactionLimit}
                />
              </div>
              <div className="block md:hidden">
                <NumberTabelMob
                  data={transactionData}
                  currentPage={transactionCurrentPage}
                  limit={transactionLimit}
                />
              </div>
            </>
          ) : (
            <div className="text-center h-full flex items-center justify-center">
              No history available
            </div>
          )}
        </div>

        {/* Pagination controls */}
        {filteredData.length > 0 && (
          <div className="flex items-center justify-center gap-4 bg-[#121315] pt-4">
            {selectedTabs ? (
              <>
                <Button
                  className="py-1 px-6 text-xs w-20 h-8 !rounded-md border-2 border-white font-normal hover:!bg-white hover:text-black transition-colors duration-200 ease-in-out"
                  onClick={handleRechargePrevPage}
                  disabled={rechargeCurrentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  className="py-1 px-6 text-xs w-20 h-8 !rounded-md border-2 border-white font-normal hover:!bg-white hover:text-black transition-colors duration-200 ease-in-out"
                  onClick={handleRechargeNextPage}
                  disabled={
                    rechargeCurrentPage * rechargeLimit >=
                    rechargeHistory.length
                  }
                >
                  Next
                </Button>
              </>
            ) : (
              <>
                <Button
                  className="py-1 px-6 text-xs w-20 h-8 !rounded-md border-2 border-white font-normal hover:!bg-white hover:text-black transition-colors duration-200 ease-in-out"
                  onClick={handleTransactionPrevPage}
                  disabled={transactionCurrentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  className="py-1 px-6 text-xs w-20 h-8 !rounded-md border-2 border-white font-normal hover:!bg-white hover:text-black transition-colors duration-200 ease-in-out"
                  onClick={handleTransactionNextPage}
                  disabled={
                    transactionCurrentPage * transactionLimit >=
                    filteredTransactionHistory.length
                  }
                >
                  Next
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
const statusMap = {
  Cancelled: "Cancelled",
  Success: "Success",
};
const wrapStyle = {
  wordBreak: "break-word",
  whiteSpace: "normal",
  overflowWrap: "break-word",
};
const NumberTable = ({ data, currentPage, limit }) => {
  const getPriceDisplay = (price, status) => {
    const symbol = status === "Success" ? "-" : "+";
    const colorClass = status === "Success" ? "text-red-500" : "text-green-500";
    return (
      <span className={colorClass}>
        {symbol}₹{Math.abs(price)}
      </span>
    );
  };
  return (
    <div className="bg-transparent text-white relative">
      <table className="w-full text-center border-collapse">
        <thead className="sticky top-0 bg-[#121315]">
          <tr className="text-[#A5A5A5] h-12 border-b border-[#373737]">
            <th className="p-2 font-normal">SL No’s</th>
            <th className="p-2 font-normal">ID</th>
            <th className="p-2 font-normal">Number</th>
            <th className="p-2 font-normal">OTP</th>
            <th className="p-2 font-normal">Date & Time</th>
            <th className="p-2 font-normal">Service</th>
            <th className="p-2 font-normal">Server</th>
            <th className="p-2 font-normal">Discount</th>
            <th className="p-2 font-normal">Price</th>
             <th className="p-2 font-normal">Reason</th>
            <th className="p-2 font-normal">Status</th>
            
          </tr>
        </thead>
        <tbody>
          {data.map((entry, index) => (
            <tr key={index} className="h-12 border-b border-[#373737]">
              <td className="p-2 font-normal text-sm">
                {(currentPage - 1) * limit + index + 1}
              </td>
              <td className="p-2 font-normal text-sm">{entry._Id}</td>
              <td className="p-2 font-normal text-sm">{entry.number}</td>
              <td
                className="p-2 font-normal text-sm max-w-[400px]"
                style={wrapStyle}
              >
                <span dangerouslySetInnerHTML={{ __html: entry.otps[0].message }} />
              </td>
              <td className="p-2 font-normal text-sm">
              {moment(entry.date, "YYYY/MM/DDTHH:mm:ss A").isValid()
    ? moment(entry.date, "YYYY/MM/DDTHH:mm:ss A").format(
        "YYYY/MM/DD hh:mm:ss A"
      )
    : "Invalid Date"}
              </td>
              <td className="p-2 font-normal text-sm">{entry.serviceName}</td>
              <td className="p-2 font-normal text-sm">{entry.server}</td>
              <td className="p-2 font-normal text-sm">{entry.Discount}</td>
              
              <td className="p-2 font-normal text-sm">{entry.reason}</td>
              
              <td className="p-2 font-normal text-sm">
                {getPriceDisplay(entry.price, entry.status)}
              </td>
              <td className="p-2 font-normal text-sm text-teal-400">
                {entry.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Limiter = ({ limit, onLimitChange }) => {
  return (
    <Select value={String(limit)} onValueChange={onLimitChange}>
      <SelectTrigger className="w-[80px] dark bg-transparent">
        <SelectValue>{limit}</SelectValue>
      </SelectTrigger>
      <SelectContent className="dark bg-[#1e1e1e]">
        <SelectGroup>
          <SelectLabel className="font-normal">Limit</SelectLabel>
          <SelectItem value="10">10</SelectItem>
          <SelectItem value="20">20</SelectItem>
          <SelectItem value="30">30</SelectItem>
          <SelectItem value="50">50</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};
const Filter = ({ transFilter, setTranFilter }) => {
  return (
    <Select value={transFilter} onValueChange={(value) => setTranFilter(value)}>
      <SelectTrigger className="dark bg-transparent">
        <SelectValue>{transFilter}</SelectValue>
      </SelectTrigger>
      <SelectContent className="dark bg-[#1e1e1e]">
        <SelectGroup>
          <SelectLabel className="font-normal">Filter</SelectLabel>
          <SelectItem value="All">All</SelectItem>
          <SelectItem value="Success">Success</SelectItem>
          <SelectItem value="Cancelled">Cancelled</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

const NumberTabelMob = ({ data, currentPage, limit }) => {
  const getPriceDisplay = (price, status) => {
    const symbol = status === "Success" ? "-" : "+";
    const colorClass = status === "Success" ? "text-red-500" : "text-green-500";
    return (
      <span className={colorClass}>
        {symbol}₹{Math.abs(price)}
      </span>
    );
  };
  return (
    <>
      {data.map((item, index) => (
        <div
          key={index}
          className="my-[1.5rem] w-full border-[10px] border-[#444444] rounded-lg"
        >
          <table className="w-full table-auto text-xs">
            <tbody>
              <tr>
                <td className="border-b-2 border-[#949494] p-3 px-5 text-[#959595]">
                  SL No
                </td>
                <td
                  className="border-b-2 border-[#949494] p-3"
                  style={wrapStyle}
                >
                  {(currentPage - 1) * limit + index + 1}
                </td>
              </tr>
              <tr>
                <td className="border-b-2 border-[#949494] p-3 px-5 text-[#959595]">
                  ID
                </td>
                <td
                  className="border-b-2 border-[#949494] p-3"
                  style={wrapStyle}
                >
                  
                  {item._id}
                </td>
              </tr>
              <tr>
                <td className="border-b-2 border-[#949494] p-3 px-5 text-[#959595]">
                  Number
                </td>
                <td
                  className="border-b-2 border-[#949494] p-3"
                  style={wrapStyle}
                >
                  {item.number}
                </td>
              </tr>
              <tr>
                <td className="border-b-2 border-[#949494] p-3 px-5 text-[#959595]">
                  OTP
                </td>
                <td
                  className="border-b-2 border-[#949494] p-3"
                  style={wrapStyle}
                >
                  <span dangerouslySetInnerHTML={{ __html: item.otps  }} />
                </td>
              </tr>
              <tr>
                <td className="border-b-2 border-[#949494] p-3 px-5 text-[#959595]">
                  Date & Time
                </td>
                <td
                  className="border-b-2 border-[#949494] p-3"
                  style={wrapStyle}
                >
                   {moment(item.date, "YYYY/MM/DDTHH:mm:ss A").isValid()
    ? moment(item.date, "YYYY/MM/DDTHH:mm:ss A").format(
        "YYYY/MM/DD hh:mm:ss A"
      )
    : "Invalid Date"}
                </td>
              </tr>
              <tr>
                <td className="border-b-2 border-[#949494] p-3 px-5 text-[#959595]">
                  Service
                </td>
                <td
                  className="border-b-2 border-[#949494] p-3"
                  style={wrapStyle}
                >
                  {item.serviceName}
                </td>
              </tr>
              <tr>
                <td className="border-b-2 border-[#949494] p-3 px-5 text-[#959595]">
                  Server
                </td>
                <td
                  className="border-b-2 border-[#949494] p-3"
                  style={wrapStyle}
                >
                  {item.server}
                </td>
              </tr>
              <tr>
  <td className="border-b-2 border-[#949494] p-3 px-5 text-[#959595]">
    Discount
  </td>
  <td
    className="border-b-2 border-[#949494] p-3"
    style={wrapStyle}
  >
    {item.Discount || 0}

  </td>
</tr>

<tr>
                <td className="border-b-2 border-[#949494] p-3 px-5 text-[#959595]">
                  Price
                </td>
                <td className="border-b-2 border-[#949494] p-3">
                  {getPriceDisplay(item.price, item.status)}
                </td>
              </tr>
              <tr>
                <td className="border-b-2 border-[#949494] p-3 px-5 text-[#959595]">
                  Reason
                </td>
                <td
                  className="border-b-2 border-[#949494] p-3"
                  style={wrapStyle}
                >
                  {item.reason}
                </td>
              </tr>
               <tr>
                <td className="p-3 px-5 text-[#959595]">Status</td>
                <td className="p-3 text-teal-400">{item.status}</td>
              </tr>
              
            </tbody>
          </table>
        </div>
      ))}
    </>
  );
};
export default AppLayout()(History);
