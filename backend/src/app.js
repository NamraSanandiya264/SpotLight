import userRoutes from "./modules/user/user.routes.js";
import express from "express";
import cors from "cors";
import bookingRoutes from "./modules/booking/booking.routes.js";
import roomRoutes from "./modules/room/room.routes.js";
import organizationRoutes from "./modules/organizations/organization.routes.js";
import eventRoutes from "./modules/events/event.routes.js";
import noticeRoutes from "./modules/notice/notice.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/events", eventRoutes);
app.use('/uploads', express.static('uploads'));
app.use("/api/notices", noticeRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});


export default app;