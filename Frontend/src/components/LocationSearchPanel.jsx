import React from "react";

const LocationSearchPanel = (props) => {
  console.log(props);
  // sample locations array
  const locations = [
    "Sector-72, Bhaukali Nagari, Sherpur, Gujarat - 385421",
    "Sector-27, Khaufnakh Nagari, Sherpur, Gujarat - 385421",
    "Sector-55, Chamchamati Nagari, Sherpur, Gujarat - 385421",
  ];
  return (
    <div className="flex flex-col gap-2 bg-white">
      {/* Creating a sample data */}

      {locations.map(function (element, index) {
        return (
          <div key={index}
            onClick={() => {
              props.setVehiclePanelOpen(true);
              props.setPanelOpen(false);
            }}
            className="flex items-center gap-4 border-2 border-white active:border-black rounded-xl p-3"
          >
            <h2 className="w-5 bg-[#eee] h-7 rounded-full">
              <i className="ri-map-pin-fill"></i>
            </h2>
            <h4>{element}</h4>
          </div>
        );
      })}
    </div>
  );
};

export default LocationSearchPanel;
