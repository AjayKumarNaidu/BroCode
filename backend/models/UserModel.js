import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name:{
      type:String,
      required:true
    },
    email:{
      type:String,
      required:true
    },
    password:{
      type:String,
      required:true
    },
    passoutYear:{
      type:Number,
      required:true
    },
    branch:{
      type:String,
      required:true
    },
    linkedUrl:{
      type:String,
      default:''
    },
    role:{
      type:String,
      default:"user"
    },
    otp:{
      type:Number
    }
  },
  {
    timestamps:true
  }
)

const User = mongoose.model('User',userSchema);
export default User;