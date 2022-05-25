import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();
const mongooseUrl = process.env.MONGOOSE_CONNECTION_STRING;


const db = () => {
    mongoose.connect(mongooseUrl, () => {
        console.log("Sucessfully Connected with DataBase");
    })
};

export default db;