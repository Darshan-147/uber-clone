const LookingForDriver = ({ ride, onCancel, cancelling }) => {
  const assignedDriver = ride.driver;
  const canCancel = ["pending", "accepted", "arriving"].includes(ride.status);

  return (
    <section className="bg-white p-5 shadow-lg">
      <h2 className="text-xl font-semibold">
        {assignedDriver ? "Driver assigned" : "Looking for a nearby driver"}
      </h2>
      <p className="mt-1 text-sm text-gray-600">Ride status: <span className="font-medium capitalize">{ride.status.replace("_", " ")}</span></p>
      {assignedDriver && (
        <div className="mt-4 rounded-lg bg-gray-100 p-3 text-sm">
          <p className="font-semibold">{assignedDriver.fullname?.firstname} {assignedDriver.fullname?.lastname}</p>
          <p>{assignedDriver.vehicle?.color} {assignedDriver.vehicle?.vehicleType} · {assignedDriver.vehicle?.plate}</p>
        </div>
      )}
      <div className="mt-4 space-y-2 text-sm">
        <p><span className="font-medium">From:</span> {ride.pickup}</p>
        <p><span className="font-medium">To:</span> {ride.destination}</p>
        <p><span className="font-medium">Estimated fare:</span> ₹{ride.fare}</p>
        {ride.otp && assignedDriver && <p className="rounded bg-yellow-100 p-2 font-semibold">Share OTP {ride.otp} only after the driver arrives.</p>}
      </div>
      {canCancel && <button type="button" disabled={cancelling} onClick={onCancel} className="mt-5 w-full rounded-lg bg-red-600 p-3 font-semibold text-white disabled:opacity-60">{cancelling ? "Cancelling…" : "Cancel ride"}</button>}
    </section>
  );
};

export default LookingForDriver;
