import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";

const LoginPage = () => {

  const URI = "http://localhost:5000";

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFormSubmit = async(e) => {
    e.preventDefault();
    // In a real application, you would send this data to an API
    try {
      const newdata = await axios.post(`${URI}/api/user/login`,formData);
      
      if(!newdata.data.success){
        toast.error(newdata.data.message);
        setFormData({
          email: '',
          password: '',
        })
      }else{
        localStorage.setItem('token',newdata.data.message);
        navigate('/');
        toast.success("Login Successfully!");
      }

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">
          Log in
        </h2>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
            <input
              type="email"
              name="email"
              id="email"
              required
              className="mt-1 block w-full px-4 py-2 border-2 border-gray-300 rounded-md bg-white text-gray-900 shadow-sm transition-colors duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              required
              className="mt-1 block w-full px-4 py-2 border-2 border-gray-300 rounded-md bg-white text-gray-900 shadow-sm transition-colors duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-lg text-lg font-bold text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
          >
            Log in
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600 flex flex-col sm:flex-row sm:justify-between">
          <div className="mb-2 sm:mb-0">
            Don't have an account?
            <a className="font-semibold text-green-600 hover:text-green-700 transition-colors ml-1 cursor-pointer" onClick={() => navigate('/register')}>
              Register here.
            </a>
          </div>
          <a className="font-semibold text-red-600 hover:text-red-700 transition-colors cursor-pointer" onClick={() => navigate('/adminLogin')}>
            Admin Login.
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
