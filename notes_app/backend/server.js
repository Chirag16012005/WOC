require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const connectDB = require("./config/db");
const authRoutes = require("./routers/authRoutes");
const noteRoutes = require("./routers/notes");

const app = express();
app.use(cors());
app.use(express.json());

connectDB();

app.use("/auth", authRoutes);
app.use("/notes", noteRoutes);

app.listen(5000, () => console.log("Server running"));
