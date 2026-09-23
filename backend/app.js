import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import authrouter from "./routes/authRouter.js";
import itemrouter from "./routes/itemRouter.js";
import invoicerouter from "./routes/invoiceRouter.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/Auth", authrouter);
app.use("/api/Item", itemrouter);
app.use("/api/Invoice", invoicerouter);


app.get("/", (req, res) => {
  res.json({
    message: "Invoice API is running",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});