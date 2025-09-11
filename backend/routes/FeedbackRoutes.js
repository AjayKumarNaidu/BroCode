import express from 'express';
const router = express.Router();
import Feedback from '../models/FeedbackModel.js';

//to post a new feedback
router.post('/post',async(req,res)=>{
  try {
    const newdata = Feedback(req.body);
    await newdata.save();

    return res.json({success:true,message:"Feedback Sent"})
  } catch (error) {
    return res.json({success:false,message:error.message})
  }
})

//to get all feedbacks
router.get('/all',async(req,res)=>{
  try {
    const newdata = await Feedback.find({});
    return res.json({success:true,message:newdata})
  } catch (error) {
    return res.json({success:false,message:error.message})
  }
})

export default router;