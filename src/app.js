import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(cookieParser())
app.use(express.static("public"))


import userRouter from "./routes/user.routes.js";
app.use("/users", userRouter)

import timetableRouter from "./routes/timetable.routes.js";
app.use("/timetable", timetableRouter)



export { app };