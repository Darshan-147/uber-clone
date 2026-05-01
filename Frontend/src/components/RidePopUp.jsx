import React from "react";

const formatName = (fullname) =>
  [fullname?.firstname, fullname?.lastname].filter(Boolean).join(" ") ||
  "Rider";

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

      <h3 className="text-2xl font-semibold mb-5">Available Rides</h3>

      {rides.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <i className="ri-taxi-line text-4xl"></i>
          <p className="mt-3 font-medium">No ride requests nearby right now.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 max-h-[72vh] overflow-y-auto pb-4">
          {rides.map((ride) => (
            <div key={ride._id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center bg-yellow-100 p-3 rounded-lg">
                <div>
                  <h4 className="text-lg font-semibold">
                    {formatName(ride.user?.fullname)}
                  </h4>
                  <p className="text-xs uppercase tracking-wide text-gray-600">
                    {ride.vehicleType}
                  </p>
                </div>
                <div className="text-right">
                  <h5 className="text-lg font-semibold">₹{ride.fare}</h5>
                  <p className="text-xs text-gray-600">Cash</p>
                </div>
              </div>

              <div className="w-full flex flex-col gap-2 mt-4">
                <div className="flex gap-4 border-b border-gray-200 p-3 rounded-md">
                  <i className="ri-map-pin-2-fill"></i>
                  <span>{ride.pickup}</span>
                </div>
                <div className="flex gap-4 border-b border-gray-200 p-3 rounded-md">
                  <i className="ri-square-fill"></i>
                  <span>{ride.destination}</span>
                </div>
                <div className="flex gap-4 border-b border-gray-200 p-3 rounded-md">
                  <i className="ri-bank-card-2-fill"></i>
                  <span>₹{ride.fare} payable by rider</span>
                </div>
              </div>

              <div className="flex w-full mt-5 gap-3">
                <button
                  type="button"
                  onClick={() => onAcceptRide(ride)}
                  disabled={loading}
                  className="bg-green-500 disabled:bg-gray-400 p-3 rounded-lg w-full font-semibold text-white"
                >
                  {loading ? "Accepting..." : "Accept"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RidePopUp;
