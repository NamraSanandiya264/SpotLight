import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./src/modules/config/db.js";

dotenv.config();
connectDB();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server at http://localhost:${PORT}`);
});