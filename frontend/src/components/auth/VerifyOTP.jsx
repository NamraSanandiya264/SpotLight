import { useEffect, useState } from "react";
import API from "../../services/api";
import { toast } from "react-toastify";
import { FaArrowLeft, FaEnvelope } from "react-icons/fa";

const VerifyOTP = ({ email, onSuccess, onBack }) => {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (countdown === 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      setIsVerifying(true);
      await API.post("/users/verify-email", { email, otp });
      toast.success("Email verified successfully.");
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsResending(true);
      await API.post("/users/resend-otp", { email });
      toast.success("A new OTP has been sent.");
      setCountdown(60);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form onSubmit={handleVerifyOTP} className="w-full flex flex-col gap-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <FaEnvelope className="text-blue-600 dark:text-blue-400 text-2xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Verify Your Email</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
          We sent a 6-digit verification code to <br />
          <strong className="text-gray-800 dark:text-gray-200">{email}</strong>
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 text-center">Enter OTP</label>
        <input
          type="text"
          placeholder="· · · · · ·"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
          required
          className="w-full p-4 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none text-center tracking-[0.4em] text-xl font-bold transition-all"
        />
      </div>

      <button
        type="submit"
        disabled={isVerifying || otp.length < 6}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isVerifying ? "Verifying..." : "Verify Email"}
      </button>

      <div className="text-center text-sm">
        {countdown > 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            Resend OTP in <span className="font-bold text-blue-600 dark:text-blue-400">{countdown}s</span>
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={isResending}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors disabled:opacity-60"
          >
            {isResending ? "Sending..." : "Resend OTP"}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onBack}
        className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors font-medium"
      >
        <FaArrowLeft size={12} /> Back
      </button>
    </form>
  );
};

export default VerifyOTP;