import React from "react";

const formatName = (fullname) =>
  [fullname?.firstname, fullname?.lastname].filter(Boolean).join(" ") || "Rider";

const RidePopUp = ({ rides = [], onAcceptRide, onClose, loading }) => {
  return (
    <div>
      <button
        type="button"
        onClick={onClose}
        className="absolute w-full text-center top-0 text-gray-300 font-semibold text-3xl"
        aria-label="Close ride requests"
      >
        <i className="ri-arrow-down-wide-line"></i>
      </button>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold">Ride Requests</h3>
        {rides.length > 0 && (
          <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
            {rides.length} nearby
          </span>
        )}
      </div>

      {rides.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <i className="ri-taxi-line text-5xl mb-3 block"></i>
          <p className="font-medium">No ride requests nearby right now.</p>
          <p className="text-sm mt-1">Stay online to receive new requests.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-h-[72vh] overflow-y-auto pb-4">
          {rides.map((ride) => (
            <div key={ride._id} className="border border-gray-100 rounded-2xl p-4 shadow-sm">
              {/* Rider & Fare */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700">
                    {ride.user?.fullname?.firstname?.[0]?.toUpperCase() || "R"}
                  </div>
                  <div>
                    <h4 className="font-semibold">{formatName(ride.user?.fullname)}</h4>
                    <p className="text-xs text-gray-500 capitalize">{ride.vehicleType}</p>
                  </div>
                </div>
                <div className="text-right">
                  <h5 className="text-xl font-black text-green-600">₹{ride.fare}</h5>
                  <p className="text-xs text-gray-500">Cash</p>
                </div>
              </div>

              {/* Route */}
              <div className="flex flex-col gap-1 mb-3">
                <div className="flex gap-3 p-2 rounded-lg bg-gray-50 items-center">
                  <i className="ri-map-pin-2-fill text-green-600 text-sm"></i>
                  <span className="text-xs">{ride.pickup}</span>
                </div>
                <div className="flex gap-3 p-2 rounded-lg bg-gray-50 items-center">
                  <i className="ri-square-fill text-black text-sm"></i>
                  <span className="text-xs">{ride.destination}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onAcceptRide(ride)}
                disabled={loading}
                className="bg-green-600 disabled:bg-gray-300 p-3 rounded-xl w-full font-semibold text-white hover:bg-green-700 transition-colors"
              >
                {loading ? "Accepting..." : "Accept Ride"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RidePopUp;
