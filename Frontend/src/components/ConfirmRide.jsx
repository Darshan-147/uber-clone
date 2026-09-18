import { useState } from "react";

const ConfirmRide = ({ pickup, destination, vehicleType, fare, onConfirm, onBack }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const confirm = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      await onConfirm();
    } catch (requestError) {
      setError(requestError.response?.data?.error?.message || "Could not request a ride. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-white p-5 shadow-lg">
      <h2 className="mb-4 text-xl font-semibold">Confirm your ride</h2>
      <dl className="space-y-3 text-sm">
        <div><dt className="text-gray-500">Pickup</dt><dd>{pickup}</dd></div>
        <div><dt className="text-gray-500">Destination</dt><dd>{destination}</dd></div>
        <div><dt className="text-gray-500">Vehicle</dt><dd className="capitalize">{vehicleType}</dd></div>
        <div><dt className="text-gray-500">Estimated fare</dt><dd className="font-semibold">₹{fare?.[vehicleType]}</dd></div>
      </dl>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <div className="mt-5 flex gap-3">
        <button type="button" onClick={onBack} disabled={isSubmitting} className="w-1/3 rounded-lg bg-gray-200 p-3 font-semibold">Back</button>
        <button type="button" onClick={confirm} disabled={isSubmitting} className="w-2/3 rounded-lg bg-black p-3 font-semibold text-white disabled:opacity-60">
          {isSubmitting ? "Requesting…" : "Confirm ride"}
        </button>
      </div>
    </section>
  );
};

export default ConfirmRide;
