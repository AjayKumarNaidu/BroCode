import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const LoginPage = () => {

  const URI = "http://localhost:5000";

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    secretKey: '',
    otp:''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleOtpSent = async() => {
    try {
      const newdata = await axios.post(`${URI}/api/user/send-otp`,{email:formData.email,secretKey:formData.secretKey});
      if(newdata.data.success){
        toast.success(newdata.data.message);
      }else{
        toast.error(newdata.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const handleFormSubmit = async(e) => {
    e.preventDefault();
    // In a real application, you would send this data to an API
    try {
      const newdata = await axios.post(`${URI}/api/user/adminLogin`,{email:formData.email,otp:formData.otp});
      
      if(!newdata.data.success){
        toast.error(newdata.data.message);
        setFormData({
          email: '',
          secretKey: '',
          otp:''
        })
      }else{
        localStorage.setItem('token',newdata.data.message);
        console.log('admin token : ',newdata.data.message);
        navigate('/');
        toast.success('Admin Login successful');
      }

    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">
          Admin Log in
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
            <label htmlFor="secretKey" className="block text-sm font-medium text-gray-700">Secret Key</label>
            <input
              type="text"
              name="secretKey"
              id="secretKey"
              required
              className="mt-1 block w-full px-4 py-2 border-2 border-gray-300 rounded-md bg-white text-gray-900 shadow-sm transition-colors duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={formData.secretKey}
              onChange={handleInputChange}
            />
          </div>

          <div className='flex justify-end'>
            <button className='w-20% flex justify-center py-1 px-2 border border-transparent rounded-md shadow-lg text-sm font-bold text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200' onClick={handleOtpSent}>
              Send Otp
            </button>
          </div>

          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">OTP</label>
            <input
              type="text"
              name="otp"
              id="otp"
              required
              className="mt-1 block w-full px-4 py-2 border-2 border-gray-300 rounded-md bg-white text-gray-900 shadow-sm transition-colors duration-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={formData.otp}
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

        <p className="mt-6 text-center text-sm text-gray-600">
          Login as User ?
          <a className="font-semibold text-green-600 hover:text-green-700 transition-colors ml-1 cursor-pointer" onClick={() => navigate('/login')}>
            Login here.
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
