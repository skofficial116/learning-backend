import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';

const connectDB = async () => {
    try {
        console.log('Connecting to MongoDB...');

        // Corrected connection string
        const connectionString = process.env.MONGODB_URI; //Use the full URI.
        const connectionInstance = await mongoose.connect(connectionString, {
            dbName: DB_NAME, // specify the database name in the options object.
        });

        console.log(`\n MONGODB connected!! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error('MONGODB Connection error: ', error);
        process.exit(1);
    }
};

export default connectDB;