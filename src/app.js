import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoute from "./routes/user.routes.js";
import productRoute from "./routes/product.routes.js";
import categoryRoute from "./routes/category.routes.js";
import orderRoute from "./routes/order.routes.js";

const app = new express();

app.use(cors({
    origin: ["https://urban-nest-app.netlify.app", "https://urban-nest-furniture.vercel.app"],
    credentials: true,
    methods: ["GET", "HEAD", "OPTIONS", "POST", "DELETE", "PUT", "PATCH"],
    allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/product", productRoute);
app.use("/api/v1/category", categoryRoute);
app.use("/api/v1/order", orderRoute);

export default app