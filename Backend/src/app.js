const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Allowed origins (local + production)
const allowedOrigins = [
    "http://localhost:5173",
    "https://ai-interview-system-frontend.onrender.com",
];

// CORS configuration
app.use(
    cors({
        origin: function (origin, callback) {
            // allow server-to-server or postman requests
            if (!origin) return callback(null, true);

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            } else {
                console.log("❌ Blocked by CORS:", origin);
                return callback(null, false);
            }
        },
        credentials: true,
    })
);

// IMPORTANT: Do NOT use app.options("*") in modern Express (causes crash)

// Routes
const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes");

app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);

module.exports = app;
