import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { jwtDecode } from "jwt-decode";

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

// Helper functions to get unique branches and companies
const getUniqueBranches = (data) => [...new Set(data.map(item => item.branch))];
const getUniqueCompanies = (data) => [...new Set(data.map(item => item.companyName))];

const Interviews = () => {

  //common fields
  const URI = 'https://brocode-t04c.onrender.com'

  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState('');
  const [currentUserData, setCurrentUserData] = useState();

  const [authorized, setAuthorized] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    const fetchAdminDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${URI}/api/user/allowAccess`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setAuthorized(true)
        } else {
          setAuthorized(false)
        }
      } catch (err) {
        setAuthorized(false);
        console.log("Error:", err.message);
      }
    };


    fetchCurrentUserData();
    fetchAdminDashboard();
  }, [currentUser])

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    toast.success('Logout Successfully!');
    navigate('/login');
  }
  //common fields

  const [expandedComments, setExpandedComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [sortBy, setSortBy] = useState("recent");
  const [selectedBranch, setSelectedBranch] = useState("All");
  const [selectedVerdict, setSelectedVerdict] = useState("All");
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [filteredData, setFilteredData] = useState([]);
  const [interviewData, setInterviewData] = useState([]);

  // Get unique filter options from the data
  const branches = ["All", ...getUniqueBranches(interviewData)];
  const companies = ["All", ...getUniqueCompanies(interviewData)];
  const verdicts = ["All", "Selected", "Not Selected", "In Progress"];

  //to get all posts from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const newdata = await axios.get(`${URI}/api/posts/getPosts`)
        setInterviewData(newdata.data.message);
      } catch (error) {
        console.log(error);
      }
    }
    fetchData();
  }, [])

  // Use useEffect to update the filtered data whenever a filter changes
  useEffect(() => {
    let currentData = [...interviewData];

    //filter by isApproved
    currentData = currentData.filter(post => post.isApproved === true)

    // Filter by branch
    if (selectedBranch !== "All") {
      currentData = currentData.filter(post => post.branch === selectedBranch);
    }

    // Filter by verdict
    if (selectedVerdict !== "All") {
      currentData = currentData.filter(post => post.verdict === selectedVerdict);
    }

    // Filter by company
    if (selectedCompany !== "All") {
      currentData = currentData.filter(post => post.companyName === selectedCompany);
    }

    // Sort the data
    if (sortBy === "popular") {
      currentData.sort((a, b) => b.likes.length - a.likes.length);
    } else {
      // By default, sort by most recent (assuming order in array is by date)
      currentData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredData(currentData);
  }, [sortBy, selectedBranch, selectedVerdict, selectedCompany, interviewData]);


  const toggleComments = (id) => {
    setExpandedComments(prevState => ({
      ...prevState,
      [id]: !prevState[id]
    }));
  };

  //toggleLikes
  const toggleLike = async (id) => {
    const post = interviewData.find(p => p._id === id);
    if (!post) return;

    const isLiked = post.likes.includes(currentUser);
    const endpoint = isLiked ? `${URI}/api/posts/removeLike/${id}` : `${URI}/api/posts/addLike/${id}`;

    try {
      const response = await axios.put(endpoint, {
        name: currentUser,
      });


      // Update local state only on successful API response
      if (response.data.success) {
        setInterviewData(prevPosts => {
          return prevPosts.map(p => {
            if (p._id === id) {
              const updatedLikes = isLiked
                ? p.likes.filter(user => user !== currentUser)
                : [...p.likes, currentUser];
              return { ...p, likes: updatedLikes };
            }
            return p;
          });
        });
      }

    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleCommentSubmit = async (postId) => {

    if (!newComment.trim()) return; // Prevent empty comments

    try {
      const response = await axios.put(`${URI}/api/posts/addComment/${postId}`, {
        name: currentUserData.name, // Assuming your API accepts 'name' for the commenter
        comment: newComment,
      });

      if (response.data.success) {
        setInterviewData(prevPosts => {
          return prevPosts.map(p => {
            if (p._id === postId) {
              return {
                ...p,
                comments: [...p.comments, { name: currentUserData.name, comment: newComment }]
              };
            }
            return p;
          });
        });
      }
      setNewComment(''); // Clear the text field after posting

    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };


  const clearFilters = () => {
    setSelectedBranch("All");
    setSelectedVerdict("All");
    setSelectedCompany("All");
  };

  const NavLink = ({ to, text, isButton = false, isAdmin = false, onClick }) => {
    const classes = `font-semibold transition-colors cursor-pointer ${isAdmin ? 'text-red-500 hover:text-green-600' : 'text-gray-800 hover:text-green-600'
      } ${isButton ? 'py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-bold text-white bg-green-500 hover:bg-green-600 hover:text-white' : 'text-xs sm:text-base'
      }`;

    const handleClick = (e) => {
      if (onClick) {
        onClick(e);
      } else {
        navigate(to);
      }
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

        {/* Admin & User Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {authorized && (
            <div className="hidden sm:flex items-center space-x-2 sm:space-x-6">
              <NavLink to="/allowAccess" text="Allow Access" isAdmin={true} />
              <NavLink to="/allowFeedback" text="View Feedback" isAdmin={true} />
            </div>
          )}
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
          {authorized && (
            <>
              <NavLink to="/allowAccess" text="Allow Access" isAdmin={true} />
              <NavLink to="/allowFeedback" text="View Feedback" isAdmin={true} />
            </>
          )}
          <NavLink to="/post" text="Post" isButton={true} />
          <NavLink to="/profile" text="Profile" isButton={true} />
          <NavLink text="Logout" isButton={true} onClick={handleLogout} />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center p-6 pt-8 mt-10 md:mt-20">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Interview Experiences</h1>

        {/* Filter Section - Made into a single line */}
        <div className="w-full max-w-4xl p-4 md:p-6 mb-8 bg-white rounded-lg shadow-md flex flex-wrap items-center justify-center space-x-2 md:space-x-4">
          <span className="text-gray-700 font-semibold hidden md:inline">Sort by:</span>
          <button
            onClick={() => setSortBy("recent")}
            className={`py-2 px-4 rounded-full text-sm font-bold transition-colors ${sortBy === "recent" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
          >
            Recent
          </button>
          <button
            onClick={() => setSortBy("popular")}
            className={`py-2 px-4 rounded-full text-sm font-bold transition-colors ${sortBy === "popular" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
          >
            Popular
          </button>

          {/* Branch Filter */}
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="p-2 border rounded-md text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="All">All Branches</option>
            {branches.slice(1).map(branch => (
              <option key={branch} value={branch}>{branch}</option>
            ))}
          </select>

          {/* Verdict Filter */}
          <select
            value={selectedVerdict}
            onChange={(e) => setSelectedVerdict(e.target.value)}
            className="p-2 border rounded-md text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="All">All Verdicts</option>
            {verdicts.slice(1).map(verdict => (
              <option key={verdict} value={verdict}>{verdict}</option>
            ))}
          </select>

          {/* Company Filter */}
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="p-2 border rounded-md text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 mt-4 md:mt-0"
          >
            <option value="All">All Companies</option>
            {companies.slice(1).map(company => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>

          {/* Clear Filters Button */}
          <button
            onClick={clearFilters}
            className="py-2 px-4 rounded-full text-sm font-bold transition-colors bg-gray-200 text-gray-800 hover:bg-gray-300 mt-4 md:mt-0"
          >
            Clear Filters
          </button>
        </div>

        <div className="w-full max-w-4xl space-y-6">
          {filteredData.length > 0 ? (
            filteredData.map((post, index) => (
              <div key={post._id} className="bg-white p-8 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300" >
                <div className="flex justify-between items-start mb-4" onClick={() => navigate(`/interview/${post._id}`)}>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800 hover:underline cursor-pointer" >{post.companyName}</h2>
                    <p className="text-sm text-gray-500">Posted by {post.name} | {post.branch}</p>
                    <p className="text-sm text-gray-500 mt-1">Applied: {post.appliedOn}</p>
                  </div>
                  <div className={`py-1 px-4 rounded-full text-white font-bold text-sm ${post.verdict === "Selected" ? "bg-green-500" : post.verdict === "Not Selected" ? "bg-red-500" : "bg-blue-500"}`}>
                    {post.verdict}
                  </div>
                </div>

                <hr className="my-4" />

                <div className="flex space-x-6 items-center">
                  {/* Likes section */}
                  <div
                    className="flex items-center space-x-1 text-gray-600 cursor-pointer"
                    onClick={() => toggleLike(post._id)}
                  >
                    <HeartIcon isLiked={post.likes.includes(currentUser)} />
                    <span>{post.likes.length} Likes</span>
                  </div>

                  {/* Comments section */}
                  <div className="flex items-center space-x-1 text-gray-600 cursor-pointer" onClick={() => toggleComments(post._id)}>
                    <CommentIcon />
                    <span>{post.comments.length} Comments</span>
                  </div>
                </div>

                {/* Expandable comments */}
                {expandedComments[post._id] && (
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
                        onClick={() => handleCommentSubmit(post._id)}
                        className="py-2 px-4 rounded-md text-sm font-bold text-white bg-green-500 hover:bg-green-600 transition-colors"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center p-8 text-gray-500">
              <p>No interview experiences found for the selected filters.</p>
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
};

export default Interviews;
