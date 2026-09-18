const WaitingForDriver = ({ ride }) => {
  if (!ride) return null;
  const driver = ride.driver;
  return <section className="rounded-lg bg-white p-4"><h2 className="text-xl font-semibold">{driver ? "Driver assigned" : "Finding your driver"}</h2><p className="mt-1 text-sm capitalize">{ride.status.replace("_", " ")}</p>{driver && <div className="mt-3 text-sm"><p className="font-semibold">{driver.fullname?.firstname} {driver.fullname?.lastname}</p><p>{driver.vehicle?.color} {driver.vehicle?.vehicleType} · {driver.vehicle?.plate}</p></div>}</section>;
};

export default WaitingForDriver;
