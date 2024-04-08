import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectToDb = (): void => {
    mongoose.connect(process.env.MONGO_DB_URI as string)
        .then(() => {
            console.log("MongoDB connected");
        })
        .catch((error: Error) => {
            console.error(error);
        });
};

export default connectToDb;