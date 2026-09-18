const FinishRide = ({ onComplete, loading }) => <section className="rounded-t-2xl bg-white p-5 shadow-2xl"><h2 className="text-xl font-bold">Complete this ride?</h2><p className="mt-2 text-sm text-gray-600">Only complete after the destination is reached and payment is settled.</p><button type="button" onClick={onComplete} disabled={loading} className="mt-5 w-full rounded bg-green-600 p-3 font-semibold text-white disabled:opacity-60">{loading ? "Completing…" : "Complete ride"}</button></section>;

export default FinishRide;
