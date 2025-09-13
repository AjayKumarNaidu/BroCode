import express from 'express'
import nodemailer from "nodemailer";
import user from '../models/UserModel.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import validator from 'validator'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

//user registration
router.post('/register',async (req,res)=>{
  try {
    const {name,email,password,passoutYear,branch} = req.body;

    if(!validator.isEmail(email)) {
      return res.json({success: false, message:"Invalid email format" });
    }

    // check if email already exists
    const existingUser = await user.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password,10)
    const newuser = new user({name,email,password:hashedPassword,passoutYear,branch})
    await newuser.save()

    res.json({success:true,message:newuser})
  } catch (error) {
    res.json({success:false,message:error.message})
  }
})

//user login
router.post('/login',async(req,res)=>{
  try {
    const {email,password} = req.body
    const newuser = await user.findOne({email})
    if(!newuser){
      return res.json({success:false,message:'user not found'})
    }

    const isValid = await bcrypt.compare(password,newuser.password)
    if(!isValid){
      return res.json({success:false,message:'user credentials are false'})
    }

    const token = jwt.sign({ role: newuser.role , email: newuser.email },process.env.JWT_SECRET,{ expiresIn: "7d" });// expires after 7 days);

    return res.json({success:true,message:token})

  } catch (error) {
    res.json({success:false,message:error.message})
  }
})

// Only admin can see allowAccess page
router.get("/allowAccess", authMiddleware(["admin"]), (req, res) => {
  res.json({
    success: true,
    message: "Welcome Admin! You have full access.",
    user: req.user,
  });
});


// Only admin can see allowFeedback page
router.get("/allowFeedback", authMiddleware(["admin"]), (req, res) => {
  res.json({
    success: true,
    message: "Welcome Admin! You have full access.",
    user: req.user,
  });
});

//get single user data
router.get('/user/:email',async(req,res)=>{
  try {
    const {email,secretKey} = req.params;

    const newuser = await user.findOne({email});
    return res.json({success:true,message:newuser});
  } catch (error) {
    res.json({success:false,message:error.message})
  }
})

//get all users
router.get('/users',async(req,res)=>{
  try {
    const newuser = await user.find({});
    return res.json({success:true,message:newuser});
  } catch (error) {
    res.json({success:false,message:error.message})
  }
})

//updating linkedUrl
router.put('/linkedUrl/:id',async(req,res)=>{
  try {
    const {id} = req.params;
    const {linkedUrl} = req.body;
    const newuser = await user.findByIdAndUpdate(id,{linkedUrl},{new:true,runValidators: true})
    return res.json({success:true,message:newuser});
  } catch (error) {
    res.json({success:false,message:error.message})
  }
})

//sending otp for admin login purpose
router.post("/send-otp", async (req, res) => {
  try {
    const { email , secretKey} = req.body;
    console.log(email,secretKey);
    if (
    !(email === process.env.ADMIN_EMAIL &&
    secretKey === process.env.ADMIN_SECRET)
  ){
    return res.json({ success: false, message: "Invalid admin credentials" });
  }

    // generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // save OTP in DB (update user or create new record)
    const newuser = await user.findOneAndUpdate(
      { email },
      { otp },
      { new: true, upsert: true }
    );

    // setup nodemailer transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ADMIN_EMAIL, // your Gmail
        pass: process.env.EMAIL_PASS, // app password
      },
    });

    // email options
    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    };

    // send email
    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

// Admin Login (no DB, only .env check)
router.post("/adminLogin", async(req, res) => {
  try {
    const { email , otp } = req.body;
    if ( email === process.env.ADMIN_EMAIL) {
      const newuser = await user.findOne({email});
      if(newuser.otp === Number(otp)){
        const token = jwt.sign(
          { role: "admin", email },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );
        return res.json({ success: true, message:token });
      }
      return res.json({success:false,message:"Invalid credentials"})
    }
    res.json({ success: false, message: "Invalid credentials" });
  } catch (error) {
    req.json({success:true,message:error.message})
  }
});


export default router;