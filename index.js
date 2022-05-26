import * as dotenv from 'dotenv';
dotenv.config();
import express, {urlencoded, json} from 'express';
import db from './db.js';
import cors from 'cors';


const app = express();
const port = process.env.PORT;


db();


import authRoutes from './routes/auth.js';
import articleRoutes from './routes/articles.js';



app.use(urlencoded({extended: true}));
app.use(json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);



app.listen(port, () => {
    console.log("App running");
});