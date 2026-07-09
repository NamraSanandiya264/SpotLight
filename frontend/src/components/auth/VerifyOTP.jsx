import { useEffect, useState } from "react";
import API from "../../services/api";
import { toast } from "react-toastify";

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

      await API.post("/users/verify-email", {
        email,
        otp,
      });

      toast.success("Email verified successfully.");

      onSuccess();

    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Invalid OTP"
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsResending(true);

      await API.post("/users/resend-otp", {
        email,
      });

      toast.success("A new OTP has been sent.");

      setCountdown(60);

    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Unable to resend OTP"
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <form
      onSubmit={handleVerifyOTP}
      className="register-form"
    >
      <h2>Verify Your Email</h2>

      <p className="otp-info">
        We sent a 6-digit verification code to

        <br />

        <strong>{email}</strong>
      </p>

      <div className="form-group">
        <label>Enter OTP</label>

        <input
          type="text"
          placeholder="123456"
          value={otp}
          onChange={(e) =>
            setOtp(
              e.target.value
                .replace(/\D/g, "")
                .slice(0, 6)
            )
          }
          required
          style={{
            letterSpacing: "5px",
            textAlign: "center",
            fontSize: "1.2rem",
          }}
        />
      </div>

      <button
        type="submit"
        className="signup-btn"
        disabled={isVerifying}
      >
        {isVerifying
          ? "Verifying..."
          : "Verify Email"}
      </button>

      <div className="otp-actions">

        {countdown > 0 ? (

          <p>

            Resend OTP in {countdown}s

          </p>

        ) : (

          <button
            type="button"
            className="signup-btn"
            onClick={handleResendOTP}
            disabled={isResending}
          >
            {isResending
              ? "Sending..."
              : "Resend OTP"}
          </button>

        )}

      </div>

      <div className="login-redirect">

        <p
          onClick={onBack}
          style={{
            cursor: "pointer",
            color: "#2563eb",
          }}
        >
          ← Back
        </p>

      </div>

    </form>
  );
};

export default VerifyOTP;