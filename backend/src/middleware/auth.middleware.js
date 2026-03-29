/*

User registers
User logs in → gets token
User sends token
Middleware checks token
Access granted or denied;

*/
import jwt from "jsonwebtoken";


export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = user; // store user info
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};