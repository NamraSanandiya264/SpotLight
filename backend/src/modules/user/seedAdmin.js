import mongoose from "mongoose";
import bcrypt from "bcryptjs"; 
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
const seedAdmin = async () => {
  try {
    // Connect securely to local or cloud MongoDB cluster
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/your_db_name");

    console.log("Checking for existing administrator accounts...");
    
    const adminExists = await mongoose.connection.db.collection("users").findOne({ email: "sbg_core@dau.ac.in" });
    
    if (adminExists) {
      console.log("The administrative profile account is already provisioned!");
      process.exit(0);
    }

    // Set a password for your shared core dashboard account access
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("sbg2026", salt);

    // Write the document directly into your MongoDB users collection
    await mongoose.connection.db.collection("users").insertOne({
      name: "SBG Core Member",
      email: "sbg_core@dau.ac.in",
      studentID: "202600000",
      password: hashedPassword,
      yearOfStudy: "N/A",
      branch: "B.Tech - 3rd Year",
      role: "sbg_core", 
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log("Shared account sbg_core@dau.ac.in successfully created in your database!");
    process.exit(0);
  } catch (err) {
    console.error("Critical failure seeding data:", err);
    process.exit(1);
  }
};

seedAdmin();