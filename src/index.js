import app from './app.js';
import dbConnection from './database/dbConncetion.js';



const PORT = process.env.PORT || 8000;
app.listen(PORT, async ()=>{
    await dbConnection();
    console.log(`Server running at ${PORT}`)
});
















/*
// This is IIFE function (Immedeate invoke function expression)
(async () => {
  try {
    const db = await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
    console.log(
      `Database "${db.connection.name}" connected with ${db.connection.host} in port ${db.connection.port}`
    );
    app.on("error", (error)=> {
      console.log("Error", error)
      throw error;
    });
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.log(`Database connection failed ${error}`);
    throw error;
  }
})();

export default dbConnection;
*/