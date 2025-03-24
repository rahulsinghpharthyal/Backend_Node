import express from 'express';
// import cors from 'cors';
import dbConnection from './database/dbConncetion.js';
const app = express();


// app.use(cors());
// get a list of 5 jokes

app.get('/api/jokes', (req, res)=>{
    const jokes = [
        {
          id: 1,
          title: "Programming Humor",
          content: "Why do programmers prefer dark mode? Because light attracts bugs!"
        },
        {
          id: 2,
          title: "Math Joke",
          content: "Why was the equal sign so humble? Because it knew it wasn’t less than or greater than anyone else."
        },
        {
          id: 3,
          title: "Coffee Addiction",
          content: "Why did the coffee file a police report? It got mugged!"
        },
        {
          id: 4,
          title: "Tech Troubles",
          content: "Why was the computer cold? It left its Windows open!"
        },
        {
          id: 5,
          title: "Time Management",
          content: "Why did the calendar look so stressed? It had too many dates!"
        }
      ];
    return res.send(jokes);

})

const PORT = process.env.PORT || 8000;
app.listen(PORT, async ()=>{
    await dbConnection();
    console.log(`Server running at ${PORT}`)
});