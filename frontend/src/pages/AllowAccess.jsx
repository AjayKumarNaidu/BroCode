import { useEffect, useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";


// Heart Icon for likes
const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current text-gray-400" viewBox="0 0 24 24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

// Comment Icon
const CommentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current text-gray-600" viewBox="0 0 24 24">
    <path d="M21 4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V6c0-1.1-.9-2-2-2z"/>
  </svg>
);

// Share Icon for links
const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block ml-1" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.52.47 1.2.77 1.96.77 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.87c-.52-.47-1.2-.77-1.96-.77-1.66 0-3 1.34-3 3s1.34 3 3 3c.76 0 1.44-.3 1.96-.77l7.1 4.11c-.05.23-.09.46-.09.7 0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3z" />
  </svg>
);

// Individual interview round component for better modularity
const InterviewRound = ({ round }) => (
  <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-4">
    <h3 className="text-xl font-semibold text-gray-800 mb-2">{round.roundName}</h3>
    <p className="text-gray-700 leading-relaxed">{round.summary}</p>
    {round.links && round.links.length > 0 && (
      <div className="mt-4 p-4 bg-gray-200 rounded-md">
        <h4 className="font-bold text-gray-800 mb-2">Helpful Resources:</h4>
        <div className="space-y-2">
          {round.links.map((link, i) => (
            <div key={i} className="flex items-center text-sm">
              <span className="h-2 w-2 bg-blue-600 rounded-full mr-2"></span>
              <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors flex items-center">
                {link} <ShareIcon />
              </a>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

function AllowAccess() {
  //imp
  const URI = "http://localhost:5000";

  const navigate = useNavigate();

  const [authorized,setAuthorized] = useState(null);

  useEffect(() => {
    const fetchAdminDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${URI}/api/user/allowAccess`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if(res.data.success){
          setAuthorized(true)
        }else{
          setAuthorized(false)
        }
        console.log("Admin data:", res.data);
      } catch (err) {
        setAuthorized(false);
        console.log("Error:",err.message);
      }
    };

    fetchAdminDashboard();
  }, []);

  //imp

  //to get all posts from backend
  useEffect(()=>{
    const fetchData = async ()=>{
      try {
        const newdata = await axios.get(`${URI}/api/posts/getPosts`)
        console.log(newdata.data.message);
        setAllPosts(newdata.data.message);
      } catch (error) {
        console.log(error);
      }
    }
    fetchData();
  },[])

  const [allPosts,setAllPosts] = useState([]);
  const [pendingPosts, setPendingPosts] = useState([]);
  const [expandedPosts, setExpandedPosts] = useState({});

  // Filter posts on component load
  useEffect(() => {
    setPendingPosts(allPosts.filter(post => post.isApproved === false));
  }, [allPosts]);

  const handleApprove = async(postId) => {
    try {
      const newdata = await axios.put(`${URI}/api/posts/updateIsApproved/${postId}`);
      if(newdata.data.success){
        console.log(`Post with ID ${postId} has been approved.`);
        setPendingPosts(pendingPosts.filter(post => post._id !== postId));
      }
    } catch (error) {
      console.log(error.message)
    }
    
  };

  const handleDelete = async(postId) => {
    try {
      const newdata = await axios.delete(`${URI}/api/posts/delete/${postId}`);
      if(newdata.data.success){
        console.log(`Post with ID ${postId} has been deleted.`);
        setPendingPosts(pendingPosts.filter(post => post._id !== postId));
      }
    } catch (error) {
      console.log(error.message)
    }
  };

  const formatToIST = (utcDateString) => {
    if (!utcDateString) return "N/A";
    return new Date(utcDateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    });
  };

  const toggleExpand = (postId) => {
    setExpandedPosts(prevState => ({
      ...prevState,
      [postId]: !prevState[postId]
    }));
  };

  if(authorized == null) return <h1>Loading</h1>;

  if(authorized == false) return <h1>Unauthorized access</h1>;


  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white p-4 shadow-md flex justify-between items-center fixed w-full top-0 z-10">
        <div className="flex items-center space-x-6">
          <span className="text-2xl font-bold text-gray-900 cursor-pointer" onClick={()=>navigate('/')}>BroCode</span>
        </div>
        <div>
          <a onClick={()=>navigate('/')} className="py-2 px-4 rounded-md text-sm font-bold text-white bg-green-500 hover:bg-green-600 transition-colors cursor-pointer">
            Back to Home
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center p-6 pt-10 mt-10 md:mt-20">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Pending Posts</h1>
        
        <div className="w-full max-w-4xl space-y-6">
          {pendingPosts.length > 0 ? (
            pendingPosts.map((post) => (
              <div key={post._id} className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800">{post.companyName}</h2>
                    <p className="text-sm text-gray-500">Posted by {post.name} | {post.branch}</p>
                    <p className="text-sm text-gray-500 mt-1">Applied: {post.appliedOn}</p>
                    <p className="text-sm text-gray-500 mt-1">Date: {formatToIST(post.createdAt)}</p>
                  </div>
                  <div className={`py-1 px-4 rounded-full text-white font-bold text-sm ${post.verdict === "Selected" ? "bg-green-500" : post.verdict === "Not Selected" ? "bg-red-500" : "bg-blue-500"}`}>
                    {post.verdict}
                  </div>
                </div>

                {/* Conditional Detailed View */}
                {expandedPosts[post._id] ? (
                  <>
                    <hr className="my-6" />
                    <div className="space-y-6">
                      {post.rounds.map((round, index) => (
                        <InterviewRound key={index} round={round} />
                      ))}
                    </div>

                    {post.yourAdvice && (
                      <div className="bg-green-50 p-6 rounded-lg shadow-inner mt-6">
                        <h3 className="text-xl font-bold text-green-800 mb-2">My Advice</h3>
                        <p className="text-gray-700 leading-relaxed italic">{post.yourAdvice}</p>
                      </div>
                    )}
                    <hr className="my-6" />
                    <div className="flex space-x-6 items-center">
                      <div className="flex items-center space-x-1 text-gray-600">
                        <HeartIcon />
                        <span>{post.likes.length} Likes</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <CommentIcon />
                        <span>{post.comments.length} Comments</span>
                      </div>
                    </div>
                  </>
                ) : null}

                <div className={`flex justify-end mt-4 space-x-4 ${expandedPosts[post._id] ? '' : 'border-t pt-4'}`}>
                  <button
                    onClick={() => toggleExpand(post._id)}
                    className="py-2 px-4 rounded-md text-sm font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
                  >
                    {expandedPosts[post._id] ? 'View Less' : 'View More'}
                  </button>
                  <button
                    onClick={() => handleApprove(post._id)}
                    className="py-2 px-4 rounded-md text-sm font-bold text-white bg-green-500 hover:bg-green-600 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="py-2 px-4 rounded-md text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-8 text-gray-500 bg-white rounded-lg shadow-md">
              <p>No pending posts to review at the moment.</p>
            </div>
          )}
        </div>
      </main>

      {/* Tailbar / Footer */}
      <footer className="bg-white py-12 text-center text-gray-600 text-sm shadow-inner mt-auto">
        <p className="mb-2 text-base">BroCode. All Rights Reserved. | Connecting students and alumni for a brighter future.</p>
        <p className="text-sm">This platform is a community-driven space for sharing knowledge and experiences. We are not affiliated with any specific company or university.</p>
      </footer>
    </div>
  );
}


export default AllowAccess;
