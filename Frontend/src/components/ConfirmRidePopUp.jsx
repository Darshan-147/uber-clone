import { useState } from "react";

const ConfirmRidePopUp = ({ ride, onVerify, onStart, onCancel, loading }) => {
  const [otp, setOtp] = useState("");
  if (!ride) return null;
  return <section className="rounded-t-2xl bg-white p-5 shadow-2xl"><h2 className="text-xl font-bold">At pickup</h2><p className="mt-2 text-sm">Ask the rider for their six-digit OTP before starting.</p>
    <input value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" className="mt-4 w-full rounded border bg-gray-100 p-3 font-mono" placeholder="6-digit OTP" />
    <div className="mt-4 space-y-3">{!ride.otpVerifiedAt && <button type="button" onClick={() => onVerify(otp)} disabled={loading || otp.length !== 6} className="w-full rounded bg-black p-3 font-semibold text-white disabled:opacity-50">Verify OTP</button>}{ride.otpVerifiedAt && <button type="button" onClick={onStart} disabled={loading} className="w-full rounded bg-green-600 p-3 font-semibold text-white">Start ride</button>}<button type="button" onClick={onCancel} disabled={loading} className="w-full rounded bg-red-600 p-3 font-semibold text-white">Cancel ride</button></div>
  </section>;
};

export default ConfirmRidePopUp;
