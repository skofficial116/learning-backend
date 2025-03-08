import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16kb" })) //to set the lmit tojson fle from url
app.use(cookieParser())// to get the encodr for the url
app.use(express.static("public"))

export default { app };