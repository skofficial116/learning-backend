import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
// app.use(cors({
//     origin: process.env.CORS_ORIGIN,
//     credentials: true
// }))

app.use(cors({
    origin: (origin, callback) => {
        callback(null, origin || "*");  // Allow all origins
    },
    credentials: true
}));


app.use(express.json({ limit: "16kb" }))
app.use(cookieParser())
app.use(express.static("public"))


import userRouter from "./routes/user.routes.js";
app.use("/users", userRouter)



export { app };