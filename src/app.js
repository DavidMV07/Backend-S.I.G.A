import express from "express";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import dotenv from "dotenv";
import cors from "cors";
import adminUserRoutes from "./routes/adminUserRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import fs from "fs";


dotenv.config({path: './.env'});

console.log("MONGODB_URI LOADED:", process.env.MONGODB_URI);
console.log("JWT_SECRET LOADED:", process.env.JWT_SECRET);
console.log("EXISTS .env:", fs.existsSync("./.env"));
console.log("CWD:", process.cwd());

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: "GET,POST,PUT,DELETE",
  allowedHeaders: "Content-Type,Authorization"
}));
app.use(express.json());


mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));


  app.use("/api/auth", authRoutes);
  app.use("/api/admin/users", adminUserRoutes);
  app.use("/api/courses", courseRoutes);
  app.use("/api/enrollments", enrollmentRoutes);

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });