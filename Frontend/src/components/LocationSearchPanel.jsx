import React from "react";

const LocationSearchPanel = (props) => {
  return (
    <div className="flex flex-col gap-2 bg-white">
      {props.suggestions.length > 0 ? (
        props.suggestions.map((suggestion, index) => (
          <div
            key={index}
            onClick={() => {
              props.onSuggestionClick(suggestion);
            }}
            className="flex items-center gap-4 border-2 border-white active:border-black rounded-xl p-3 cursor-pointer hover:bg-gray-100"
          >
            <div className="w-5 bg-[#eee] h-7 rounded-full flex items-center justify-center">
              <i className="ri-map-pin-fill"></i>
            </div>
            <h4 className="text-sm md:text-base">{suggestion.name}</h4>
          </div>
        ))
      ) : (
        <div className="p-3 text-center text-gray-500">
          No suggestions found
        </div>
      )}
    </div>
  );
};

export default LocationSearchPanel;
