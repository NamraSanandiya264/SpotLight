import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
import app from "./src/app.js";
import connectDB from "./src/modules/config/db.js";
import cors from "cors";

app.use(cors());
connectDB();
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server at http://localhost:${PORT}`);
});