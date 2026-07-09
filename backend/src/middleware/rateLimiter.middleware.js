import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes

  max: 10,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    message: "Too many requests. Please try again after 15 minutes.",
  },
});