import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import { toast } from 'react-toastify';

// More accurate SVG for like (heart)
const HeartIcon = ({ isLiked }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 fill-current ${isLiked ? 'text-red-500' : 'text-gray-400'}`} viewBox="0 0 24 24">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

// More accurate SVG for comments (speech bubble)
const CommentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current text-gray-600" viewBox="0 0 24 24">
    <path d="M21 4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V6c0-1.1-.9-2-2-2z" />
  </svg>
);

// New Share Icon for links
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

const Interview = () => {


  //common fields
  const URI = 'https://brocode-t04c.onrender.com'

  const navigate = useNavigate();

  const { id } = useParams();

  const [currentUser, setCurrentUser] = useState('');
  const [currentUserData, setCurrentUserData] = useState();
  const [toggleComment, setToggleComment] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setCurrentUser(decoded.email);
    }

    const fetchCurrentUserData = async () => {
      try {
        const newdata = await axios.get(`${URI}/api/user/user/${currentUser}`);
        if (newdata.data.success) {
          setCurrentUserData(newdata.data.message);
        }
      } catch (error) {
        console.log(error.message)
      }
    }

    fetchCurrentUserData()
  }, [currentUser])

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    toast.success('Logout Successfully!');
    navigate('/login');
  }
  //common fields

  const [post, setPost] = useState({
    "email": "",
    "name": "",
    "companyName": "",
    "appliedOn": "",
    "branch": "",
    "createdAt": "",
    "rounds": [],
    "likes": [],
    "comments": [],
    "verdict": "",
    "isApproved": true,
    "yourAdvice": ""
  });

  const [newComment, setNewComment] = useState('');

  const toggleLike = async () => {
    const isLiked = post.likes.includes(currentUser);

    const endpoint = isLiked ? `${URI}/api/posts/removeLike/${id}` : `${URI}/api/posts/addLike/${id}`;
    let updatedLikes;

    try {
      const response = await axios.put(endpoint, {
        name: currentUser,
      });
      if (response.data.success) {
        if (isLiked) {
          updatedLikes = post.likes.filter(user => user !== currentUser);
        } else {
          updatedLikes = [...post.likes, currentUser];
        }
        setPost({ ...post, likes: updatedLikes });
      }
    } catch (error) {
      console.log(error.message)
    }
  };

  const handleCommentSubmit = async () => {
    if (newComment.trim() === '') return;

    try {
      const response = await axios.put(`${URI}/api/posts/addComment/${id}`, {
        name: currentUserData.name, // Assuming your API accepts 'name' for the commenter
        comment: newComment,
      });

      if (response.data.success) {
        await fetchCurrentPost(); // get fresh post with updated comments
      }
      setToggleComment(prev => !prev);
      setNewComment('');

    } catch (error) {
      console.log(error.message)
    }
  };

  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    })
    : '';

  const fetchCurrentPost = async () => {
    try {
      const newdata = await axios.get(`${URI}/api/posts/getPost/${id}`);
      if (newdata.data.success) {
        setPost(newdata.data.message)
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  useEffect(() => {
    console.log('id:', id)
    fetchCurrentPost();
  }, [toggleComment])

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const NavLink = ({ to, text, isButton = false, onClick }) => {
    const classes = `font-semibold transition-colors cursor-pointer text-gray-800 hover:text-green-600 ${isButton ? 'py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-bold text-white bg-green-500 hover:bg-green-600 hover:text-white' : 'text-xs sm:text-base'
      }`;

    const handleClick = (e) => {
      if (onClick) {
        onClick(e);
      } else {
        navigate(to);
      }
      setIsMenuOpen(false); // Close menu on click
    };

    return (
      <a onClick={handleClick} className={classes}>
        {text}
      </a>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="bg-white p-4 shadow-md flex justify-between items-center fixed w-full top-0 z-10">
        <div className="flex items-center space-x-2 sm:space-x-6">
          <span className="text-xl sm:text-2xl font-bold text-gray-900 cursor-pointer" onClick={() => navigate('/')}>BroCode</span>
          {/* Desktop Links */}
          <div className="hidden sm:flex items-center space-x-6">
            <NavLink to="/" text="Home" />
            <NavLink to="/interviews" text="Interviews" />
            <NavLink to="/feedback" text="Feedback" />
          </div>
        </div>

        {/* User Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Desktop Buttons */}
          <div className="hidden sm:flex items-center space-x-2 sm:space-x-4">
            <NavLink to="/post" text="Post" isButton={true} />
            <NavLink to="/profile" text="Profile" isButton={true} />
            <NavLink text="Logout" isButton={true} onClick={handleLogout} />
          </div>
          {/* Mobile Menu Button */}
          <button className="sm:hidden text-gray-800" onClick={() => setIsMenuOpen(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      <div className={`fixed inset-0 z-20 transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out sm:hidden`}>
        <div className="bg-white w-full h-full p-6 shadow-lg flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-gray-900">BroCode</span>
            <button onClick={() => setIsMenuOpen(false)} className="text-gray-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <hr className="my-2" />
          <NavLink to="/" text="Home" />
          <NavLink to="/interviews" text="Interviews" />
          <NavLink to="/feedback" text="Feedback" />
          <NavLink to="/post" text="Post" isButton={true} />
          <NavLink to="/profile" text="Profile" isButton={true} />
          <NavLink text="Logout" isButton={true} onClick={handleLogout} />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center p-6 pt-10 mt-10 md:mt-20">
        <div className="w-full max-w-4xl space-y-6">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{post.companyName} Interview Experience</h1>
                <p className="text-sm text-gray-500 mt-2">
                  Posted by <span className="font-semibold">{post.name}</span> | <span className="font-semibold">{post.branch}</span>
                </p>
                <p className="text-sm text-gray-500 mt-1">Applied: <span className="font-semibold">{post.appliedOn}</span></p>
                {formattedDate && (
                  <p className="text-sm text-gray-500 mt-1">Posted on: {formattedDate}</p>
                )}
              </div>
              <div className={`py-1 px-4 rounded-full text-white font-bold text-xs sm:text-sm md:text-base text-center break-words max-w-[150px] 
                ${post.verdict === "Selected"
                  ? "bg-green-500"
                  : post.verdict === "Not Selected"
                    ? "bg-red-500"
                    : "bg-blue-500"}`}>
                {post.verdict}
              </div>
            </div>

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
              {/* Likes section */}
              <div
                className="flex items-center space-x-1 text-gray-600 cursor-pointer"
                onClick={toggleLike}
              >
                <HeartIcon isLiked={post.likes.includes(currentUser)} />
                <span>{post.likes.length} Likes</span>
              </div>

              {/* Comments section */}
              <div className="flex items-center space-x-1 text-gray-600 cursor-pointer">
                <CommentIcon />
                <span>{post.comments.length} Comments</span>
              </div>
            </div>

            {/* Expandable comments */}
            <div className="mt-4 border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Comments</h3>
              {post.comments.length > 0 ? (
                post.comments.map((comment, i) => (
                  <div key={i} className="mb-2">
                    <p className="font-semibold text-gray-700">{comment.name}:</p>
                    <p className="text-gray-600">{comment.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No comments yet. Be the first to comment!</p>
              )}
              <div className="mt-4 flex space-x-2">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleCommentSubmit}
                  className="py-2 px-4 rounded-md text-sm font-bold text-white bg-green-500 hover:bg-green-600 transition-colors"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Tailbar / Footer */}
      <footer className="bg-white py-12 text-center text-gray-600 text-sm shadow-inner mt-auto">
        <p className="mb-2 text-base">BroCode. All Rights Reserved. | Connecting students and alumni for a brighter future.</p>
        <p className="text-sm">This platform is a community-driven space for sharing knowledge and experiences. We are not affiliated with any specific company or university.</p>
      </footer>
    </div>
  );
};

export default Interview;
