import express from 'express'
import post from "../models/PostModel.js"

const router = express.Router();

//posting the post
router.post('/post',async (req,res)=>{
  try {
    const {name,email,companyName,rounds,likes,comments,verdict,appliedOn,isApproved,branch,yourAdvice} = req.body;

    const newpost = new post({name,email,companyName,rounds,likes,comments,verdict,appliedOn,isApproved,branch,yourAdvice});
    await newpost.save();
    return res.json({success:true,message:newpost});
  } catch (error) {
    return res.json({success:false,message:error.message});
  }
})

//get all posts
router.get('/getPosts',async(req,res)=>{
  try {
    const newposts = await post.find({});
    return res.json({success:true,message:newposts});
  } catch (error) {
    return res.json({success:false,message:error.message});
  }
})

//getting individual post
router.get('/getPost/:id',async(req,res)=>{
  try {
    const {id} = req.params;
    const newpost = await post.findById(id);
    res.json({success:true,message:newpost});
  } catch (error) {
    return res.json({success:false,message:error.message});
  }
})

//updating a post (at user profile if he want something to change)
router.put('/update/:id',async(req,res)=>{
  try {
    const {id} = req.params;
    const newpost = await post.findByIdAndUpdate(id,req.body,{new:true})
    
    if(!newpost){
      return res.json({success:false,message:'Post not found'});
    }

    return res.json({success:true,message:newpost});

  } catch (error) {
    return res.json({success:false,message:error.message});
  }
})

//delete a post (this is at user or else at admin)
router.delete('/delete/:id',async(req,res)=>{
  try {
    const {id} = req.params;
    const newpost = await post.findByIdAndDelete(id);

    if (!newpost) {
      return res.json({ success: false, message: "Post not found" });
    }

    return res.json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    return res.json({success:false,message:error.message});
  }
})

//updating the likes array
//adding new likes
router.put("/addLike/:id", async (req, res) => {
  try {
    const { name } = req.body; // user who liked
    const postId = req.params.id;

    // check if user already liked
    const post1 = await post.findById(postId);

    if (!post1.likes.includes(name)) {
      post1.likes.push(name);
      await post1.save();
      return res.json({ success: true, message: "Post liked", likes: post1.likes });
    }
  } catch (err) {
    return res.json({success:false,message:error.message});
  }
});
//deleting the existing likes
router.put("/removeLike/:id", async (req, res) => {
  try {
    const { name } = req.body; 
    const postId = req.params.id;

    await post.findByIdAndUpdate(
      postId,
      { $pull: { likes: name } }, // removes user from array
      { new: true }
    )

    res.json({
      success: true,
      message: "Like removed successfully"
    });

  } catch (err) {
    return res.json({success:false,message:error.message});
  }
});

//adding new comments
router.put('/addComment/:id',async(req,res)=>{
  try {
    const {name,comment} = req.body;
    const postId = req.params.id;

    const post1 = await post.findById(postId);
    post1.comments.push({name,comment});
    await post1.save();

    return res.json({succes:true,message:"comment added",comment:post1.comments})

  } catch (error) {
    return res.json({success:false,message:error.message});
  }
})

//deleting a comment
router.put('/deleteComment/:id/:index', async (req, res) => {
  try {
    const { id, index } = req.params;

    const post1 = await post.findById(id);
    if (!post1) return res.status(404).json({ success: false, message: "Post not found" });

    post1.comments.splice(index, 1); // remove by index
    await post1.save();

    return res.json({ success: true, message: "Comment deleted", comments: post1.comments });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
});

//updating the isApproved at Admin end.
router.put('/updateIsApproved/:id',async(req,res)=>{
  try {
    const {id} = req.params;
    const newpost = await post.findByIdAndUpdate(id,{isApproved:true},{new:true});
    return res.json({success:true,message:newpost});
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
})


export default router;

/*
{
    "email":"iajaykumar37@gmail.com",
    "name":"ajay",
    "companyName":"Josh",
    "rounds":[
        {
            "roundName":"round1",
            "summary":"summary1",
            "links":["url1","url2"]
        },
        {
            "roundName":"round2",
            "summary":"summary2",
            "links":["url1","url2"]
        }
    ],
    "likes":["like1","like2"],
    "comments":[
        {
            "name":"name1",
            "comment":"comment1"
        },
        {
            "name":"name2",
            "comment":"comment2"
        }
    ],
    "verdict":"Not selected"
}
*/