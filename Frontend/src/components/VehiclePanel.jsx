const VEHICLES = [
  { type: "auto", name: "Auto", capacity: 3, description: "Compact local ride" },
  { type: "car", name: "Car", capacity: 4, description: "Comfortable everyday ride" },
  { type: "motorcycle", name: "Motorcycle", capacity: 1, description: "Quick ride for one" },
];

const VehiclePanel = ({ fare, selected, onSelect }) => (
  <section className="bg-white p-5 shadow-lg">
    <h2 className="mb-4 text-xl font-semibold">Choose a vehicle</h2>
    {VEHICLES.map((vehicle) => (
      <button
        type="button"
        key={vehicle.type}
        onClick={() => onSelect(vehicle.type)}
        disabled={!Number.isFinite(fare?.[vehicle.type])}
        className={`mb-3 flex w-full items-center justify-between rounded-xl border-2 p-4 text-left disabled:cursor-not-allowed disabled:opacity-50 ${selected === vehicle.type ? "border-black" : "border-gray-200"}`}
      >
        <span>
          <strong className="block">{vehicle.name} · {vehicle.capacity} seat{vehicle.capacity > 1 ? "s" : ""}</strong>
          <small className="text-gray-500">{vehicle.description}</small>
        </span>
        <strong>₹{fare?.[vehicle.type] ?? "—"}</strong>
      </button>
    ))}
  </section>
);

export default VehiclePanel;
