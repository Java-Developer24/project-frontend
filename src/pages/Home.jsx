import { useState, useEffect, useContext } from "react";
import AppLayout from "./../components/layout/AppLayout";
import { Icon } from "@/components/ui/Icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/utils/AppContext";
import toast from "react-hot-toast";
import Banner from "@/components/shared/Banner";
import PurchaseDisclaimer from "@/components/shared/PurchaseDisclaimer";

const Home = ({ serviceData }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, apiKey, fetchBalance } = useContext(AuthContext);
  const [bannerInfo, setBannerInfo] = useState(null);
  const [disclaimerInfo, setDisclaimerInfo] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [selectedServer, setSelectedServer] = useState(null);



  // Fetch banner and disclaimer info
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const [bannerResponse, disclaimerResponse] = await Promise.all([
          axios.get('/api/info/banner'),
          axios.get('/api/info/disclaimer')
        ]);
        
        setBannerInfo(bannerResponse.data);
        setDisclaimerInfo(disclaimerResponse.data);
      } catch (error) {
        console.error('Error fetching info:', error);
      }
    };

    fetchInfo();
  }, []);
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value.toLowerCase());    
    setSelectedService(null);
  };
  

  const handleServiceClick = (service) => {
    if (!service || !service.name) {
      console.error("Invalid service object:", service);
      return;
    }
    setSearchQuery(service.name.toLowerCase());
    setSelectedService(service);
  };

  const getFilteredServices = () => {
    if (!searchQuery) {
      return serviceData;
    }
    const filtered = serviceData.filter((service) =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // If no results found, return the "Any Other" service
    if (filtered.length === 0) {
      const anyOtherService = serviceData.find(service => 
        service.name.toLowerCase() === "anyOther"
      );
      return anyOtherService ? [anyOtherService] : [];
    }
    
    return filtered;
  };
  const filteredServices = Array.isArray(serviceData) ? getFilteredServices() : [];

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedService(null);
  };


  const handleServiceButtonClick = async (serverNumber) => {
    if (!user) {
      navigate("/login");
      return;
    }

    setSelectedServer(serverNumber);

    // Check if disclaimer should be shown
    const hideDisclaimer = localStorage.getItem('hidePurchaseDisclaimer');
    if (!hideDisclaimer && disclaimerInfo?.content) {
      setShowDisclaimer(true);
      return;
    }

    // If disclaimer shouldn't be shown, proceed with purchase
    proceedWithPurchase(serverNumber);
  };

  const proceedWithPurchase = async (serverNumber) => {
    const service = selectedService;
    const selectedServer = selectedService.servers.find(
      (server) => server.serverNumber === serverNumber
    );
    const otpType = selectedServer?.otp || "";
    
    setLoading(true);
    const getNumberPromise = new Promise((resolve, reject) => {
      const getNumberRequest = async () => {
        try {
          await axios.get(
            `/api/service/get-number?api_key=${apiKey}&servicecode=${service.name}&server=${serverNumber}`
          );
          resolve();
        } catch (error) {
          reject(error);
        } finally {
          setLoading(false);
          setShowDisclaimer(false);
        }
      };
      getNumberRequest();
    });

    await toast.promise(getNumberPromise, {
      loading: "Processing Request...",
      success: () => {
        fetchBalance(apiKey);
        navigate("/my-orders");
        return "Number Bought Successfully!";
      },
      error: (error) => {
        const errorMessage = error.response?.data?.error || "Please try again.";
        return errorMessage;
      },
    });
  };

  const handleDisclaimerContinue = () => {
    proceedWithPurchase(selectedServer);
  };

  const formatPrice = (price) => {
    if (price == null) {
      return "0.00";
    }
    const priceString = typeof price === "string" ? price : price.toFixed(2);
    const [integerPart, decimalPart] = priceString.split(".");
    const formattedInteger = integerPart.padStart(2, "0");
    return `${formattedInteger}.${(decimalPart || "00").padEnd(2, "0")}`;
  };



  const anyOtherService = serviceData.find(
    (service) => service.name.toLowerCase() === "anyother"
  );
  
  
  
  return (
    <div className="h-[calc(100dvh-4rem)] flex flex-col items-center justify-center">
     <div className="w-full mt-2 mb-2">
      {bannerInfo?.message && (
        <Banner  message={bannerInfo.message} type={bannerInfo.type} />
      )}
      </div>
    
      
      <div className="w-full flex justify-center mb-8">
        <div className="w-full max-w-[980px] flex flex-col items-center bg-[#121315] rounded-2xl p-3 md:p-5">
          <div className="w-full flex bg-[#18191c] rounded-2xl items-center h-[60px] mb-3 px-3 md:px-5">
            <Icon.search className="text-[30px] text-primary" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
              disabled={loading}
              className="w-full h-[50px] ml-2 bg-transparent border-0 text-base text-white placeholder:text-primary focus:outline-none"
            />
            {searchQuery !== "" ? (
              <Icon.circleX className="text-primary cursor-pointer" onClick={clearSearch} />
            ) : (
              ""
            )}
          </div>
          <div className="flex flex-col w-full h-[450px] md:h-[460px]">
            <h5 className="p-3">{selectedService ? "Select Server" : "Services"}</h5>
            <div className="rounded-2xl flex flex-col overflow-y-auto hide-scrollbar h-full">
              {selectedService ? (
                selectedService.servers
                  .sort((a, b) => a.serverNumber - b.serverNumber)
                  .map((servers) => (
                    <button
                      className="bg-[#282828] py-4 px-3 md:px-5 flex mb-1 w-full items-center justify-between rounded-lg"
                      key={ servers.serverNumber}
                      disabled={loading}
                      onClick={() => handleServiceButtonClick(servers.serverNumber)}
                    >
                      <h3 className="capitalize font-medium flex flex-col items-start">
                        Server {servers.serverNumber}
                        
                        <span className="text-sm text-gray-400">{servers.otp}</span>
                      </h3>
                      <div className="flex items-center">
                      <Icon.indianRupee className="w-4 h-4" />
                        <p className="text-base">{formatPrice(servers.price)}</p>
                        
                      </div>
                      
                   
                    </button>
                  ))
              ) : filteredServices.length > 0 ? (
                filteredServices.map((i) => (
                  <button
                    className="bg-[#282828] py-4 px-3 md:px-5 flex mb-1 w-full items-center justify-between rounded-lg"
                    key={i._id || i.name}
                    onClick={() => handleServiceClick(i)}
                  >
                    <h3 className="capitalize font-medium text-start">{i.name}</h3>
                  </button>
                ))
              ): (
                <button
                  className="bg-[#282828] py-4 px-3 md:px-5 flex mb-1 w-full items-center justify-between rounded-lg"
                  onClick={() => handleServiceClick(anyOtherService)}
                >
                  <h3 className="capitalize font-medium">
                    {anyOtherService.name}
                  </h3>
                  <div className="flex items-center">
                    
                  </div>
                </button>
              )}
            </div>
          </div>
          <PurchaseDisclaimer
        isOpen={showDisclaimer}
        onClose={() => setShowDisclaimer(false)}
        onContinue={handleDisclaimerContinue}
        disclaimerContent={disclaimerInfo?.content}
      />
        </div>
      </div>
      
    </div>
  );
};

export default AppLayout()(Home);















