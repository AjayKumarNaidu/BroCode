import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';

const Feedback = () => {

  //common fields
  const URI = 'http://localhost:5000'

  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState('');
  const [currentUserData, setCurrentUserData] = useState();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      console.log(decoded.email); // 👉 email from payload
      setCurrentUser(decoded.email);
    }

    const fetchCurrentUserData = async () => {
      try {
        const newdata = await axios.get(`${URI}/api/user/user/${currentUser}`);
        if (newdata.data.success) {
          console.log('user data:', newdata.data.message);
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
    navigate('/login');
  }
  //common fields

  const [feedback, setFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    setFeedback(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (feedback.trim() === '') return;

    try {
      const newdata = await axios.post(`${URI}/api/feedback/post`, { name: currentUserData.name, email: currentUserData.email, feedback });
      if (newdata.data.success) {
        // Log the feedback to the console as a placeholder for a backend call
        console.log('Feedback Submitted:', feedback);

        setIsSubmitted(true);
        setFeedback('');

        setTimeout(() => {
          setIsSubmitted(false);
        }, 3000);
      }
    } catch (error) {
      return console.log(error.message)
    }
  };

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
        <div className="w-full max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 text-center">Share Your Feedback</h1>
          <p className="text-gray-600 text-center mb-10">We would love to hear your thoughts on how we can improve BroCode for you and other users.</p>

          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
            <div>
              <label htmlFor="feedback" className="block text-gray-700 font-bold mb-2">Your Feedback</label>
              <textarea
                id="feedback"
                name="feedback"
                value={feedback}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="8"
                placeholder="Tell us what you love, what you think could be improved, or any bugs you've found."
                required
              ></textarea>
            </div>

            {isSubmitted && (
              <div className="bg-green-100 p-4 rounded-lg text-green-800 text-sm font-bold text-center">
                Thank you for your feedback! We appreciate you.
              </div>
            )}

            <div className="flex justify-center mt-8">
              <button
                type="submit"
                className="w-full py-3 px-8 rounded-full text-lg font-bold text-white bg-green-500 hover:bg-green-600 transition-colors shadow-lg"
              >
                Submit Feedback
              </button>
            </div>
          </form>
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

export default Feedback;
