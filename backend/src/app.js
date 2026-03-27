import userRoutes from "./modules/user/user.routes.js";
import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/users", userRoutes);


app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

export default app;