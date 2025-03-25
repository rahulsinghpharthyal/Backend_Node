import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["GET","HEAD","PUT","PATCH","POST","DELETE"],
    credentials: true,
}));

app.use(express.json()); // we use limit also limi:16kb

//for encode the url 
app.use(express.urlencoded({extended: true})); // we use limit also limi:16kb
app.use(express.static("public"));
app.use(cookieParser());


// routes import 

import userRoute from './routes/user.route.js';


// routes declaration
app.use('/api/v1/users', userRoute);



export default app;