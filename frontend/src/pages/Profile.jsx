import React, { useState,useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {jwtDecode} from "jwt-decode";
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

// LinkedIn Icon
const LinkedinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 fill-current text-blue-700" viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.765s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.765-1.75 1.765zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

// Delete Icon for comments
const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current text-gray-400 hover:text-red-500 transition-colors cursor-pointer" viewBox="0 0 24 24">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
);

const Profile = () => {

  //common fields
    const URI = 'https://brocode-t04c.onrender.com'

    const navigate = useNavigate();

    const [currentUser,setCurrentUser] = useState('');
    const [userData,setUserData] = useState({

    });

    useEffect(()=>{
      const token = localStorage.getItem("token");
      if (token) {
        const decoded = jwtDecode(token);
        setCurrentUser(decoded.email);
      }

      const fetchCurrentUserData = async()=>{
        try {
          const newdata = await axios.get(`${URI}/api/user/user/${currentUser}`);
          if(newdata.data.success){
            setUserData(newdata.data.message);
          }
          console.log(userData)
        } catch (error) {
          console.log(error.message)
        }
      }

      fetchCurrentUserData()
    },[currentUser])

    const handleLogout = (e)=>{
      e.preventDefault();
      localStorage.removeItem('token');
      toast.success('Logout Successfully!');
      navigate('/login');
    }
    //common fields

  const [expandedComments, setExpandedComments] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  // State for the new LinkedIn URL input field
  const [newLinkedinUrl, setNewLinkedinUrl] = useState('');

  // Separate state for user's posts
  const [postsData, setPostsData] = useState([]);

  const [filteredPosts,setFilteredPosts] = useState([]);

  const toggleComments = (id) => {
    setExpandedComments(prevState => ({
      ...prevState,
      [id]: !prevState[id]
    }));
  };

  const handleConfirmDelete = async() => {
    if (postToDelete) {
      try {
        const newdata = await axios.delete(`${URI}/api/posts/delete/${postToDelete}`);
        if(newdata.data.success){
          const updatedPosts = postsData.filter(post => post._id !== postToDelete);
          setPostsData(updatedPosts);
          setPostToDelete(null);
          setShowDeleteModal(false);
          toast.success('Post deleted!');
        }
      } catch (error) {
        console.log(error.message);
      }
    }
  };

  const handleCancelDelete = () => {
    setPostToDelete(null);
    setShowDeleteModal(false);
  };

  const handlePostDeleteClick = (postId) => {
    setPostToDelete(postId);
    setShowDeleteModal(true);
  };

  const handleCommentDelete = async(postId, commentIndex) => {
    try {
      const newdata = await axios.put(`${URI}/api/posts/deleteComment/${postId}/${commentIndex}`);
      if(newdata.data.success){
        const updatedPosts = postsData.map(post => {
          if (post._id === postId) {
            const newComments = post.comments.filter((_, i) => i !== commentIndex);
            return { ...post, comments: newComments };
          }
          return post;
        });
        setPostsData(updatedPosts);
      }
    } catch (error) {
      console.log(error.message)
    }
  };

  const handleUpdate = (postId) => {
    console.log(`Updating post with ID: ${postId}`);
    navigate(`/updatePost/${postId}`)
    // Implement update logic here, e.g., an API call or navigation to an edit page
  };

  const handleLinkedinSave = async() => {
    // You would typically make an API call here to update the user's LinkedIn URL
    try {
      const newdata = await axios.put(`${URI}/api/user/linkedUrl/${userData._id}`,{linkedUrl:newLinkedinUrl});
      if(newdata.data.success){
        setUserData(prevState => ({ ...prevState, linkedUrl: newLinkedinUrl }));
        setNewLinkedinUrl('');
      }
   } catch (error) {
      console.log(error.message)
    }
    
  };

  useEffect(()=>{
    const fetchUserPosts = async()=>{
      try {
        const newdata = await axios.get(`${URI}/api/posts/getPosts`)
        if(newdata.data.success){
          setPostsData(newdata.data.message);
        }
      } catch (error) {
        console.log(error.message)
      }
    }
    fetchUserPosts();
  },[])

  useEffect(() => {
    setFilteredPosts(postsData.filter(post => post.email === currentUser));
  }, [postsData, currentUser]);


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
        <div className="w-full max-w-4xl space-y-8">
          {/* User Profile Section */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">My Profile</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
              <p>
                <span className="font-semibold">Name:</span> {userData.name}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {userData.email}
              </p>
              <p>
                <span className="font-semibold">Branch:</span> {userData.branch}
              </p>
              <p>
                <span className="font-semibold">Passout Year:</span> {userData.passoutYear}
              </p>
              {userData.linkedUrl ? (
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">LinkedIn:</span>
                  <a href={userData.linkedUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline flex items-center space-x-1">
                    <LinkedinIcon />
                    <span>View Profile</span>
                  </a>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <span className="font-semibold text-gray-700">Add LinkedIn Profile:</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="url"
                      placeholder="e.g., https://linkedin.com/in/yourname"
                      value={newLinkedinUrl}
                      onChange={(e) => setNewLinkedinUrl(e.target.value)}
                      className="flex-grow p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      onClick={handleLinkedinSave}
                      className="py-2 px-4 rounded-md text-sm font-bold text-white bg-green-500 hover:bg-green-600 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <hr className="my-6" />

          {/* User's Posts Section */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">My Interview Posts</h2>
            {filteredPosts.length > 0 ? (
              <div className="space-y-6">
                {filteredPosts.map((post) => (
                  <div key={post._id} className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
                    <div className="flex justify-between items-start mb-4" onClick={()=>navigate(`/interview/${post._id}`)}>
                      <div>
                        <h3 className="text-2xl font-semibold text-gray-800 hover:underline hover:cursor-pointer">{post.companyName}</h3>
                        <p className="text-sm text-gray-500">Posted by {post.name} | {post.branch}</p>
                        <p className="text-sm text-gray-500 mt-1">Applied: {post.appliedOn}</p>
                      </div>
                      <div className='flex gap-2'>
                        {post.isApproved ? <div>Posted</div> : <div>Admin is Reviewing</div> }
                        <div className={`py-1 px-4 rounded-full text-white font-bold text-xs sm:text-sm md:text-base text-center break-words max-w-[150px] 
                          ${post.verdict === "Selected"
                            ? "bg-green-500"
                            : post.verdict === "Not Selected"
                              ? "bg-red-500"
                              : "bg-blue-500"}`}>
                          {post.verdict}
                        </div>
                      </div>
                      
                    </div>

                    <hr className="my-4" />

                    <div className="flex justify-between items-center">
                      <div className="flex space-x-6 items-center">
                        {/* Likes section */}
                        <div className="flex items-center space-x-1 text-gray-600 cursor-pointer">
                          <HeartIcon isLiked={post.likes.includes(currentUser)} />
                          <span>{post.likes.length}</span>
                          <span className="hidden sm:inline">Likes</span>
                        </div>

                        {/* Comments section */}
                        <div
                          className="flex items-center space-x-1 text-gray-600 cursor-pointer"
                          onClick={() => toggleComments(post._id)}
                        >
                          <CommentIcon />
                          <span>{post.comments.length}</span>
                          <span className="hidden sm:inline">Comments</span>
                        </div>
                      </div>
                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdate(post._id)}
                          className="py-1 px-3 rounded-md text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 transition-colors"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handlePostDeleteClick(post._id)}
                          className="py-1 px-3 rounded-md text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    {expandedComments[post._id] && (
                      <div className="mt-4 border-t pt-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Comments</h3>
                        {post.comments.length > 0 ? (
                          post.comments.map((comment, i) => (
                            <div key={i} className="mb-2 flex justify-between items-center">
                              <div>
                                <p className="font-semibold text-gray-700">{comment.name}:</p>
                                <p className="text-gray-600">{comment.comment}</p>
                              </div>
                              <div onClick={() => handleCommentDelete(post._id, i)}>
                                <DeleteIcon />
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">No comments yet.</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 text-gray-500 bg-white rounded-lg shadow-md">
                <p>You haven't posted any interview experiences yet.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl text-center">
            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
            <p className="text-gray-700 mb-6">Are you sure you want to delete this post? This action cannot be undone.</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleConfirmDelete}
                className="py-2 px-4 rounded-md text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={handleCancelDelete}
                className="py-2 px-4 rounded-md text-sm font-bold text-gray-800 bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tailbar / Footer */}
      <footer className="bg-white py-12 text-center text-gray-600 text-sm shadow-inner mt-auto">
        <p className="mb-2 text-base">BroCode. All Rights Reserved. | Connecting students and alumni for a brighter future.</p>
        <p className="text-sm">This platform is a community-driven space for sharing knowledge and experiences. We are not affiliated with any specific company or university.</p>
      </footer>
    </div>
  );
};

export default Profile;
