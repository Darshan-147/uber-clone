import React from "react";

const LocationSearchPanel = (props) => {
  return (
    <div className="flex flex-col gap-2 bg-white">
      {props.suggestions.map((suggestion, index) => (
        <div
          key={index}
          onClick={() => {
            props.onSuggestionClick(suggestion);
            props.setVehiclePanel(true);
            props.setPanelOpen(false);
          }}
          className="flex items-center gap-4 border-2 border-white active:border-black rounded-xl p-3"
        >
          <h2 className="w-5 bg-[#eee] h-7 rounded-full">
            <i className="ri-map-pin-fill"></i>
          </h2>
          <h4>{suggestion.name}</h4>
        </div>
      ))}
    </div>
  );
};

export default LocationSearchPanel;
