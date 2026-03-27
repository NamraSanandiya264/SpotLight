import userRoutes from "./modules/user/user.routes.js";
import roomRoutes from "./modules/room/room.routes.js";
import bookingRoutes from "./modules/booking/booking.routes.js";

app.use("/api/users", userRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);

import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

export default app;