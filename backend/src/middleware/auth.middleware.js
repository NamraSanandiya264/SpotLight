import jwt from "jsonwebtoken";
import User from "../modules/user/user.model.js"; // ✅ add this

export const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization; // ✅ use let

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Remove "Bearer "
    if (token.startsWith("Bearer ")) {
      token = token.split(" ")[1];
    }

    // FIRST verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // THEN find user
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // attach user to request
    req.user = user;

    next();
  } catch (error) {
    console.log(error); // helpful debug
    res.status(401).json({ message: "Invalid token" });
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      const userRole = req.user.role;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          message: "Access denied: insufficient permissions",
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
};