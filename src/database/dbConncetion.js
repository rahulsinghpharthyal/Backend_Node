import mongoose from 'mongoose';

const dbConnection = async () => {
    try{
        const db = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Database "${db.connection.name}" connected with ${db.connection.host} in port ${db.connection.port}`);
    }catch(error){
        console.log(`Database connection failed ${error}`);
    }
}

export default dbConnection;