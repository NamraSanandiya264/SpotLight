import dotenv from "dotenv";
dotenv.config();
import app from "./src/app.js";
import connectDB from "./src/modules/config/db.js";
import cors from "cors";

app.use(cors());
connectDB();
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server at http://localhost:${PORT}`);
});