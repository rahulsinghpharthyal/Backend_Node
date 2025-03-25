import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';

const dbConnection = async () => {
    try{
        const db = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
        console.log(`Database naem: "${db.connection.name}" connected with DB HOST: ${db.connection.host} in port: ${db.connection.port}`);
    }catch(error){
        console.log(`Database connection failed ${error}`);
        process.exit(1);
    }
}

export default dbConnection;