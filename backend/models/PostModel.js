import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    name:{
      type:String,
      required:true
    },
    email:{
      type:String,
      required:true
    },
    companyName:{
      type:String,
      required:true
    },
    rounds:{
      type:Array,
      default:[]
    },
    yourAdvice:{
      type:String,
      default:''
    },
    likes:{
      type:Array,
      default:[]
    },
    comments:{
      type:Array,
      default:[]
    },
    verdict:{
      type:String,
      required:true
    },
    appliedOn:{
      type:String
    },
    isApproved:{
      type:Boolean,
      default:false
    },
    branch:{
      type:String,
      required:true
    }
  },
  {
    timestamps:true
  }
)

const Post = mongoose.model('Post',postSchema);

export default Post;