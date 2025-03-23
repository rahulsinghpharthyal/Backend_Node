import express from 'express';
import dbConnection from './database/dbConncetion.js';
const app = express();


const PORT = process.env.PORT || 8000;
app.listen(PORT, async ()=>{
    await dbConnection();
    console.log(`Server running at ${PORT}`)
});