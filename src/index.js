import dotenv from 'dotenv';
import connectDB from "./db/index.js";
// import app from "./utils/app.js"

dotenv.config({
    path: './env'
})

connectDB()
.then(() => {
    // console.log('Ser');
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port: ${process.env.PORT}`);

    })

})
.catch((err) => {
    console.log('Server Error: ' + err);
})













/*import express from 'express'
const app = express();


(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("Error: " + error);
        })
        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on port ${process.env.PORT}`);
            
        })
    } catch (error) {
        console.error("Error: " + error)
    }
})()
    */