// Previous imports remain the same...

const Home = ({ serviceData }) => {
  // Previous state and handlers remain the same...

  return (
    <div className="min-h-screen flex flex-col">
      {/* Banner Section */}
      {bannerInfo?.message && (
        <div className="fixed top-16 left-0 right-0 z-40">
          <Banner message={bannerInfo.message} type={bannerInfo.type} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex mt-20">
        {/* Left Sidebar - Services List */}
        <div className="w-full max-w-[320px] bg-[#121315] p-4 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="bg-[#18191c] rounded-2xl p-3">
            <div className="relative mb-4">
              <Icon.search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}
                disabled={loading}
                className="w-full h-12 pl-10 bg-transparent border-0 text-base text-white placeholder:text-primary focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <Icon.circleX className="text-primary" />
                </button>
              )}
            </div>

            <div className="space-y-2">
              {filteredServices.map((service) => (
                <button
                  key={service.name}
                  onClick={() => handleServiceClick(service)}
                  className="w-full p-4 bg-[#282828] rounded-lg text-left hover:bg-[#303030] transition-colors duration-200"
                >
                  <h3 className="text-white font-medium">{service.name}</h3>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Content - Server Selection */}
        <div className="flex-1 p-4">
          {selectedService && (
            <div className="bg-[#121315] rounded-2xl p-5">
              <h2 className="text-xl font-medium mb-4 text-primary">Select Server</h2>
              <div className="grid gap-3">
                {selectedService.servers
                  .sort((a, b) => a.serverNumber - b.serverNumber)
                  .map((server) => (
                    <button
                      key={server._id || server.serverNumber}
                      onClick={() => handleServiceButtonClick(server.serverNumber)}
                      disabled={loading}
                      className="bg-[#282828] p-4 rounded-lg flex justify-between items-center hover:bg-[#303030] transition-colors duration-200"
                    >
                      <div>
                        <h3 className="text-white font-medium">Server {server.serverNumber}</h3>
                        {server.otp && (
                          <span className="text-sm text-gray-400">{server.otp}</span>
                        )}
                      </div>
                      <div className="flex items-center text-white">
                        <Icon.indianRupee className="w-4 h-4" />
                        <span>{formatPrice(server.price)}</span>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Purchase Disclaimer Modal */}
      <PurchaseDisclaimer
        isOpen={showDisclaimer}
        onClose={() => setShowDisclaimer(false)}
        onContinue={handleDisclaimerContinue}
        disclaimerContent={disclaimerInfo?.content}
      />
    </div>
  );
};

export default AppLayout()(Home);


// client ip:223.188.255.32