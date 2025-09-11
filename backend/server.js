import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import UserRoutes from './routes/UserRoutes.js'
import PostRoutes from './routes/PostRoutes.js'
import FeedbackRoutes from './routes/FeedbackRoutes.js'
import dotenv from 'dotenv';

const app = express();
dotenv.config();

app.use(express.json());
app.use(cors({
  origin: ["https://your-frontend.onrender.com","http://localhost:5173"], // frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use('/api/user',UserRoutes);
app.use('/api/posts',PostRoutes);
app.use('/api/feedback',FeedbackRoutes)


const PORT = 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));


app.listen(PORT,()=>{
  console.log(`app is running on server ${PORT}`);
})

//react toastify. /
//adding confirm password in register page. /
//adding nodemailer for admin otp.
//responsive web design.