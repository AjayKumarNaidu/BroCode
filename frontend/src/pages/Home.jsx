import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Home = () => {

  const URI = "https://brocode-t04c.onrender.com";

  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    toast.success('Logout Successfully!');
    navigate('/login');
  }

  const [authorized, setAuthorized] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
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

    fetchAdminDashboard();
  }, []);

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
      <main className="flex-grow flex items-center justify-center p-4 pt-12 my-10 md:my-20">
        <div className="bg-gradient-to-br from-green-500 to-gray-400 p-8 sm:p-12 md:p-16 rounded-lg shadow-xl text-center w-full max-w-2xl text-white">
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4 sm:mb-6">
            {authorized ? 'Welcome Admin' : 'Welcome to BroCode'}
          </h1>
          <p className="text-lg md:text-2xl leading-relaxed mb-6 sm:mb-8">
            This platform is your hub for career insights and knowledge sharing.
          </p>
          <ul className="text-base sm:text-lg leading-relaxed mb-6 sm:mb-8 list-inside text-left">
            <li className="mb-2">Click <span className="text-cyan-200 font-bold hover:cursor-pointer" onClick={()=>navigate('/interviews')}>Interviews</span> to view experiences shared by your fellow bros.</li>
            <li>Click <span className="text-cyan-200 font-bold hover:cursor-pointer" onClick={()=>navigate('/post')}>Post</span> to share your own interview experience with the BroCode community.</li>
          </ul>
          <a href="#" className="inline-block w-full sm:w-auto py-3 px-8 sm:py-4 sm:px-10 rounded-full text-base sm:text-lg font-bold text-green-700 bg-white hover:bg-gray-200 transition-colors shadow-lg transform hover:scale-105" onClick={() => navigate('/interviews')}>
            Get Started
          </a>
        </div>
      </main>

      {/* Tailbar / Footer */}
      <footer className="bg-white py-8 sm:py-12 text-center text-gray-600 text-xs sm:text-sm shadow-inner mt-auto">
        <p className="mb-2 text-sm sm:text-base">BroCode. All Rights Reserved. | Connecting students and alumni for a brighter future.</p>
        <p className="text-xs sm:text-sm">This platform is a community-driven space for sharing knowledge and experiences. We are not affiliated with any specific company or university.</p>
      </footer>
    </div>
  );
};

export default Home;
