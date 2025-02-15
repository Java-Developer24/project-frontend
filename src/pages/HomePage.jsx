import { useState, useEffect, useContext } from "react";
import AppLayout from "./../components/layout/AppLayout";
import { Icon } from "@/components/ui/Icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/utils/AppContext";
import toast from "react-hot-toast";
import BannerPopup from "@/components/shared/BannerPopup";

const Home = ({ serviceData }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, apiKey, fetchBalance } = useContext(AuthContext);
  const [bannerInfo, setBannerInfo] = useState(null);
  const [showBannerPopup, setShowBannerPopup] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(true);

  // Reset servicesLoading when serviceData changes or when navigating
  useEffect(() => {
    if (serviceData) {
      setServicesLoading(true);
    }
  }, [serviceData]);

  // Fetch banner info (no disclaimer info now)
  useEffect(() => {
    const showBanner = localStorage.getItem('showBanner');

    if (showBanner === 'false') {
      setShowBannerPopup(false); // Don't show the banner if user opted out
      setShowContent(true); // Show content immediately
      return; // Skip banner fetch if not needed
    }

    const fetchInfo = async () => {
      try {
        const bannerResponse = await axios.get('/api/info/admin-api/get-info-banner/banner');
        setBannerInfo(bannerResponse.data);

        // Show content if no banner message exists
        if (!bannerResponse.data?.message) {
          setShowContent(true);
        }
      } catch (error) {
        console.error("Error fetching info:", error);
      }
    };

    fetchInfo();
  }, []);

  // Load services after banner interaction
  useEffect(() => {
    if (serviceData && showContent) {
      setServicesLoading(false);
    }
  }, [serviceData, showContent]);

  const handleBannerClose = () => {
    setShowBannerPopup(false);
    setShowContent(true);
  };

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
    return serviceData.filter((service) =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
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
    setLoading(true);

    const service = selectedService;
    const selectedServer = selectedService.servers.find(
      (server) => server.serverNumber === serverNumber
    );
    const otpType = selectedServer?.otp || "";

    const getNumberPromise = new Promise((resolve, reject) => {
      const getNumberRequest = async () => {
        try {
          await axios.get(
            `/api/service/get-number?api_key=${apiKey}&code=${service.name}&server=${serverNumber}`
          );
          resolve();
        } catch (error) {
          reject(error);
        } finally {
          setLoading(false);
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

  const anyOtherService = serviceData.find(
    (service) => service.name.toLowerCase() === "anyother"
  );

  return (
    <div className="h-[calc(100dvh-8rem)] flex flex-col items-center justify-center">
      {bannerInfo?.message && (
        <BannerPopup
          isOpen={showBannerPopup}
          onClose={handleBannerClose}
          bannerMessage={bannerInfo.message}
        />
      )}
      {showContent ? (
        <div className="w-full flex justify-center my-8">
          <div className="w-full max-w-[720px] flex flex-col items-center bg-[#121315] rounded-2xl p-3 md:p-5">
            {/* Search Bar */}
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
              {searchQuery !== "" && (
                <Icon.circleX
                  className="text-primary cursor-pointer"
                  onClick={clearSearch}
                />
              )}
            </div>

            {/* Services Box */}
            <div className="flex flex-col w-full h-[450px] md:h-[340px]">
              <h5 className="p-3">{selectedService ? "Select Server" : "Services"}</h5>
              <div className="rounded-2xl flex flex-col overflow-y-auto hide-scrollbar h-full relative">
                {servicesLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#121315] bg-opacity-80 z-10">
                    <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-primary"></div>
                  </div>
                ) : selectedService ? (
                  selectedService.servers
                    .sort((a, b) => a.serverNumber - b.serverNumber)
                    .map((servers) => (
                      <button
                        className="bg-[#282828] py-4 px-3 md:px-5 flex mb-1 w-full items-center justify-between rounded-lg"
                        key={servers.serverNumber}
                        disabled={loading}
                        onClick={() => handleServiceButtonClick(servers.serverNumber)}
                      >
                        <h3 className="capitalize font-medium flex flex-col items-start">
                          Server {servers.serverNumber}
                          <span className="text-sm text-gray-400">{servers.otp}</span>
                        </h3>
                        <div className="flex items-center">
                          <Icon.indianRupee className="w-4 h-4" />
                          <p className="text-base">{servers.price}</p>
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
                ) : (
                  <button
                    className="bg-[#282828] py-4 px-3 md:px-5 flex mb-1 w-full items-center justify-between rounded-lg"
                    onClick={() => handleServiceClick(anyOtherService)}
                  >
                    <h3 className="capitalize font-medium">{anyOtherService.name}</h3>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AppLayout()(Home);
