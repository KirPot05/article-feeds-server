import * as dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();
const mongooseUrl = process.env.DB_URL;


const db = () => {
    mongoose.connect(mongooseUrl, () => {
        console.log("Sucessfully Connected with DataBase");
    })
};

export default db;