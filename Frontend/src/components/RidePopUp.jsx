const RidePopUp = ({ ride, onAccept, onReject, loading, onClose }) => {
  if (!ride) return null;
  return <section className="rounded-t-2xl bg-white p-5 shadow-2xl">
    <button type="button" onClick={onClose} className="float-right text-gray-500" aria-label="Close ride request">×</button>
    <h2 className="text-xl font-bold">New {ride.vehicleType} ride</h2>
    <div className="mt-4 space-y-2 text-sm"><p><strong>Pickup:</strong> {ride.pickup}</p><p><strong>Destination:</strong> {ride.destination}</p><p><strong>Fare:</strong> ₹{ride.fare}</p><p><strong>Rider:</strong> {ride.user?.fullname?.firstname || "Rider"}</p></div>
    <div className="mt-5 flex gap-3"><button type="button" disabled={loading} onClick={onReject} className="w-1/3 rounded-lg bg-gray-200 p-3 font-semibold">Reject</button><button type="button" disabled={loading} onClick={onAccept} className="w-2/3 rounded-lg bg-green-600 p-3 font-semibold text-white">{loading ? "Updating…" : "Accept ride"}</button></div>
  </section>;
};

export default RidePopUp;
